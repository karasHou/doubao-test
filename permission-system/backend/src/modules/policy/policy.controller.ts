import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PolicyService } from './policy.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PolicyEngineService } from './policy-engine.service';

@Controller('policies')
@UseGuards(JwtAuthGuard)
export class PolicyController {
  constructor(
    private readonly policyService: PolicyService,
    private readonly policyEngineService: PolicyEngineService,
  ) {}

  @Post()
  create(@Body() createPolicyDto: CreatePolicyDto) {
    return this.policyService.create(createPolicyDto);
  }

  @Get()
  findAll() {
    return this.policyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.policyService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePolicyDto: UpdatePolicyDto) {
    return this.policyService.update(+id, updatePolicyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.policyService.remove(+id);
  }

  @Post(':id/users')
  addUser(@Param('id') id: string, @Body() body: { userId: number }) {
    return this.policyService.addUser(+id, body.userId);
  }

  @Delete(':id/users/:userId')
  removeUser(@Param('id') id: string, @Param('userId') userId: string) {
    return this.policyService.removeUser(+id, +userId);
  }

  @Post('evaluate')
  evaluate(@Body() evaluationContext: any) {
    return this.policyEngineService.evaluate(evaluationContext);
  }
}
