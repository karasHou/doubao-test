import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsService, Sku } from '../products/products.service';
import { PriceEngineService, PriceCalculationResult } from '../price-engine/price-engine.service';

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

@Injectable()
export class CartService {
  private carts: Map<string, Cart> = new Map();
  private cartItemIdCounter = 1;

  constructor(
    private readonly productsService: ProductsService,
    private readonly priceEngineService: PriceEngineService,
  ) {}

  /**
   * 获取用户购物车
   */
  getCart(userId: string): Cart {
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

    // 实时计算价格
    cart.priceCalculation = this.priceEngineService.calculatePrice(cart.items, cart.appliedCoupons);

    return cart;
  }

  /**
   * 添加商品到购物车
   */
  addItem(userId: string, skuId: string, quantity: number = 1): Cart {
    const cart = this.getCart(userId);
    const sku = this.productsService.getSkuById(skuId);

    if (!sku) {
      throw new NotFoundException('SKU not found');
    }

    // 检查库存
    if (!this.productsService.checkStockAvailability(skuId, quantity)) {
      throw new Error('Insufficient stock');
    }

    // 查找是否已存在该 SKU
    const existingItemIndex = cart.items.findIndex(item => item.skuId === skuId);

    if (existingItemIndex !== -1) {
      // 更新数量
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (!this.productsService.checkStockAvailability(skuId, newQuantity)) {
        throw new Error('Insufficient stock for updated quantity');
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // 添加新 item
      const product = this.productsService.getProductById(sku.productId);
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      const attributesMap = sku.attributes.reduce((acc, attr) => {
        acc[attr.name] = attr.value;
        return acc;
      }, {} as Record<string, string>);

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

    // 重新计算价格
    cart.priceCalculation = this.priceEngineService.calculatePrice(cart.items, cart.appliedCoupons);

    return cart;
  }

  /**
   * 更新购物车项目数量
   */
  updateItemQuantity(userId: string, itemId: string, quantity: number): Cart {
    if (quantity <= 0) {
      return this.removeItem(userId, itemId);
    }

    const cart = this.getCart(userId);
    const itemIndex = cart.items.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
      throw new NotFoundException('Cart item not found');
    }

    // 检查库存
    if (!this.productsService.checkStockAvailability(cart.items[itemIndex].skuId, quantity)) {
      throw new Error('Insufficient stock');
    }

    cart.items[itemIndex].quantity = quantity;
    cart.updatedAt = new Date();

    // 重新计算价格
    cart.priceCalculation = this.priceEngineService.calculatePrice(cart.items, cart.appliedCoupons);

    return cart;
  }

  /**
   * 从购物车移除项目
   */
  removeItem(userId: string, itemId: string): Cart {
    const cart = this.getCart(userId);
    const itemIndex = cart.items.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
      throw new NotFoundException('Cart item not found');
    }

    cart.items.splice(itemIndex, 1);
    cart.updatedAt = new Date();

    // 重新计算价格
    cart.priceCalculation = this.priceEngineService.calculatePrice(cart.items, cart.appliedCoupons);

    return cart;
  }

  /**
   * 清空购物车
   */
  clearCart(userId: string): Cart {
    const cart = this.getCart(userId);
    cart.items = [];
    cart.appliedCoupons = [];
    cart.updatedAt = new Date();
    cart.priceCalculation = undefined;

    return cart;
  }

  /**
   * 应用优惠券
   */
  applyCoupon(userId: string, couponId: string): Cart {
    const cart = this.getCart(userId);

    // 检查优惠券是否存在
    const coupons = this.priceEngineService.getCoupons();
    const coupon = coupons.find(c => c.id === couponId);

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    // 检查是否已应用
    if (cart.appliedCoupons.includes(couponId)) {
      throw new Error('Coupon already applied');
    }

    cart.appliedCoupons.push(couponId);
    cart.updatedAt = new Date();

    // 重新计算价格
    cart.priceCalculation = this.priceEngineService.calculatePrice(cart.items, cart.appliedCoupons);

    return cart;
  }

  /**
   * 移除优惠券
   */
  removeCoupon(userId: string, couponId: string): Cart {
    const cart = this.getCart(userId);
    const couponIndex = cart.appliedCoupons.indexOf(couponId);

    if (couponIndex === -1) {
      throw new NotFoundException('Coupon not found in cart');
    }

    cart.appliedCoupons.splice(couponIndex, 1);
    cart.updatedAt = new Date();

    // 重新计算价格
    cart.priceCalculation = this.priceEngineService.calculatePrice(cart.items, cart.appliedCoupons);

    return cart;
  }

  /**
   * 获取购物车统计信息
   */
  getCartStatistics(userId: string): {
    totalItems: number;
    totalQuantity: number;
    subtotal: number;
    totalDiscount: number;
    total: number;
  } {
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
}
