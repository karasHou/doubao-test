import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { PermissionModule } from './modules/permission/permission.module';
import { PolicyModule } from './modules/policy/policy.module';
import { RedisModule } from './shared/redis/redis.module';

@Module({
  imports: [
    // 数据库连接
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'permission_system',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production', // 生产环境关闭自动同步
      logging: process.env.NODE_ENV === 'development',
    }),
    
    // Redis 缓存
    RedisModule,
    
    // 业务模块
    AuthModule,
    UserModule,
    RoleModule,
    PermissionModule,
    PolicyModule,
  ],
})
export class AppModule {}
