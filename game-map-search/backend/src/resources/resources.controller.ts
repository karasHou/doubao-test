import { Controller, Get, Query, Param, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiParam, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { ResourcesService } from './resources.service';
import { Resource } from './entities/resource.entity';
import { QueryResourcesDto } from './dto/query-resources.dto';

@ApiTags('resources')
@Controller('api/resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  /**
   * 查询资源点列表
   * 支持按类型、稀有度、等级、空间范围过滤和分页
   */
  @Get()
  @ApiOperation({
    summary: '查询资源点列表',
    description: '支持按类型、稀有度、等级、空间范围过滤和分页',
  })
  @ApiQuery({ name: 'type', required: false, enum: ['plant', 'animal', 'mineral', 'task'] })
  @ApiQuery({
    name: 'rarity',
    required: false,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
  })
  @ApiQuery({ name: 'minLevel', required: false, type: Number })
  @ApiQuery({ name: 'maxLevel', required: false, type: Number })
  @ApiQuery({ name: 'minLon', required: false, type: Number })
  @ApiQuery({ name: 'maxLon', required: false, type: Number })
  @ApiQuery({ name: 'minLat', required: false, type: Number })
  @ApiQuery({ name: 'maxLat', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number, default: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 100 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '成功查询资源点列表',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Resource' },
        },
        total: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '请求参数验证失败',
  })
  async findAll(@Query() queryDto: QueryResourcesDto) {
    try {
      const result = await this.resourcesService.findAll(queryDto);
      return {
        code: HttpStatus.OK,
        message: '查询成功',
        data: result.data,
        total: result.total,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 根据 ID 查询单个资源点
   */
  @Get(':id')
  @ApiOperation({
    summary: '根据 ID 查询单个资源点',
    description: '根据资源点的唯一标识查询详细信息',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: '资源点的唯一标识',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '成功查询资源点详情',
    schema: { $ref: '#/components/schemas/Resource' },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '资源点不存在',
  })
  async findOne(@Param('id') id: string) {
    try {
      const resource = await this.resourcesService.findOne(+id);
      if (!resource) {
        throw new HttpException('资源点不存在', HttpStatus.NOT_FOUND);
      }
      return {
        code: HttpStatus.OK,
        message: '查询成功',
        data: resource,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 统一错误处理
   */
  private handleError(error: any) {
    if (error instanceof HttpException) {
      throw error;
    }
    throw new HttpException(
      error.message || '服务器内部错误',
      error.status || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
