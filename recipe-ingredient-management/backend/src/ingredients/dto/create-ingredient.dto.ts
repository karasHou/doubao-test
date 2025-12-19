import { IsString, IsNumber, IsOptional, IsDateString, IsUUID } from 'class-validator';

export class CreateIngredientDto {
  @IsString()
  name: string;

  @IsUUID()
  @IsOptional()
  category_id?: string;

  @IsNumber()
  quantity: number;

  @IsString()
  unit: string;

  @IsDateString()
  @IsOptional()
  expiration_date?: string;
}
