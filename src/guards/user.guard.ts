import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '@/resources/user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = (req.headers['authorization']?.split(' ') ?? [])[1];
    if (token) {
      try {
        const vfr = await this.jwtService.verifyAsync(token);
        if (vfr) {
          const user = await this.userService.getUser(vfr.sub);
          if (user) {
            req['user'] = user;
            return true;
          }
        }
      } catch (e) {
        Logger.error('USER GUARD :::::: ', e.message);
        if (e.message.includes('jwt expired')) {
          throw new UnauthorizedException();
        }
        throw new InternalServerErrorException();
      }
    }
    throw new ForbiddenException();
  }
}
