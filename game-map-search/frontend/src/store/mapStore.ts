import { defineStore } from 'pinia';
import ResourceTypes from '../types/resource';
import { resourceApi } from '../services/api';

// 解构所有类型
const { ResourceType, ResourceRarity, Resource, QueryResourcesParams } = ResourceTypes;

/**
 * 地图状态管理 Store
 */
export const useMapStore = defineStore('map', {
  state: () => ({
    // 地图实例
    map: null as any,

    // 资源点数据
    resources: [] as Resource[],
    totalResources: 0,

    // 筛选条件
    filters: {
      type: undefined as ResourceType | undefined,
      rarity: undefined as ResourceRarity | undefined,
      minLevel: undefined as number | undefined,
      maxLevel: undefined as number | undefined,
    },

    // 地图可视区域
    bounds: {
      minLon: undefined as number | undefined,
      maxLon: undefined as number | undefined,
      minLat: undefined as number | undefined,
      maxLat: undefined as number | undefined,
    },

    // 分页信息
    pagination: {
      page: 1,
      limit: 200, // 每次查询最多返回 200 个资源点
    },

    // 加载状态
    loading: false,

    // 聚合点数据
    clusters: [] as any[],
  }),

  getters: {
    /**
     * 获取当前的查询参数
     */
    queryParams: (state): QueryResourcesParams => ({
      type: state.filters.type,
      rarity: state.filters.rarity,
      minLevel: state.filters.minLevel,
      maxLevel: state.filters.maxLevel,
      minLon: state.bounds.minLon,
      maxLon: state.bounds.maxLon,
      minLat: state.bounds.minLat,
      maxLat: state.bounds.maxLat,
      page: state.pagination.page,
      limit: state.pagination.limit,
    }),
  },

  actions: {
    /**
     * 设置地图实例
     */
    setMap(map: any) {
      this.map = map;
    },

    /**
     * 更新地图可视区域
     */
    updateBounds(bounds: { minLon: number; maxLon: number; minLat: number; maxLat: number }) {
      this.bounds = bounds;
    },

    /**
     * 设置筛选条件
     */
    setFilters(filters: Partial<typeof this.filters>) {
      this.filters = { ...this.filters, ...filters };
      this.pagination.page = 1; // 筛选条件变化时重置到第一页
    },

    /**
     * 重置筛选条件
     */
    resetFilters() {
      this.filters = {
        type: undefined,
        rarity: undefined,
        minLevel: undefined,
        maxLevel: undefined,
      };
      this.pagination.page = 1;
    },

    /**
     * 设置分页信息
     */
    setPagination(pagination: Partial<typeof this.pagination>) {
      this.pagination = { ...this.pagination, ...pagination };
    },

    /**
     * 查询资源点数据
     */
    async queryResources() {
      // 如果没有设置地图范围，不查询
      if (
        this.bounds.minLon === undefined ||
        this.bounds.maxLon === undefined ||
        this.bounds.minLat === undefined ||
        this.bounds.maxLat === undefined
      ) {
        return;
      }

      this.loading = true;

      try {
        const result = await resourceApi.queryResources(this.queryParams);
        this.resources = result.data;
        this.totalResources = result.total;
      } catch (error) {
        console.error('查询资源点失败:', error);
        this.resources = [];
        this.totalResources = 0;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 设置聚合点数据
     */
    setClusters(clusters: any[]) {
      this.clusters = clusters;
    },

    /**
     * 清空资源点数据
     */
    clearResources() {
      this.resources = [];
      this.totalResources = 0;
    },
  },
});
