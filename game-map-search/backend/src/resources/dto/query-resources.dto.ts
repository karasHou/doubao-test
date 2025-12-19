import {
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ResourceType, ResourceRarity } from '../entities/resource.entity';

/**
 * 资源点查询参数 DTO
 */
export class QueryResourcesDto {
  /**
   * 资源类型过滤
   */
  @IsOptional()
  @IsEnum(ResourceType, {
    message: 'type 必须是 plant、animal、mineral 或 task 中的一个',
  })
  type?: ResourceType;

  /**
   * 稀有度过滤
   */
  @IsOptional()
  @IsEnum(ResourceRarity, {
    message:
      'rarity 必须是 common、uncommon、rare、epic 或 legendary 中的一个',
  })
  rarity?: ResourceRarity;

  /**
   * 最小等级
   */
  @IsOptional()
  @IsInt({ message: 'minLevel 必须是整数' })
  @Min(1, { message: 'minLevel 不能小于 1' })
  @Type(() => Number)
  minLevel?: number;

  /**
   * 最大等级
   */
  @IsOptional()
  @IsInt({ message: 'maxLevel 必须是整数' })
  @Min(1, { message: 'maxLevel 不能小于 1' })
  @Type(() => Number)
  maxLevel?: number;

  /**
   * 地图可视区域 - 最小经度
   * 用于空间范围查询
   */
  @IsOptional()
  @IsNumber({}, { message: 'minLon 必须是数字' })
  @Min(-180, { message: 'minLon 不能小于 -180' })
  @Max(180, { message: 'minLon 不能大于 180' })
  @Type(() => Number)
  minLon?: number;

  /**
   * 地图可视区域 - 最大经度
   */
  @IsOptional()
  @IsNumber({}, { message: 'maxLon 必须是数字' })
  @Min(-180, { message: 'maxLon 不能小于 -180' })
  @Max(180, { message: 'maxLon 不能大于 180' })
  @Type(() => Number)
  maxLon?: number;

  /**
   * 地图可视区域 - 最小纬度
   */
  @IsOptional()
  @IsNumber({}, { message: 'minLat 必须是数字' })
  @Min(-90, { message: 'minLat 不能小于 -90' })
  @Max(90, { message: 'minLat 不能大于 90' })
  @Type(() => Number)
  minLat?: number;

  /**
   * 地图可视区域 - 最大纬度
   */
  @IsOptional()
  @IsNumber({}, { message: 'maxLat 必须是数字' })
  @Min(-90, { message: 'maxLat 不能小于 -90' })
  @Max(90, { message: 'maxLat 不能大于 90' })
  @Type(() => Number)
  maxLat?: number;

  /**
   * 分页 - 页码
   */
  @IsOptional()
  @IsInt({ message: 'page 必须是整数' })
  @Min(1, { message: 'page 不能小于 1' })
  @Type(() => Number)
  page?: number = 1;

  /**
   * 分页 - 每页大小
   */
  @IsOptional()
  @IsInt({ message: 'limit 必须是整数' })
  @Min(1, { message: 'limit 不能小于 1' })
  @Max(1000, { message: 'limit 不能大于 1000' })
  @Type(() => Number)
  limit?: number = 100;
}
