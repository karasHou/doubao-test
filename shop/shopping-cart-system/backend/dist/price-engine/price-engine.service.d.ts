export declare enum PromotionType {
    DIRECT_DISCOUNT = "DIRECT_DISCOUNT",
    PERCENTAGE_DISCOUNT = "PERCENTAGE_DISCOUNT",
    MIN_PURCHASE_DISCOUNT = "MIN_PURCHASE_DISCOUNT",
    MIN_PURCHASE_PERCENTAGE = "MIN_PURCHASE_PERCENTAGE",
    COUPON = "COUPON"
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
export declare class PriceEngineService {
    private promotionRules;
    calculatePrice(cartItems: CartItem[], appliedCoupons?: string[]): PriceCalculationResult;
    private calculateSubtotal;
    private getApplicableRules;
    private applyPromotions;
    private calculateRuleDiscount;
    getAllPromotions(): PromotionRule[];
    getCoupons(): PromotionRule[];
}
