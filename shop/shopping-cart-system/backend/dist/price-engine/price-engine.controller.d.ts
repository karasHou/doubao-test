import { PriceEngineService, CartItem, PriceCalculationResult, PromotionRule } from './price-engine.service';
export declare class PriceEngineController {
    private readonly priceEngineService;
    constructor(priceEngineService: PriceEngineService);
    calculatePrice(body: {
        cartItems: CartItem[];
        coupons?: string[];
    }): PriceCalculationResult;
    getAllPromotions(): PromotionRule[];
    getCoupons(): PromotionRule[];
}
