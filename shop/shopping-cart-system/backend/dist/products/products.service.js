"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
let ProductsService = class ProductsService {
    constructor() {
        this.products = [
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
    }
    getAllProducts() {
        return this.products;
    }
    getProductById(id) {
        return this.products.find(product => product.id === id);
    }
    getSkuById(skuId) {
        for (const product of this.products) {
            const sku = product.skus.find(s => s.id === skuId);
            if (sku) {
                return sku;
            }
        }
        return undefined;
    }
    checkStockAvailability(skuId, quantity) {
        const sku = this.getSkuById(skuId);
        return sku ? sku.stock >= quantity && sku.isAvailable : false;
    }
    getAvailableSkuCombinations(productId) {
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
    deductStock(skuId, quantity) {
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
    restoreStock(skuId, quantity) {
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
    getProductAttributes(productId) {
        const product = this.getProductById(productId);
        return product ? product.skuAttributes : undefined;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)()
], ProductsService);
//# sourceMappingURL=products.service.js.map