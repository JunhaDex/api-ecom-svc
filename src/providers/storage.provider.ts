import { Storage } from '@google-cloud/storage';
import { MultipartFile } from '@fastify/multipart';

export class StorageProvider {
  constructor() {}

  async uploadProductImage(
    files: MultipartFile[],
    folder: string,
  ): Promise<string[]> {
    const storage = new Storage({
      keyFilename: process.env.GCP_KEYFILE_LOCATION,
    });
    const bucket = storage.bucket(process.env.GCP_BUCKET_NAME);
    const result: string[] = [];
    for (const file of files) {
      const blob = bucket.file(`${folder}/${file.filename}`);
      await blob.save(await file.toBuffer(), {
        contentType: file.mimetype || 'application/octet-stream',
        metadata: {
          contentDisposition: `inline; filename="${file.filename}"`,
        },
      });
      result.push(`${process.env.CDN_URL}/${folder}/${file.filename}`);
    }
    return result;
  }
}
