import { Injectable } from '@nestjs/common';

@Injectable()
export class GroupService {
  async createGroup() {
    return 'Create Group';
  }

  async getGroupList() {}

  async getGroup() {}

  async updateGroup() {}

  async addGroupMember() {}

  async addGroupProduct() {}

  async deleteGroup() {}
}
