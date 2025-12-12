// SKU 属性
export interface SkuAttribute {
  name: string;
  value: string;
}

// SKU 信息
export interface Sku {
  id: string;
  productId: string;
  price: number;
  attributes: SkuAttribute[];
  stock: number;
  isAvailable: boolean;
}

// 商品信息
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  skuAttributes: Array<{
    name: string;
    values: string[];
  }>;
  skus: Sku[];
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
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
  subtotal: number;
  totalDiscount: number;
  total: number;
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

// 购物车
export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  appliedCoupons: string[];
  priceCalculation?: PriceCalculationResult;
  createdAt: Date;
  updatedAt: Date;
}

// 促销规则
export enum PromotionType {
  DIRECT_DISCOUNT = 'DIRECT_DISCOUNT',
  PERCENTAGE_DISCOUNT = 'PERCENTAGE_DISCOUNT',
  MIN_PURCHASE_DISCOUNT = 'MIN_PURCHASE_DISCOUNT',
  MIN_PURCHASE_PERCENTAGE = 'MIN_PURCHASE_PERCENTAGE',
  COUPON = 'COUPON',
}

export interface PromotionRule {
  id: string;
  type: PromotionType;
  name: string;
  description: string;
  value: number;
  minAmount?: number;
  maxDiscount?: number;
  applicableCategories?: string[];
  isStackable: boolean;
}

// 购物车统计
export interface CartStatistics {
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  totalDiscount: number;
  total: number;
}
