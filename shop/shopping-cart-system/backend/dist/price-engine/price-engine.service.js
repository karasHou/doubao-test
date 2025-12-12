"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceEngineService = exports.PromotionType = void 0;
const common_1 = require("@nestjs/common");
var PromotionType;
(function (PromotionType) {
    PromotionType["DIRECT_DISCOUNT"] = "DIRECT_DISCOUNT";
    PromotionType["PERCENTAGE_DISCOUNT"] = "PERCENTAGE_DISCOUNT";
    PromotionType["MIN_PURCHASE_DISCOUNT"] = "MIN_PURCHASE_DISCOUNT";
    PromotionType["MIN_PURCHASE_PERCENTAGE"] = "MIN_PURCHASE_PERCENTAGE";
    PromotionType["COUPON"] = "COUPON";
})(PromotionType || (exports.PromotionType = PromotionType = {}));
let PriceEngineService = class PriceEngineService {
    constructor() {
        this.promotionRules = [
            {
                id: 'P1',
                type: PromotionType.MIN_PURCHASE_DISCOUNT,
                name: '满100减20',
                description: '购物满100元立减20元',
                value: 20,
                minAmount: 100,
                isStackable: true,
            },
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
            {
                id: 'P3',
                type: PromotionType.COUPON,
                name: '新人优惠券',
                description: '新用户专享10元优惠券',
                value: 10,
                isStackable: true,
            },
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
    }
    calculatePrice(cartItems, appliedCoupons = []) {
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
    calculateSubtotal(cartItems) {
        return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
    getApplicableRules(cartItems, appliedCoupons) {
        const rules = [];
        const categories = new Set(cartItems.map(item => item.category));
        for (const rule of this.promotionRules) {
            if (rule.type === PromotionType.COUPON) {
                if (appliedCoupons.includes(rule.id)) {
                    rules.push(rule);
                }
                continue;
            }
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
    applyPromotions(subtotal, cartItems, rules) {
        let totalDiscount = 0;
        const discounts = [];
        const nonStackableRules = rules.filter(r => !r.isStackable);
        const stackableRules = rules.filter(r => r.isStackable);
        if (nonStackableRules.length > 0) {
            let bestDiscount = 0;
            let bestRule = null;
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
        totalDiscount = Math.min(totalDiscount, subtotal);
        return { totalDiscount, discounts };
    }
    calculateRuleDiscount(subtotal, cartItems, rule) {
        switch (rule.type) {
            case PromotionType.DIRECT_DISCOUNT:
                return rule.value;
            case PromotionType.PERCENTAGE_DISCOUNT:
                if (rule.applicableCategories) {
                    const categoryTotal = cartItems
                        .filter(item => rule.applicableCategories.includes(item.category))
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
    getAllPromotions() {
        return this.promotionRules;
    }
    getCoupons() {
        return this.promotionRules.filter(rule => rule.type === PromotionType.COUPON);
    }
};
exports.PriceEngineService = PriceEngineService;
exports.PriceEngineService = PriceEngineService = __decorate([
    (0, common_1.Injectable)()
], PriceEngineService);
//# sourceMappingURL=price-engine.service.js.map