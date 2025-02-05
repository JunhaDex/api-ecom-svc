import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AdminService } from '@/resources/admin/admin.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly adminService: AdminService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = (req.headers['authorization']?.split(' ') ?? [])[1];
    if (token) {
      try {
        const vfr = await this.jwtService.verifyAsync(token);
        if (vfr) {
          if (vfr.type !== 'admin') return false; // check admin auth
          const admin = await this.adminService.getAdmin(vfr.sub);
          if (admin) {
            req['admin'] = admin;
            return true;
          }
        }
      } catch (e) {
        console.error('ADMIN GUARD :::::: ', e.message);
      }
    }
    return false;
  }
}
