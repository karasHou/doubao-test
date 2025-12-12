import { ProductsService, Product, Sku, SkuAttribute } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    getAllProducts(): Product[];
    getProductById(id: string): Product | undefined;
    getSkuById(id: string): Sku | undefined;
    checkStock(skuId: string, quantity: number): {
        available: boolean;
        stock?: number;
    };
    getAvailableSkuCombinations(id: string): {
        skuId: string;
        attributes: SkuAttribute[];
        price: number;
        stock: number;
    }[];
    getProductAttributes(id: string): {
        name: string;
        values: string[];
    }[];
    deductStock(body: {
        skuId: string;
        quantity: number;
    }): {
        success: boolean;
    };
    restoreStock(body: {
        skuId: string;
        quantity: number;
    }): {
        success: boolean;
    };
}
