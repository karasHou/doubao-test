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
exports.PriceEngineController = void 0;
const common_1 = require("@nestjs/common");
const price_engine_service_1 = require("./price-engine.service");
let PriceEngineController = class PriceEngineController {
    constructor(priceEngineService) {
        this.priceEngineService = priceEngineService;
    }
    calculatePrice(body) {
        return this.priceEngineService.calculatePrice(body.cartItems, body.coupons || []);
    }
    getAllPromotions() {
        return this.priceEngineService.getAllPromotions();
    }
    getCoupons() {
        return this.priceEngineService.getCoupons();
    }
};
exports.PriceEngineController = PriceEngineController;
__decorate([
    (0, common_1.Post)('calculate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], PriceEngineController.prototype, "calculatePrice", null);
__decorate([
    (0, common_1.Get)('promotions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], PriceEngineController.prototype, "getAllPromotions", null);
__decorate([
    (0, common_1.Get)('coupons'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], PriceEngineController.prototype, "getCoupons", null);
exports.PriceEngineController = PriceEngineController = __decorate([
    (0, common_1.Controller)('price-engine'),
    __metadata("design:paramtypes", [price_engine_service_1.PriceEngineService])
], PriceEngineController);
//# sourceMappingURL=price-engine.controller.js.map