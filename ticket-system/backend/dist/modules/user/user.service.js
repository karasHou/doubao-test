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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../entities/user.entity");
let UserService = class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async createUser(userData) {
        const existingUser = await this.userRepository.findOne({
            where: { username: userData.username },
        });
        if (existingUser) {
            throw new common_1.ConflictException(`Username ${userData.username} already exists`);
        }
        const user = this.userRepository.create(userData);
        return this.userRepository.save(user);
    }
    async getUsers(role) {
        const query = this.userRepository.createQueryBuilder('user');
        if (role) {
            query.andWhere('user.role = :role', { role });
        }
        return query.getMany();
    }
    async getUserById(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async getUserByUsername(username) {
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user) {
            throw new common_1.NotFoundException(`User with username ${username} not found`);
        }
        return user;
    }
    async updateUser(id, updates) {
        const user = await this.getUserById(id);
        if (updates.username && updates.username !== user.username) {
            const existingUser = await this.userRepository.findOne({
                where: { username: updates.username },
            });
            if (existingUser) {
                throw new common_1.ConflictException(`Username ${updates.username} already exists`);
            }
        }
        const updatedUser = await this.userRepository.save({
            ...user,
            ...updates,
        });
        return updatedUser;
    }
    async deleteUser(id) {
        const user = await this.getUserById(id);
        await this.userRepository.remove(user);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserService);
//# sourceMappingURL=user.service.js.map