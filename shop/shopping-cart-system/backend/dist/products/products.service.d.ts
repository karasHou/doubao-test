export interface SkuAttribute {
    name: string;
    value: string;
}
export interface SkuStock {
    skuId: string;
    quantity: number;
    isAvailable: boolean;
}
export interface Sku {
    id: string;
    productId: string;
    price: number;
    attributes: SkuAttribute[];
    stock: number;
    isAvailable: boolean;
}
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
export declare class ProductsService {
    private products;
    getAllProducts(): Product[];
    getProductById(id: string): Product | undefined;
    getSkuById(skuId: string): Sku | undefined;
    checkStockAvailability(skuId: string, quantity: number): boolean;
    getAvailableSkuCombinations(productId: string): Array<{
        skuId: string;
        attributes: SkuAttribute[];
        price: number;
        stock: number;
    }>;
    deductStock(skuId: string, quantity: number): boolean;
    restoreStock(skuId: string, quantity: number): boolean;
    getProductAttributes(productId: string): Array<{
        name: string;
        values: string[];
    }> | undefined;
}
