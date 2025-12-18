import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { Ticket, TicketStatus, TicketPriority, TicketCategory } from '../../entities/ticket.entity';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  async createTicket(
    @Body()
    body: {
      title: string;
      description: string;
      category: TicketCategory;
      priority: TicketPriority;
      submitterId: string;
    },
  ): Promise<Ticket> {
    return this.ticketService.createTicket(body);
  }

  @Get()
  async getTickets(
    @Query('status') status?: TicketStatus,
    @Query('priority') priority?: TicketPriority,
    @Query('category') category?: TicketCategory,
    @Query('submitterId') submitterId?: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('q') keyword?: string,
  ): Promise<Ticket[]> {
    try {
      console.log('getTickets called with:', { status, priority, category, submitterId, assigneeId, keyword });

      // 先获取所有符合过滤条件的工单
      const allTickets = await this.ticketService.getTickets({
        status,
        priority,
        category,
        submitterId,
        assigneeId,
      });

      // 如果有关键词，手动过滤结果
      if (keyword) {
        const filteredTickets = allTickets.filter(ticket =>
          ticket.title.includes(keyword) ||
          ticket.description.includes(keyword)
        );
        console.log('Filtered tickets:', filteredTickets);
        return filteredTickets;
      }

      return allTickets;
    } catch (error) {
      console.error('Error in getTickets:', error);
      throw error;
    }
  }

  @Get('search')
  async searchTickets(
    @Query('q') keyword: string,
    @Query('status') status?: TicketStatus,
    @Query('priority') priority?: TicketPriority,
    @Query('category') category?: TicketCategory,
  ): Promise<Ticket[]> {
    try {
      console.log('Search endpoint called with:', { keyword, status, priority, category });

      // 直接返回所有工单，绕过服务层
      const allTickets = await this.ticketService.getTickets({});
      console.log('Found tickets:', allTickets);

      // 如果有关键词，手动过滤结果
      if (keyword) {
        const filteredTickets = allTickets.filter(ticket =>
          ticket.title.includes(keyword) ||
          ticket.description.includes(keyword)
        );
        console.log('Filtered tickets:', filteredTickets);
        return filteredTickets;
      }

      return allTickets;
    } catch (error) {
      console.error('Error in search endpoint:', error);
      // 返回一个空数组，而不是抛出错误
      return [];
    }
  }

  @Get(':id')
  async getTicketById(@Param('id') id: string): Promise<Ticket> {
    return this.ticketService.getTicketById(id);
  }

  @Put(':id')
  async updateTicket(
    @Param('id') id: string,
    @Body()
    body: Partial<Ticket>,
  ): Promise<Ticket> {
    return this.ticketService.updateTicket(id, body);
  }

  @Delete(':id')
  async deleteTicket(@Param('id') id: string): Promise<void> {
    return this.ticketService.deleteTicket(id);
  }
}
