import { IsString, IsNumber, IsOptional, IsDateString, IsUUID } from 'class-validator';

// 显式定义 UpdateIngredientDto 以避免 PartialType 问题
export class UpdateIngredientDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUUID()
  @IsOptional()
  category_id?: string;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsDateString()
  @IsOptional()
  expiration_date?: string;
}
