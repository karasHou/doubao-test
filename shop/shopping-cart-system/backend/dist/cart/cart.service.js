"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("../products/products.service");
const price_engine_service_1 = require("../price-engine/price-engine.service");
let CartService = class CartService {
    constructor(productsService, priceEngineService) {
        this.productsService = productsService;
        this.priceEngineService = priceEngineService;
        this.carts = new Map();
        this.cartItemIdCounter = 1;
    }
    getCart(userId) {
        let cart = this.carts.get(userId);
        if (!cart) {
            cart = {
                id: `CART-${userId}-${Date.now()}`,
                userId,
                items: [],
                appliedCoupons: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            this.carts.set(userId, cart);
        }
        cart.priceCalculation = this.priceEngineService.calculatePrice(cart.items, cart.appliedCoupons);
        return cart;
    }
    addItem(userId, skuId, quantity = 1) {
        const cart = this.getCart(userId);
        const sku = this.productsService.getSkuById(skuId);
        if (!sku) {
            throw new common_1.NotFoundException('SKU not found');
        }
        if (!this.productsService.checkStockAvailability(skuId, quantity)) {
            throw new Error('Insufficient stock');
        }
        const existingItemIndex = cart.items.findIndex(item => item.skuId === skuId);
        if (existingItemIndex !== -1) {
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;
            if (!this.productsService.checkStockAvailability(skuId, newQuantity)) {
                throw new Error('Insufficient stock for updated quantity');
            }
            cart.items[existingItemIndex].quantity = newQuantity;
        }
        else {
            const product = this.productsService.getProductById(sku.productId);
            if (!product) {
                throw new common_1.NotFoundException('Product not found');
            }
            const attributesMap = sku.attributes.reduce((acc, attr) => {
                acc[attr.name] = attr.value;
                return acc;
            }, {});
            cart.items.push({
                id: `ITEM-${this.cartItemIdCounter++}`,
                productId: sku.productId,
                skuId: sku.id,
                name: product.name,
                category: product.category,
                price: sku.price,
                quantity,
                attributes: attributesMap,
            });
        }
        cart.updatedAt = new Date();
        cart.priceCalculation = this.priceEngineService.calculatePrice(cart.items, cart.appliedCoupons);
        return cart;
    }
    updateItemQuantity(userId, itemId, quantity) {
        if (quantity <= 0) {
            return this.removeItem(userId, itemId);
        }
        const cart = this.getCart(userId);
        const itemIndex = cart.items.findIndex(item => item.id === itemId);
        if (itemIndex === -1) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        if (!this.productsService.checkStockAvailability(cart.items[itemIndex].skuId, quantity)) {
            throw new Error('Insufficient stock');
        }
        cart.items[itemIndex].quantity = quantity;
        cart.updatedAt = new Date();
        cart.priceCalculation = this.priceEngineService.calculatePrice(cart.items, cart.appliedCoupons);
        return cart;
    }
    removeItem(userId, itemId) {
        const cart = this.getCart(userId);
        const itemIndex = cart.items.findIndex(item => item.id === itemId);
        if (itemIndex === -1) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        cart.items.splice(itemIndex, 1);
        cart.updatedAt = new Date();
        cart.priceCalculation = this.priceEngineService.calculatePrice(cart.items, cart.appliedCoupons);
        return cart;
    }
    clearCart(userId) {
        const cart = this.getCart(userId);
        cart.items = [];
        cart.appliedCoupons = [];
        cart.updatedAt = new Date();
        cart.priceCalculation = undefined;
        return cart;
    }
    applyCoupon(userId, couponId) {
        const cart = this.getCart(userId);
        const coupons = this.priceEngineService.getCoupons();
        const coupon = coupons.find(c => c.id === couponId);
        if (!coupon) {
            throw new common_1.NotFoundException('Coupon not found');
        }
        if (cart.appliedCoupons.includes(couponId)) {
            throw new Error('Coupon already applied');
        }
        cart.appliedCoupons.push(couponId);
        cart.updatedAt = new Date();
        cart.priceCalculation = this.priceEngineService.calculatePrice(cart.items, cart.appliedCoupons);
        return cart;
    }
    removeCoupon(userId, couponId) {
        const cart = this.getCart(userId);
        const couponIndex = cart.appliedCoupons.indexOf(couponId);
        if (couponIndex === -1) {
            throw new common_1.NotFoundException('Coupon not found in cart');
        }
        cart.appliedCoupons.splice(couponIndex, 1);
        cart.updatedAt = new Date();
        cart.priceCalculation = this.priceEngineService.calculatePrice(cart.items, cart.appliedCoupons);
        return cart;
    }
    getCartStatistics(userId) {
        const cart = this.getCart(userId);
        const priceCalculation = cart.priceCalculation || {
            subtotal: 0,
            totalDiscount: 0,
            total: 0,
            breakdown: { subtotal: 0, discounts: [], total: 0 },
        };
        return {
            totalItems: cart.items.length,
            totalQuantity: cart.items.reduce((sum, item) => sum + item.quantity, 0),
            subtotal: priceCalculation.subtotal,
            totalDiscount: priceCalculation.totalDiscount,
            total: priceCalculation.total,
        };
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [products_service_1.ProductsService,
        price_engine_service_1.PriceEngineService])
], CartService);
//# sourceMappingURL=cart.service.js.map