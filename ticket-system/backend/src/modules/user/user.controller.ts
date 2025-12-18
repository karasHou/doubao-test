import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { User, UserRole } from '../../entities/user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(
    @Body()
    body: {
      username: string;
      password: string;
      email?: string;
      role?: UserRole;
    },
  ): Promise<User> {
    return this.userService.createUser(body);
  }

  @Get()
  async getUsers(@Query('role') role?: UserRole): Promise<User[]> {
    return this.userService.getUsers(role);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User> {
    return this.userService.getUserById(id);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body()
    body: Partial<User>,
  ): Promise<User> {
    return this.userService.updateUser(id, body);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<void> {
    return this.userService.deleteUser(id);
  }
}
