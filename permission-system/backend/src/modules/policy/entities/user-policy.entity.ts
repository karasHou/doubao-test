import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Policy } from './policy.entity';

@Entity('user_policies')
export class UserPolicy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  policyId: number;

  @ManyToOne(() => User, user => user.userRoles)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Policy, policy => policy.userPolicies)
  @JoinColumn({ name: 'policyId' })
  policy: Policy;

  @CreateDateColumn()
  createdAt: Date;
}
