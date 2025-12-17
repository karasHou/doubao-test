import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { RolePolicy } from './entities/role-policy.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(RolePolicy)
    private readonly rolePolicyRepository: Repository<RolePolicy>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    // 检查角色名称和编码是否已存在
    const existingRole = await this.roleRepository.findOne({
      where: [{ name: createRoleDto.name }, { code: createRoleDto.code }],
    });
    
    if (existingRole) {
      throw new ConflictException('角色名称或编码已存在');
    }

    const role = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(role);
  }

  async findAll() {
    return this.roleRepository.find({
      relations: ['rolePermissions', 'rolePermissions.permission', 'rolePolicies', 'rolePolicies.policy'],
    });
  }

  async findOne(id: number) {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['rolePermissions', 'rolePermissions.permission', 'rolePolicies', 'rolePolicies.policy'],
    });
    
    if (!role) {
      throw new NotFoundException('角色不存在');
    }
    
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.findOne(id);
    Object.assign(role, updateRoleDto);
    return this.roleRepository.save(role);
  }

  async remove(id: number) {
    const role = await this.findOne(id);
    return this.roleRepository.remove(role);
  }

  async addPermission(roleId: number, permissionId: number) {
    const role = await this.findOne(roleId);
    
    // 检查是否已存在该权限
    const existingRolePermission = await this.rolePermissionRepository.findOne({
      where: { roleId, permissionId },
    });
    
    if (existingRolePermission) {
      throw new ConflictException('角色已拥有该权限');
    }

    const rolePermission = this.rolePermissionRepository.create({
      roleId,
      permissionId,
    });

    return this.rolePermissionRepository.save(rolePermission);
  }

  async removePermission(roleId: number, permissionId: number) {
    const rolePermission = await this.rolePermissionRepository.findOne({
      where: { roleId, permissionId },
    });
    
    if (!rolePermission) {
      throw new NotFoundException('角色未拥有该权限');
    }

    return this.rolePermissionRepository.remove(rolePermission);
  }

  async addPolicy(roleId: number, policyId: number) {
    const role = await this.findOne(roleId);
    
    // 检查是否已存在该策略
    const existingRolePolicy = await this.rolePolicyRepository.findOne({
      where: { roleId, policyId },
    });
    
    if (existingRolePolicy) {
      throw new ConflictException('角色已拥有该策略');
    }

    const rolePolicy = this.rolePolicyRepository.create({
      roleId,
      policyId,
    });

    return this.rolePolicyRepository.save(rolePolicy);
  }

  async removePolicy(roleId: number, policyId: number) {
    const rolePolicy = await this.rolePolicyRepository.findOne({
      where: { roleId, policyId },
    });
    
    if (!rolePolicy) {
      throw new NotFoundException('角色未拥有该策略');
    }

    return this.rolePolicyRepository.remove(rolePolicy);
  }
}
