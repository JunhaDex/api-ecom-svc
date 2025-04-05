import { google } from 'googleapis';
import * as fs from 'fs/promises';
import * as path from 'path';

export class SheetsProvider {
  constructor() {}

  async bootstrap() {
    const auth = new google.auth.JWT({
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const credPath = path.resolve(process.env.SHEET_KEYFILE_LOCATION);
    const credFile = await fs.readFile(credPath, 'utf8');
    const cred = JSON.parse(credFile);

    auth.fromJSON(cred);
    return google.sheets({ version: 'v4', auth });
  }

  private indexToLetter(index: number): string {
    let letter = '';
    while (index > 0) {
      const asc = (index - 1) % 26;
      letter = String.fromCharCode(asc + 65) + letter;
      index = (index - asc - 1) / 26;
    }
    return letter;
  }

  // async writeToSheet() {
  //   const sheets = await this.bootstrap();
  //   const spreadsheetId = process.env.AUDIT_DOC_ID;
  //   const tempData = ['hello', 'world!'];
  //   await sheets.spreadsheets.values.update({
  //     spreadsheetId,
  //     range: 'Sync!A1:B1',
  //     valueInputOption: 'RAW',
  //     requestBody: {
  //       values: [tempData],
  //     },
  //   });
  // }

  async findNextEmpty(
    sheet: string,
    timestamp: string,
  ): Promise<{
    index: number;
    timestamp: string;
  }> {
    const sheets = await this.bootstrap();
    const spreadsheetId = process.env.AUDIT_DOC_ID;
    const columnAResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheet}!A:A`,
    });

    const columnAValues = columnAResponse.data.values || [];
    if (columnAValues.length > 2) {
      const row1Response = await sheets.spreadsheets.values.batchGet({
        spreadsheetId,
        ranges: [
          `${sheet}!A1:Z1`,
          `A${columnAValues.length}:Z${columnAValues.length}`,
        ],
      });
      const headerValue = row1Response.data.valueRanges[0]?.values[0] || [];
      const dataValue = row1Response.data.valueRanges[1]?.values[0] || [];
      const headerIndex = headerValue.findIndex((item) => item === timestamp);
      return {
        index: columnAValues.length + 1,
        timestamp: dataValue[headerIndex],
      };
    } else {
      return {
        index: columnAValues.length + 1,
        timestamp: '',
      };
    }
  }

  async writeToSheet<T extends Record<string, any>>(
    sheet: string,
    nextRaw: number,
    header: Record<keyof T, string>,
    data: T[],
  ) {
    const sheets = await this.bootstrap();
    const spreadsheetId = process.env.AUDIT_DOC_ID;

    // 1. Count headers and read range A1:{count}2
    const headerKeys = Object.keys(header);
    const endColumn = this.indexToLetter(headerKeys.length);

    // Read the header row
    const headerRange = `${sheet}!A1:${endColumn}2`;
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: headerRange,
    });

    const headerRows = headerResponse.data.values || [[], []];

    // 2. Compare row 1 with Object.keys(headers)
    if (headerRows[0].length > 0) {
      for (let i = 0; i < headerKeys.length; i++) {
        if (headerRows[0][i] !== headerKeys[i]) {
          throw new Error('Header not matching');
        }
      }
    } else {
      const headerValues = headerKeys.map((key) => header[key]);
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheet}!A1:${endColumn}2`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [headerKeys, headerValues],
        },
      });
    }
    if (data.length === 0) {
      return; // No data to write
    }
    const dataToWrite = data.map((item) => {
      // Create a row that matches the header order
      return headerKeys.map((key) => item[key] ?? '');
    });

    // Update the sheet with the new data
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheet}!A${nextRaw}:${endColumn}${nextRaw + data.length - 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: dataToWrite,
      },
    });
  }
}
