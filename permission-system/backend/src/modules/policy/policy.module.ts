import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyService } from './policy.service';
import { PolicyController } from './policy.controller';
import { Policy } from './entities/policy.entity';
import { UserPolicy } from './entities/user-policy.entity';
import { RolePolicy } from '../role/entities/role-policy.entity';
import { PolicyEngineService } from './policy-engine.service';

@Module({
  imports: [TypeOrmModule.forFeature([Policy, UserPolicy, RolePolicy])],
  controllers: [PolicyController],
  providers: [PolicyService, PolicyEngineService],
  exports: [PolicyService, PolicyEngineService],
})
export class PolicyModule {}
