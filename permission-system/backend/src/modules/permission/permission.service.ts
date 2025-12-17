import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto) {
    // 检查权限名称和编码是否已存在
    const existingPermission = await this.permissionRepository.findOne({
      where: [{ name: createPermissionDto.name }, { code: createPermissionDto.code }],
    });
    
    if (existingPermission) {
      throw new ConflictException('权限名称或编码已存在');
    }

    const permission = this.permissionRepository.create(createPermissionDto);
    return this.permissionRepository.save(permission);
  }

  async findAll() {
    return this.permissionRepository.find({
      relations: ['rolePermissions', 'rolePermissions.role'],
      order: { sortOrder: 'ASC' },
    });
  }

  async findOne(id: number) {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ['rolePermissions', 'rolePermissions.role'],
    });
    
    if (!permission) {
      throw new NotFoundException('权限不存在');
    }
    
    return permission;
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.findOne(id);
    Object.assign(permission, updatePermissionDto);
    return this.permissionRepository.save(permission);
  }

  async remove(id: number) {
    const permission = await this.findOne(id);
    return this.permissionRepository.remove(permission);
  }

  async findPermissionsByRoleIds(roleIds: number[]) {
    if (!roleIds || roleIds.length === 0) {
      return [];
    }

    const queryBuilder = this.permissionRepository
      .createQueryBuilder('permission')
      .leftJoin('permission.rolePermissions', 'rolePermission')
      .where('rolePermission.roleId IN (:...roleIds)', { roleIds })
      .andWhere('permission.status = :status', { status: 1 });

    return queryBuilder.getMany();
  }
}
