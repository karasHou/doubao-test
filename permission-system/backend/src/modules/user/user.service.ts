import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // 检查用户名和邮箱是否已存在
    const existingUser = await this.userRepository.findOne({
      where: [{ username: createUserDto.username }, { email: createUserDto.email }],
    });
    
    if (existingUser) {
      throw new ConflictException('用户名或邮箱已存在');
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      passwordHash,
    });

    return this.userRepository.save(user);
  }

  async findAll() {
    return this.userRepository.find({
      relations: ['userRoles', 'userRoles.role'],
    });
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role'],
    });
    
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    
    return user;
  }

  async findOneByUsername(username: string) {
    return this.userRepository.findOne({
      where: { username },
      relations: ['userRoles', 'userRoles.role'],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    
    // 如果更新密码，加密新密码
    if (updateUserDto.password) {
      updateUserDto.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
      delete updateUserDto.password;
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    return this.userRepository.remove(user);
  }

  async addRole(userId: number, roleId: number) {
    const user = await this.findOne(userId);
    
    // 检查是否已存在该角色
    const existingUserRole = await this.userRoleRepository.findOne({
      where: { userId, roleId },
    });
    
    if (existingUserRole) {
      throw new ConflictException('用户已拥有该角色');
    }

    const userRole = this.userRoleRepository.create({
      userId,
      roleId,
    });

    return this.userRoleRepository.save(userRole);
  }

  async removeRole(userId: number, roleId: number) {
    const userRole = await this.userRoleRepository.findOne({
      where: { userId, roleId },
    });
    
    if (!userRole) {
      throw new NotFoundException('用户未拥有该角色');
    }

    return this.userRoleRepository.remove(userRole);
  }
}
