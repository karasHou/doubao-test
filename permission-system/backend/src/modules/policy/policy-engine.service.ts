import { Injectable } from '@nestjs/common';

@Injectable()
export class PolicyEngineService {
  /**
   * 评估 ABAC 策略
   * @param context 评估上下文
   * @param policies 策略列表
   * @returns 评估结果
   */
  async evaluate(context: any, policies?: any[]): Promise<{ allowed: boolean; reasons: string[] }> {
    const reasons: string[] = [];
    let allowed = true;

    // 如果没有指定策略，默认允许
    if (!policies || policies.length === 0) {
      return { allowed: true, reasons: ['没有适用的策略，默认允许'] };
    }

    // 遍历所有策略进行评估
    for (const policy of policies) {
      if (!this.isPolicyApplicable(policy, context)) {
        continue;
      }

      const policyResult = this.evaluateSinglePolicy(policy, context);
      
      if (policyResult.allowed) {
        reasons.push(`策略 ${policy.name} (${policy.code}) 允许访问`);
      } else {
        reasons.push(`策略 ${policy.name} (${policy.code}) 拒绝访问`);
        allowed = false; // 只要有一个策略拒绝，最终结果就是拒绝
      }
    }

    // 如果没有策略被应用，默认允许
    if (reasons.length === 0) {
      allowed = true;
      reasons.push('没有适用的策略，默认允许');
    }

    return { allowed, reasons };
  }

  /**
   * 检查策略是否适用于当前上下文
   */
  private isPolicyApplicable(policy: any, context: any): boolean {
    // 检查动作是否匹配
    if (policy.actions && policy.actions.length > 0) {
      const actionMatch = policy.actions.some((action: string) => 
        action === context.action || action === '*'
      );
      if (!actionMatch) {
        return false;
      }
    }

    // 检查资源是否匹配
    if (policy.resources && policy.resources.length > 0) {
      const resourceMatch = policy.resources.some((resource: string) => 
        resource === context.resource || resource === '*'
      );
      if (!resourceMatch) {
        return false;
      }
    }

    return true;
  }

  /**
   * 评估单个策略
   */
  private evaluateSinglePolicy(policy: any, context: any): { allowed: boolean } {
    // 如果没有条件，直接返回策略的 effect
    if (!policy.conditions || Object.keys(policy.conditions).length === 0) {
      return { allowed: policy.effect === 'allow' };
    }

    // 评估条件
    const conditionsMet = this.evaluateConditions(policy.conditions, context);
    
    // 如果条件满足，返回策略的 effect；否则返回相反的结果
    return { allowed: conditionsMet ? policy.effect === 'allow' : policy.effect !== 'allow' };
  }

  /**
   * 评估策略条件
   */
  private evaluateConditions(conditions: any, context: any): boolean {
    // 支持多种条件组合方式：and/or/not
    if (conditions.and) {
      return conditions.and.every((condition: any) => this.evaluateConditions(condition, context));
    }

    if (conditions.or) {
      return conditions.or.some((condition: any) => this.evaluateConditions(condition, context));
    }

    if (conditions.not) {
      return !this.evaluateConditions(conditions.not, context);
    }

    // 基本条件评估
    return this.evaluateBasicCondition(conditions, context);
  }

  /**
   * 评估基本条件
   */
  private evaluateBasicCondition(condition: any, context: any): boolean {
    const { attribute, operator, value } = condition;
    
    // 从上下文中获取属性值
    const attributeValue = this.extractAttributeValue(attribute, context);
    
    // 根据操作符评估条件
    switch (operator) {
      case 'eq': // 等于
        return attributeValue === value;
      
      case 'ne': // 不等于
        return attributeValue !== value;
      
      case 'gt': // 大于
        return attributeValue > value;
      
      case 'gte': // 大于等于
        return attributeValue >= value;
      
      case 'lt': // 小于
        return attributeValue < value;
      
      case 'lte': // 小于等于
        return attributeValue <= value;
      
      case 'in': // 包含在列表中
        return Array.isArray(value) && value.includes(attributeValue);
      
      case 'notin': // 不包含在列表中
        return !Array.isArray(value) || !value.includes(attributeValue);
      
      case 'contains': // 包含子字符串
        return typeof attributeValue === 'string' && attributeValue.includes(value);
      
      default:
        throw new Error(`不支持的操作符: ${operator}`);
    }
  }

  /**
   * 从上下文中提取属性值
   */
  private extractAttributeValue(attributePath: string, context: any): any {
    // 支持点符号表示法，如 "user.age" 或 "environment.ip"
    const parts = attributePath.split('.');
    let value = context;
    
    for (const part of parts) {
      if (value === null || value === undefined || typeof value !== 'object') {
        return undefined;
      }
      value = value[part];
    }
    
    return value;
  }
}
