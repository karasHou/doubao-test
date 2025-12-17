import type { Directive, DirectiveBinding } from 'vue';
import { PermissionService } from '../utils/permission';

/**
 * 按钮级权限指令
 * 使用方式：v-permission="'permission:code'" 或 v-permission="['code1', 'code2']"
 */
export const permissionDirective: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const permissionService = new PermissionService();
    const { value } = binding;
    
    if (!value) return;
    
    let hasPermission = false;
    
    if (typeof value === 'string') {
      // 单权限检查
      hasPermission = permissionService.hasPermission(value);
    } else if (Array.isArray(value)) {
      // 多权限检查（任意一个）
      hasPermission = permissionService.hasAnyPermission(value);
    }
    
    if (!hasPermission) {
      // 如果没有权限，隐藏元素
      el.style.display = 'none';
    }
  },
};

// 导出安装函数
export function installPermissionDirective(app: any) {
  app.directive('permission', permissionDirective);
}

export default installPermissionDirective;
