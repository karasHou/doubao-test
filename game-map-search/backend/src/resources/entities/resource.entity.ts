import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 资源类型枚举
 */
export enum ResourceType {
  PLANT = 'plant',
  ANIMAL = 'animal',
  MINERAL = 'mineral',
  TASK = 'task',
}

/**
 * 稀有度/等级枚举
 */
export enum ResourceRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

/**
 * 资源点实体
 */
@Entity('resources')
export class Resource {
  /**
   * 主键 ID
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 资源名称
   */
  @Column({ length: 255, nullable: false })
  name: string;

  /**
   * 资源类型
   */
  @Column({
    type: 'enum',
    enum: ResourceType,
    nullable: false,
  })
  type: ResourceType;

  /**
   * 稀有度/等级
   */
  @Column({
    type: 'enum',
    enum: ResourceRarity,
    nullable: false,
  })
  rarity: ResourceRarity;

  /**
   * 等级
   */
  @Column({ default: 1 })
  level: number;

  /**
   * 描述
   */
  @Column({ type: 'text', nullable: true })
  description: string;

  /**
   * 空间位置 (PostGIS 点类型)
   * 使用 Geography 类型存储经纬度坐标
   */
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: string;

  /**
   * 资源数量
   */
  @Column({ default: 1 })
  quantity: number;

  /**
   * 刷新时间
   */
  @Column({ type: 'timestamp', nullable: true })
  refreshTime: Date;

  /**
   * 创建时间
   */
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  /**
   * 更新时间
   */
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;
}
