import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { Permission } from './entities/permission.entity';
import { RolePermission } from '../role/entities/role-permission.entity';
import { PermissionSnapshotService } from './permission-snapshot.service';
import { RedisModule } from '../../shared/redis/redis.module';
import { UserModule } from '../user/user.module';
import { RoleModule } from '../role/role.module';
import { PolicyModule } from '../policy/policy.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission, RolePermission]),
    RedisModule,
    UserModule,
    RoleModule,
    PolicyModule,
  ],
  controllers: [PermissionController],
  providers: [PermissionService, PermissionSnapshotService],
  exports: [PermissionService, PermissionSnapshotService],
})
export class PermissionModule {}
