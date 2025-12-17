import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { Role } from './entities/role.entity';
import { UserRole } from '../user/entities/user-role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { RolePolicy } from './entities/role-policy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, UserRole, RolePermission, RolePolicy])],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
