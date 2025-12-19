import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

export class QueryRecipesDto {
  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsOptional()
  @IsString()
  cuisine_type?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(300)
  max_cooking_time?: number;

  @IsOptional()
  @IsString()
  tag?: string;
}
