import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  async createUser() {
    return 'Create User';
  }

  async getUserList() {}

  async getUser() {}

  async updateUserPwd() {}

  async updateUserInfo() {}

  async deleteUser() {}
}
