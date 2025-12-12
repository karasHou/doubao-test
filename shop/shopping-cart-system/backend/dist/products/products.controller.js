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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
let ProductsController = class ProductsController {
    constructor(productsService) {
        this.productsService = productsService;
    }
    getAllProducts() {
        return this.productsService.getAllProducts();
    }
    getProductById(id) {
        return this.productsService.getProductById(id);
    }
    getSkuById(id) {
        return this.productsService.getSkuById(id);
    }
    checkStock(skuId, quantity) {
        const available = this.productsService.checkStockAvailability(skuId, quantity);
        const sku = this.productsService.getSkuById(skuId);
        return {
            available,
            stock: sku ? sku.stock : undefined,
        };
    }
    getAvailableSkuCombinations(id) {
        return this.productsService.getAvailableSkuCombinations(id);
    }
    getProductAttributes(id) {
        return this.productsService.getProductAttributes(id);
    }
    deductStock(body) {
        const success = this.productsService.deductStock(body.skuId, body.quantity);
        return { success };
    }
    restoreStock(body) {
        const success = this.productsService.restoreStock(body.skuId, body.quantity);
        return { success };
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], ProductsController.prototype, "getAllProducts", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], ProductsController.prototype, "getProductById", null);
__decorate([
    (0, common_1.Get)('sku/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], ProductsController.prototype, "getSkuById", null);
__decorate([
    (0, common_1.Get)('stock/check'),
    __param(0, (0, common_1.Query)('skuId')),
    __param(1, (0, common_1.Query)('quantity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Object)
], ProductsController.prototype, "checkStock", null);
__decorate([
    (0, common_1.Get)(':id/sku-combinations'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "getAvailableSkuCombinations", null);
__decorate([
    (0, common_1.Get)(':id/attributes'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "getProductAttributes", null);
__decorate([
    (0, common_1.Post)('stock/deduct'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "deductStock", null);
__decorate([
    (0, common_1.Post)('stock/restore'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "restoreStock", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map