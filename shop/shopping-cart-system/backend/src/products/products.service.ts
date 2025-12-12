import { Injectable } from '@nestjs/common';

// SKU 属性
export interface SkuAttribute {
  name: string;
  value: string;
}

// SKU 库存信息
export interface SkuStock {
  skuId: string;
  quantity: number;
  isAvailable: boolean;
}

// SKU 完整信息
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

@Injectable()
export class ProductsService {
  // 模拟商品数据库
  private products: Product[] = [
    {
      id: 'P001',
      name: 'iPhone 15 Pro',
      description: '最新款苹果手机，钛金属设计，A17 Pro芯片',
      category: 'electronics',
      basePrice: 7999,
      skuAttributes: [
        { name: '颜色', values: ['黑色', '白色', '蓝色', '红色'] },
        { name: '存储容量', values: ['128GB', '256GB', '512GB', '1TB'] },
      ],
      skus: [
        {
          id: 'SKU001',
          productId: 'P001',
          price: 7999,
          attributes: [
            { name: '颜色', value: '黑色' },
            { name: '存储容量', value: '128GB' },
          ],
          stock: 50,
          isAvailable: true,
        },
        {
          id: 'SKU002',
          productId: 'P001',
          price: 8999,
          attributes: [
            { name: '颜色', value: '黑色' },
            { name: '存储容量', value: '256GB' },
          ],
          stock: 30,
          isAvailable: true,
        },
        {
          id: 'SKU003',
          productId: 'P001',
          price: 10999,
          attributes: [
            { name: '颜色', value: '白色' },
            { name: '存储容量', value: '512GB' },
          ],
          stock: 10,
          isAvailable: true,
        },
        {
          id: 'SKU004',
          productId: 'P001',
          price: 12999,
          attributes: [
            { name: '颜色', value: '蓝色' },
            { name: '存储容量', value: '1TB' },
          ],
          stock: 5,
          isAvailable: true,
        },
      ],
      images: [
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'P002',
      name: '经典白T恤',
      description: '100%纯棉，舒适透气，多色可选',
      category: 'clothing',
      basePrice: 99,
      skuAttributes: [
        { name: '颜色', values: ['白色', '黑色', '灰色', '蓝色'] },
        { name: '尺码', values: ['S', 'M', 'L', 'XL', 'XXL'] },
      ],
      skus: [
        {
          id: 'SKU005',
          productId: 'P002',
          price: 99,
          attributes: [
            { name: '颜色', value: '白色' },
            { name: '尺码', value: 'M' },
          ],
          stock: 100,
          isAvailable: true,
        },
        {
          id: 'SKU006',
          productId: 'P002',
          price: 99,
          attributes: [
            { name: '颜色', value: '黑色' },
            { name: '尺码', value: 'L' },
          ],
          stock: 80,
          isAvailable: true,
        },
        {
          id: 'SKU007',
          productId: 'P002',
          price: 99,
          attributes: [
            { name: '颜色', value: '灰色' },
            { name: '尺码', value: 'XL' },
          ],
          stock: 50,
          isAvailable: true,
        },
      ],
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  /**
   * 获取所有商品列表
   */
  getAllProducts(): Product[] {
    return this.products;
  }

  /**
   * 根据 ID 获取商品
   */
  getProductById(id: string): Product | undefined {
    return this.products.find(product => product.id === id);
  }

  /**
   * 根据 SKU ID 获取 SKU 信息
   */
  getSkuById(skuId: string): Sku | undefined {
    for (const product of this.products) {
      const sku = product.skus.find(s => s.id === skuId);
      if (sku) {
        return sku;
      }
    }
    return undefined;
  }

  /**
   * 检查库存可用性
   */
  checkStockAvailability(skuId: string, quantity: number): boolean {
    const sku = this.getSkuById(skuId);
    return sku ? sku.stock >= quantity && sku.isAvailable : false;
  }

  /**
   * 获取可用的 SKU 组合
   */
  getAvailableSkuCombinations(productId: string): Array<{
    skuId: string;
    attributes: SkuAttribute[];
    price: number;
    stock: number;
  }> {
    const product = this.getProductById(productId);
    if (!product) {
      return [];
    }

    return product.skus
      .filter(sku => sku.isAvailable && sku.stock > 0)
      .map(sku => ({
        skuId: sku.id,
        attributes: sku.attributes,
        price: sku.price,
        stock: sku.stock,
      }));
  }

  /**
   * 扣减库存
   */
  deductStock(skuId: string, quantity: number): boolean {
    const sku = this.getSkuById(skuId);
    if (!sku || sku.stock < quantity) {
      return false;
    }

    sku.stock -= quantity;
    if (sku.stock === 0) {
      sku.isAvailable = false;
    }

    return true;
  }

  /**
   * 恢复库存
   */
  restoreStock(skuId: string, quantity: number): boolean {
    const sku = this.getSkuById(skuId);
    if (!sku) {
      return false;
    }

    sku.stock += quantity;
    if (sku.stock > 0) {
      sku.isAvailable = true;
    }

    return true;
  }

  /**
   * 获取商品的属性信息
   */
  getProductAttributes(productId: string): Array<{
    name: string;
    values: string[];
  }> | undefined {
    const product = this.getProductById(productId);
    return product ? product.skuAttributes : undefined;
  }
}
