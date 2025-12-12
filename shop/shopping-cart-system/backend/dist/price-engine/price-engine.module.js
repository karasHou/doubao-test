"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceEngineModule = void 0;
const common_1 = require("@nestjs/common");
const price_engine_service_1 = require("./price-engine.service");
const price_engine_controller_1 = require("./price-engine.controller");
let PriceEngineModule = class PriceEngineModule {
};
exports.PriceEngineModule = PriceEngineModule;
exports.PriceEngineModule = PriceEngineModule = __decorate([
    (0, common_1.Module)({
        controllers: [price_engine_controller_1.PriceEngineController],
        providers: [price_engine_service_1.PriceEngineService],
        exports: [price_engine_service_1.PriceEngineService],
    })
], PriceEngineModule);
//# sourceMappingURL=price-engine.module.js.map