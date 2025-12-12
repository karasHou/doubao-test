import { ProductsService } from '../products/products.service';
import { PriceEngineService, PriceCalculationResult } from '../price-engine/price-engine.service';
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
export interface Cart {
    id: string;
    userId: string;
    items: CartItem[];
    appliedCoupons: string[];
    priceCalculation?: PriceCalculationResult;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CartService {
    private readonly productsService;
    private readonly priceEngineService;
    private carts;
    private cartItemIdCounter;
    constructor(productsService: ProductsService, priceEngineService: PriceEngineService);
    getCart(userId: string): Cart;
    addItem(userId: string, skuId: string, quantity?: number): Cart;
    updateItemQuantity(userId: string, itemId: string, quantity: number): Cart;
    removeItem(userId: string, itemId: string): Cart;
    clearCart(userId: string): Cart;
    applyCoupon(userId: string, couponId: string): Cart;
    removeCoupon(userId: string, couponId: string): Cart;
    getCartStatistics(userId: string): {
        totalItems: number;
        totalQuantity: number;
        subtotal: number;
        totalDiscount: number;
        total: number;
    };
}
