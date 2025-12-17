import { Injectable } from '@nestjs/common';
import { RedisService } from '../../shared/redis/redis.service';
import { UserService } from '../user/user.service';
import { RoleService } from '../role/role.service';
import { PermissionService } from './permission.service';
import { PolicyService } from '../policy/policy.service';

@Injectable()
export class PermissionSnapshotService {
  private readonly CACHE_TTL = 24 * 60 * 60; // 24小时

  constructor(
    private readonly redisService: RedisService,
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionService,
    private readonly policyService: PolicyService,
  ) {}

  async generateSnapshot(userId: number): Promise<any> {
    const user = await this.userService.findOne(userId);
    
    // 获取用户角色
    const roleIds = user.userRoles.map(ur => ur.roleId);
    
    // 获取角色对应的权限
    const permissions = await this.permissionService.findPermissionsByRoleIds(roleIds);
    
    // 获取角色对应的策略
    const policies = await this.policyService.findPoliciesByRoleIds(roleIds);
    
    // 获取用户直接关联的策略
    const userPolicies = await this.policyService.findPoliciesByUserId(userId);
    
    // 合并策略
    const allPolicies = [...policies, ...userPolicies];
    
    // 构建权限快照
    const snapshot = {
      userId,
      roles: user.userRoles.map(ur => ({
        id: ur.role.id,
        name: ur.role.name,
        code: ur.role.code,
      })),
      permissions: permissions.map(p => ({
        id: p.id,
        name: p.name,
        code: p.code,
        type: p.type,
        category: p.category,
        path: p.path,
        component: p.component,
        icon: p.icon,
      })),
      policies: allPolicies.map(p => ({
        id: p.id,
        name: p.name,
        code: p.code,
        effect: p.effect,
        conditions: p.conditions,
        actions: p.actions,
        resources: p.resources,
      })),
      createdAt: Date.now(),
      expiresAt: Date.now() + this.CACHE_TTL * 1000,
    };

    // 缓存权限快照
    await this.redisService.set(
      `permission_snapshot:${userId}`,
      JSON.stringify(snapshot),
      this.CACHE_TTL,
    );

    return snapshot;
  }

  async getSnapshot(userId: number): Promise<any> {
    // 尝试从缓存获取
    const cachedSnapshot = await this.redisService.get(`permission_snapshot:${userId}`);
    
    if (cachedSnapshot) {
      const snapshot = JSON.parse(cachedSnapshot);
      // 检查是否过期
      if (snapshot.expiresAt > Date.now()) {
        return snapshot;
      }
    }

    // 缓存不存在或已过期，重新生成
    return this.generateSnapshot(userId);
  }

  async clearSnapshot(userId: number): Promise<void> {
    await this.redisService.del(`permission_snapshot:${userId}`);
  }

  async clearAllSnapshots(): Promise<void> {
    const keys = await this.redisService.keys('permission_snapshot:*');
    if (keys.length > 0) {
      await this.redisService.del(...keys);
    }
  }
}
