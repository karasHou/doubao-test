import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleService.remove(+id);
  }

  @Post(':id/permissions')
  addPermission(@Param('id') id: string, @Body() body: { permissionId: number }) {
    return this.roleService.addPermission(+id, body.permissionId);
  }

  @Delete(':id/permissions/:permissionId')
  removePermission(@Param('id') id: string, @Param('permissionId') permissionId: string) {
    return this.roleService.removePermission(+id, +permissionId);
  }

  @Post(':id/policies')
  addPolicy(@Param('id') id: string, @Body() body: { policyId: number }) {
    return this.roleService.addPolicy(+id, body.policyId);
  }

  @Delete(':id/policies/:policyId')
  removePolicy(@Param('id') id: string, @Param('policyId') policyId: string) {
    return this.roleService.removePolicy(+id, +policyId);
  }
}
