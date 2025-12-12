import { CartService } from './cart.service';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(userId: string): import("./cart.service").Cart;
    addItem(body: {
        userId: string;
        skuId: string;
        quantity?: number;
    }): import("./cart.service").Cart;
    updateItemQuantity(itemId: string, body: {
        userId: string;
        quantity: number;
    }): import("./cart.service").Cart;
    removeItem(itemId: string, userId: string): import("./cart.service").Cart;
    clearCart(userId: string): import("./cart.service").Cart;
    applyCoupon(body: {
        userId: string;
        couponId: string;
    }): import("./cart.service").Cart;
    removeCoupon(couponId: string, userId: string): import("./cart.service").Cart;
    getCartStatistics(userId: string): {
        totalItems: number;
        totalQuantity: number;
        subtotal: number;
        totalDiscount: number;
        total: number;
    };
}
