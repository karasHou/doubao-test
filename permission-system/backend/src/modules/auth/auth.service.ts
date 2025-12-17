import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';
import { PermissionSnapshotService } from '../permission/permission-snapshot.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly permissionSnapshotService: PermissionSnapshotService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByUsername(username);
    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    const permissions = await this.permissionSnapshotService.generateSnapshot(user.id);
    
    return {
      access_token: this.jwtService.sign(payload),
      user,
      permissions,
    };
  }

  async getUserPermissions(userId: number) {
    return this.permissionSnapshotService.getSnapshot(userId);
  }
}
