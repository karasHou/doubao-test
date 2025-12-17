import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserPolicy } from './user-policy.entity';

@Entity('policies')
export class Policy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ default: 'allow' })
  effect: string; // allow | deny

  @Column({ type: 'jsonb' })
  conditions: any;

  @Column({ type: 'jsonb' })
  actions: any;

  @Column({ type: 'jsonb' })
  resources: any;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 1 })
  status: number;

  @OneToMany(() => UserPolicy, userPolicy => userPolicy.policy)
  userPolicies: UserPolicy[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
