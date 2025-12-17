import { PartialType } from '@nestjs/mapped-types';
import { CreatePolicyDto } from './create-policy.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdatePolicyDto extends PartialType(CreatePolicyDto) {
  @IsNumber()
  @IsOptional()
  status?: number;
}
