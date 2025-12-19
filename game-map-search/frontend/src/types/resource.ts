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
 * 资源点数据类型
 */
export interface Resource {
  id: number;
  name: string;
  type: ResourceType;
  rarity: ResourceRarity;
  level: number;
  description?: string;
  longitude: number;
  latitude: number;
  quantity: number;
  refreshTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 资源点查询参数类型
 */
export interface QueryResourcesParams {
  type?: ResourceType;
  rarity?: ResourceRarity;
  minLevel?: number;
  maxLevel?: number;
  minLon?: number;
  maxLon?: number;
  minLat?: number;
  maxLat?: number;
  page?: number;
  limit?: number;
}

/**
 * 资源点查询结果类型
 */
export interface ResourceQueryResult {
  data: Resource[];
  total: number;
}

/**
 * API 响应基础类型
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  total?: number;
}

// 默认导出所有类型
export default {
  ResourceType,
  ResourceRarity,
  Resource,
  QueryResourcesParams,
  ResourceQueryResult,
  ApiResponse,
};
