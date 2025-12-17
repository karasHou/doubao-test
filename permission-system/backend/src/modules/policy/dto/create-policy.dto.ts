import { IsString, IsNotEmpty, IsOptional, IsObject, IsArray } from 'class-validator';

export class CreatePolicyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  effect?: string;

  @IsObject()
  @IsOptional()
  conditions?: any;

  @IsArray()
  @IsOptional()
  actions?: string[];

  @IsArray()
  @IsOptional()
  resources?: string[];

  @IsString()
  @IsOptional()
  description?: string;
}
