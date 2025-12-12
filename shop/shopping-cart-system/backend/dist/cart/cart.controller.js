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
exports.CartController = void 0;
const common_1 = require("@nestjs/common");
const cart_service_1 = require("./cart.service");
let CartController = class CartController {
    constructor(cartService) {
        this.cartService = cartService;
    }
    getCart(userId) {
        if (!userId) {
            throw new common_1.HttpException('userId is required', common_1.HttpStatus.BAD_REQUEST);
        }
        return this.cartService.getCart(userId);
    }
    addItem(body) {
        if (!body.userId || !body.skuId) {
            throw new common_1.HttpException('userId and skuId are required', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            return this.cartService.addItem(body.userId, body.skuId, body.quantity || 1);
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    updateItemQuantity(itemId, body) {
        if (!body.userId || body.quantity === undefined) {
            throw new common_1.HttpException('userId and quantity are required', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            return this.cartService.updateItemQuantity(body.userId, itemId, body.quantity);
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    removeItem(itemId, userId) {
        if (!userId) {
            throw new common_1.HttpException('userId is required', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            return this.cartService.removeItem(userId, itemId);
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    clearCart(userId) {
        if (!userId) {
            throw new common_1.HttpException('userId is required', common_1.HttpStatus.BAD_REQUEST);
        }
        return this.cartService.clearCart(userId);
    }
    applyCoupon(body) {
        if (!body.userId || !body.couponId) {
            throw new common_1.HttpException('userId and couponId are required', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            return this.cartService.applyCoupon(body.userId, body.couponId);
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    removeCoupon(couponId, userId) {
        if (!userId) {
            throw new common_1.HttpException('userId is required', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            return this.cartService.removeCoupon(userId, couponId);
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    getCartStatistics(userId) {
        if (!userId) {
            throw new common_1.HttpException('userId is required', common_1.HttpStatus.BAD_REQUEST);
        }
        return this.cartService.getCartStatistics(userId);
    }
};
exports.CartController = CartController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "getCart", null);
__decorate([
    (0, common_1.Post)('items'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "addItem", null);
__decorate([
    (0, common_1.Put)('items/:itemId'),
    __param(0, (0, common_1.Param)('itemId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "updateItemQuantity", null);
__decorate([
    (0, common_1.Delete)('items/:itemId'),
    __param(0, (0, common_1.Param)('itemId')),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "removeItem", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "clearCart", null);
__decorate([
    (0, common_1.Post)('coupons'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "applyCoupon", null);
__decorate([
    (0, common_1.Delete)('coupons/:couponId'),
    __param(0, (0, common_1.Param)('couponId')),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "removeCoupon", null);
__decorate([
    (0, common_1.Get)('statistics'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CartController.prototype, "getCartStatistics", null);
exports.CartController = CartController = __decorate([
    (0, common_1.Controller)('cart'),
    __metadata("design:paramtypes", [cart_service_1.CartService])
], CartController);
//# sourceMappingURL=cart.controller.js.map