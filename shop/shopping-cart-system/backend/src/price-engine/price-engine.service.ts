import { Injectable } from '@nestjs/common';

// 促销规则类型
export enum PromotionType {
  DIRECT_DISCOUNT = 'DIRECT_DISCOUNT', // 直降
  PERCENTAGE_DISCOUNT = 'PERCENTAGE_DISCOUNT', // 折扣
  MIN_PURCHASE_DISCOUNT = 'MIN_PURCHASE_DISCOUNT', // 满减
  MIN_PURCHASE_PERCENTAGE = 'MIN_PURCHASE_PERCENTAGE', // 满折
  COUPON = 'COUPON', // 优惠券
}

// 促销规则
export interface PromotionRule {
  id: string;
  type: PromotionType;
  name: string;
  description: string;
  value: number; // 折扣值或金额
  minAmount?: number; // 最低消费金额（满减/满折）
  maxDiscount?: number; // 最大折扣金额
  applicableCategories?: string[]; // 适用品类
  isStackable: boolean; // 是否可叠加
}

// 购物车项目
export interface CartItem {
  id: string;
  productId: string;
  skuId: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  attributes: Record<string, string>;
}

// 价格计算结果
export interface PriceCalculationResult {
  subtotal: number; // 小计
  totalDiscount: number; // 总折扣
  total: number; // 最终价格
  breakdown: {
    subtotal: number;
    discounts: Array<{
      promotionId: string;
      promotionName: string;
      amount: number;
    }>;
    total: number;
  };
}

@Injectable()
export class PriceEngineService {
  // 模拟促销规则数据库
  private promotionRules: PromotionRule[] = [
    // 满100减20
    {
      id: 'P1',
      type: PromotionType.MIN_PURCHASE_DISCOUNT,
      name: '满100减20',
      description: '购物满100元立减20元',
      value: 20,
      minAmount: 100,
      isStackable: true,
    },
    // 满200打8折
    {
      id: 'P2',
      type: PromotionType.MIN_PURCHASE_PERCENTAGE,
      name: '满200打8折',
      description: '购物满200元享受8折优惠',
      value: 0.8,
      minAmount: 200,
      maxDiscount: 50,
      isStackable: true,
    },
    // 新人优惠券 - 10元
    {
      id: 'P3',
      type: PromotionType.COUPON,
      name: '新人优惠券',
      description: '新用户专享10元优惠券',
      value: 10,
      isStackable: true,
    },
    // 电子产品9折
    {
      id: 'P4',
      type: PromotionType.PERCENTAGE_DISCOUNT,
      name: '电子产品优惠',
      description: '所有电子产品享受9折优惠',
      value: 0.9,
      applicableCategories: ['electronics'],
      isStackable: false,
    },
  ];

  /**
   * 计算购物车价格
   */
  calculatePrice(cartItems: CartItem[], appliedCoupons: string[] = []): PriceCalculationResult {
    const subtotal = this.calculateSubtotal(cartItems);
    const applicableRules = this.getApplicableRules(cartItems, appliedCoupons);
    const discountResult = this.applyPromotions(subtotal, cartItems, applicableRules);

    return {
      subtotal,
      totalDiscount: discountResult.totalDiscount,
      total: Math.max(0, subtotal - discountResult.totalDiscount),
      breakdown: {
        subtotal,
        discounts: discountResult.discounts,
        total: Math.max(0, subtotal - discountResult.totalDiscount),
      },
    };
  }

  /**
   * 计算小计
   */
  private calculateSubtotal(cartItems: CartItem[]): number {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  /**
   * 获取适用的促销规则
   */
  private getApplicableRules(cartItems: CartItem[], appliedCoupons: string[]): PromotionRule[] {
    const rules: PromotionRule[] = [];
    const categories = new Set(cartItems.map(item => item.category));

    // 添加所有全局规则
    for (const rule of this.promotionRules) {
      // 检查优惠券是否被应用
      if (rule.type === PromotionType.COUPON) {
        if (appliedCoupons.includes(rule.id)) {
          rules.push(rule);
        }
        continue;
      }

      // 检查品类适用性
      if (rule.applicableCategories) {
        const hasMatchingCategory = rule.applicableCategories.some(cat => categories.has(cat));
        if (!hasMatchingCategory) {
          continue;
        }
      }

      rules.push(rule);
    }

    return rules;
  }

  /**
   * 应用促销规则
   */
  private applyPromotions(
    subtotal: number,
    cartItems: CartItem[],
    rules: PromotionRule[],
  ): { totalDiscount: number; discounts: Array<{ promotionId: string; promotionName: string; amount: number }> } {
    let totalDiscount = 0;
    const discounts: Array<{ promotionId: string; promotionName: string; amount: number }> = [];

    // 按规则类型分组
    const nonStackableRules = rules.filter(r => !r.isStackable);
    const stackableRules = rules.filter(r => r.isStackable);

    // 应用非叠加规则（选择最优的）
    if (nonStackableRules.length > 0) {
      let bestDiscount = 0;
      let bestRule: PromotionRule | null = null;

      for (const rule of nonStackableRules) {
        const discount = this.calculateRuleDiscount(subtotal, cartItems, rule);
        if (discount > bestDiscount) {
          bestDiscount = discount;
          bestRule = rule;
        }
      }

      if (bestRule && bestDiscount > 0) {
        totalDiscount += bestDiscount;
        discounts.push({
          promotionId: bestRule.id,
          promotionName: bestRule.name,
          amount: bestDiscount,
        });
      }
    }

    // 应用叠加规则
    for (const rule of stackableRules) {
      const discount = this.calculateRuleDiscount(subtotal, cartItems, rule);
      if (discount > 0) {
        totalDiscount += discount;
        discounts.push({
          promotionId: rule.id,
          promotionName: rule.name,
          amount: discount,
        });
      }
    }

    // 确保折扣不超过小计
    totalDiscount = Math.min(totalDiscount, subtotal);

    return { totalDiscount, discounts };
  }

  /**
   * 计算单个规则的折扣金额
   */
  private calculateRuleDiscount(subtotal: number, cartItems: CartItem[], rule: PromotionRule): number {
    switch (rule.type) {
      case PromotionType.DIRECT_DISCOUNT:
        return rule.value;

      case PromotionType.PERCENTAGE_DISCOUNT:
        // 如果有适用品类，只计算该品类的折扣
        if (rule.applicableCategories) {
          const categoryTotal = cartItems
            .filter(item => rule.applicableCategories!.includes(item.category))
            .reduce((sum, item) => sum + item.price * item.quantity, 0);
          return categoryTotal * (1 - rule.value);
        }
        return subtotal * (1 - rule.value);

      case PromotionType.MIN_PURCHASE_DISCOUNT:
        if (subtotal >= (rule.minAmount || 0)) {
          return Math.min(rule.value, subtotal);
        }
        return 0;

      case PromotionType.MIN_PURCHASE_PERCENTAGE:
        if (subtotal >= (rule.minAmount || 0)) {
          const discount = subtotal * (1 - rule.value);
          return rule.maxDiscount ? Math.min(discount, rule.maxDiscount) : discount;
        }
        return 0;

      case PromotionType.COUPON:
        return Math.min(rule.value, subtotal);

      default:
        return 0;
    }
  }

  /**
   * 获取所有促销规则
   */
  getAllPromotions(): PromotionRule[] {
    return this.promotionRules;
  }

  /**
   * 获取优惠券列表
   */
  getCoupons(): PromotionRule[] {
    return this.promotionRules.filter(rule => rule.type === PromotionType.COUPON);
  }
}
