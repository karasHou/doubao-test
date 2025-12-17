import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Policy } from './entities/policy.entity';
import { UserPolicy } from './entities/user-policy.entity';
import { RolePolicy } from '../role/entities/role-policy.entity';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';

@Injectable()
export class PolicyService {
  constructor(
    @InjectRepository(Policy)
    private readonly policyRepository: Repository<Policy>,
    @InjectRepository(UserPolicy)
    private readonly userPolicyRepository: Repository<UserPolicy>,
    @InjectRepository(RolePolicy)
    private readonly rolePolicyRepository: Repository<RolePolicy>,
  ) {}

  async create(createPolicyDto: CreatePolicyDto) {
    // 检查策略名称和编码是否已存在
    const existingPolicy = await this.policyRepository.findOne({
      where: [{ name: createPolicyDto.name }, { code: createPolicyDto.code }],
    });
    
    if (existingPolicy) {
      throw new ConflictException('策略名称或编码已存在');
    }

    const policy = this.policyRepository.create(createPolicyDto);
    return this.policyRepository.save(policy);
  }

  async findAll() {
    return this.policyRepository.find({
      relations: ['userPolicies', 'userPolicies.user', 'rolePolicies', 'rolePolicies.role'],
    });
  }

  async findOne(id: number) {
    const policy = await this.policyRepository.findOne({
      where: { id },
      relations: ['userPolicies', 'userPolicies.user', 'rolePolicies', 'rolePolicies.role'],
    });
    
    if (!policy) {
      throw new NotFoundException('策略不存在');
    }
    
    return policy;
  }

  async update(id: number, updatePolicyDto: UpdatePolicyDto) {
    const policy = await this.findOne(id);
    Object.assign(policy, updatePolicyDto);
    return this.policyRepository.save(policy);
  }

  async remove(id: number) {
    const policy = await this.findOne(id);
    return this.policyRepository.remove(policy);
  }

  async addUser(policyId: number, userId: number) {
    const policy = await this.findOne(policyId);
    
    // 检查是否已存在该用户关联
    const existingUserPolicy = await this.userPolicyRepository.findOne({
      where: { policyId, userId },
    });
    
    if (existingUserPolicy) {
      throw new ConflictException('策略已关联该用户');
    }

    const userPolicy = this.userPolicyRepository.create({
      policyId,
      userId,
    });

    return this.userPolicyRepository.save(userPolicy);
  }

  async removeUser(policyId: number, userId: number) {
    const userPolicy = await this.userPolicyRepository.findOne({
      where: { policyId, userId },
    });
    
    if (!userPolicy) {
      throw new NotFoundException('策略未关联该用户');
    }

    return this.userPolicyRepository.remove(userPolicy);
  }

  async findPoliciesByUserId(userId: number) {
    const queryBuilder = this.policyRepository
      .createQueryBuilder('policy')
      .leftJoin('policy.userPolicies', 'userPolicy')
      .where('userPolicy.userId = :userId', { userId })
      .andWhere('policy.status = :status', { status: 1 });

    return queryBuilder.getMany();
  }

  async findPoliciesByRoleIds(roleIds: number[]) {
    if (!roleIds || roleIds.length === 0) {
      return [];
    }

    const queryBuilder = this.policyRepository
      .createQueryBuilder('policy')
      .leftJoin('policy.rolePolicies', 'rolePolicy')
      .where('rolePolicy.roleId IN (:...roleIds)', { roleIds })
      .andWhere('policy.status = :status', { status: 1 });

    return queryBuilder.getMany();
  }
}
