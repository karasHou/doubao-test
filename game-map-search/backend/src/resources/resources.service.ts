import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Resource, ResourceType, ResourceRarity } from './entities/resource.entity';
import { QueryResourcesDto } from './dto/query-resources.dto';

@Injectable()
export class ResourcesService {
  private readonly logger = new Logger(ResourcesService.name);

  constructor(
    @InjectRepository(Resource)
    private resourcesRepository: Repository<Resource>,
    @Inject(CACHE_MANAGER)
    private cache: Cache,
  ) {}

  /**
   * 查询资源点列表
   * 支持按类型、稀有度、等级、空间范围过滤
   * 热点区域查询结果会被缓存
   */
  async findAll(queryDto: QueryResourcesDto): Promise<{ data: Resource[]; total: number }> {
    this.logger.debug(`查询资源点, 参数: ${JSON.stringify(queryDto)}`);

    // 生成缓存键 (基于查询参数)
    const cacheKey = this.generateCacheKey(queryDto);

    // 尝试从缓存中获取数据
    const cachedResult = await this.cache.get(cacheKey);
    if (cachedResult) {
      this.logger.debug(`从缓存中获取资源点数据, 缓存键: ${cacheKey}`);
      return cachedResult as { data: Resource[]; total: number };
    }

    // 创建查询构建器
    const queryBuilder = this.resourcesRepository.createQueryBuilder('resource');

    // 应用过滤条件
    this.applyFilters(queryBuilder, queryDto);

    // 获取总数
    const total = await queryBuilder.getCount();

    // 应用分页
    const { page = 1, limit = 100 } = queryDto;
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // 执行查询
    // 先将 geography 类型转换为 geometry 类型, 再使用 ST_X 和 ST_Y 函数提取经纬度
    const data = await queryBuilder
      .select('resource.*')
      .addSelect('ST_X(ST_Transform(resource.location::geometry, 4326)) as longitude')
      .addSelect('ST_Y(ST_Transform(resource.location::geometry, 4326)) as latitude')
      .getRawMany();

    this.logger.debug(`查询到 ${data.length} 个资源点, 总计 ${total} 个`);

    // 将结果存入缓存 (缓存 5 分钟)
    const result = { data, total };
    await this.cache.set(cacheKey, result, 60 * 5);

    return result;
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(queryDto: QueryResourcesDto): string {
    // 基于查询参数生成唯一的缓存键
    const keyParts = [
      'resources',
      `type=${queryDto.type || 'all'}`,
      `rarity=${queryDto.rarity || 'all'}`,
      `minLevel=${queryDto.minLevel || 0}`,
      `maxLevel=${queryDto.maxLevel || 999}`,
      `minLon=${queryDto.minLon || -180}`,
      `maxLon=${queryDto.maxLon || 180}`,
      `minLat=${queryDto.minLat || -90}`,
      `maxLat=${queryDto.maxLat || 90}`,
      `page=${queryDto.page || 1}`,
      `limit=${queryDto.limit || 100}`,
    ];
    return keyParts.join(':');
  }

  /**
   * 应用查询过滤器
   */
  private applyFilters(queryBuilder: SelectQueryBuilder<Resource>, queryDto: QueryResourcesDto): void {
    const { type, rarity, minLevel, maxLevel, minLon, maxLon, minLat, maxLat } = queryDto;

    // 按资源类型过滤
    if (type) {
      queryBuilder.andWhere('resource.type = :type', { type });
    }

    // 按稀有度过滤
    if (rarity) {
      queryBuilder.andWhere('resource.rarity = :rarity', { rarity });
    }

    // 按等级范围过滤
    if (minLevel) {
      queryBuilder.andWhere('resource.level >= :minLevel', { minLevel });
    }
    if (maxLevel) {
      queryBuilder.andWhere('resource.level <= :maxLevel', { maxLevel });
    }

    // 按空间范围过滤 (地图可视区域)
    if (minLon !== undefined && maxLon !== undefined && minLat !== undefined && maxLat !== undefined) {
      // 使用 PostGIS 的 ST_Within 函数查询指定范围内的资源点
      // 创建一个矩形边界框 (POLYGON)
      const bbox = `POLYGON((${minLon} ${minLat}, ${maxLon} ${minLat}, ${maxLon} ${maxLat}, ${minLon} ${maxLat}, ${minLon} ${minLat}))`;

      queryBuilder
        .andWhere('ST_Within(resource.location, ST_GeomFromText(:bbox, 4326))', { bbox });
    }
  }

  /**
   * 根据 ID 查询单个资源点
   */
  async findOne(id: number): Promise<Resource | null> {
    this.logger.debug(`根据 ID 查询资源点: ${id}`);
    return this.resourcesRepository.findOne({ where: { id } });
  }
}
