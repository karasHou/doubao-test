import { useAuthStore } from '../store/auth';

export class PermissionService {
  private authStore = useAuthStore();

  /**
   * 检查用户是否有指定权限
   */
  hasPermission(permissionCode: string): boolean {
    if (!this.authStore.userPermissions) {
      return false;
    }

    // 检查用户权限列表
    return this.authStore.userPermissions.some(
      (permission: any) => permission.code === permissionCode
    );
  }

  /**
   * 检查用户是否有任意一个指定权限
   */
  hasAnyPermission(permissionCodes: string[]): boolean {
    return permissionCodes.some(code => this.hasPermission(code));
  }

  /**
   * 检查用户是否有所有指定权限
   */
  hasAllPermissions(permissionCodes: string[]): boolean {
    return permissionCodes.every(code => this.hasPermission(code));
  }

  /**
   * 检查用户是否有指定角色
   */
  hasRole(roleCode: string): boolean {
    if (!this.authStore.userRoles) {
      return false;
    }

    return this.authStore.userRoles.some(
      (role: any) => role.code === roleCode
    );
  }

  /**
   * 检查用户是否有任意一个指定角色
   */
  hasAnyRole(roleCodes: string[]): boolean {
    return roleCodes.some(code => this.hasRole(code));
  }
}
