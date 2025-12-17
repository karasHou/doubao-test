import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from './role.entity';

@Entity('role_policies')
export class RolePolicy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roleId: number;

  @Column()
  policyId: number;

  @ManyToOne(() => Role, role => role.rolePolicies)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @ManyToOne('Policy')
  @JoinColumn({ name: 'policyId' })
  policy: any;

  @CreateDateColumn()
  createdAt: Date;
}
