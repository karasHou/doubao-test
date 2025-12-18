import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus, TicketPriority, TicketCategory } from '../../entities/ticket.entity';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';

@Injectable()
export class TicketService {
  private readonly ES_INDEX = 'tickets';

  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async createTicket(ticketData: {
    title: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
    submitterId: string;
  }): Promise<Ticket> {
    const ticket = this.ticketRepository.create({
      ...ticketData,
      status: TicketStatus.OPEN,
    });

    const savedTicket = await this.ticketRepository.save(ticket);

    // 索引到 Elasticsearch
    await this.elasticsearchService.indexDocument(
      this.ES_INDEX,
      savedTicket.id,
      this.prepareTicketForIndex(savedTicket),
    );

    return savedTicket;
  }

  async getTickets(filters: {
    status?: TicketStatus;
    priority?: TicketPriority;
    category?: TicketCategory;
    submitterId?: string;
    assigneeId?: string;
  } = {}): Promise<Ticket[]> {
    const query = this.ticketRepository.createQueryBuilder('ticket');

    if (filters.status) {
      query.andWhere('ticket.status = :status', { status: filters.status });
    }

    if (filters.priority) {
      query.andWhere('ticket.priority = :priority', { priority: filters.priority });
    }

    if (filters.category) {
      query.andWhere('ticket.category = :category', { category: filters.category });
    }

    if (filters.submitterId) {
      query.andWhere('ticket.submitterId = :submitterId', { submitterId: filters.submitterId });
    }

    if (filters.assigneeId) {
      query.andWhere('ticket.assigneeId = :assigneeId', { assigneeId: filters.assigneeId });
    }

    return query.getMany();
  }

  async getTicketById(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    return ticket;
  }

  async updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket> {
    const ticket = await this.getTicketById(id);

    const updatedTicket = await this.ticketRepository.save({
      ...ticket,
      ...updates,
    });

    // 更新 Elasticsearch 索引
    await this.elasticsearchService.updateDocument(
      this.ES_INDEX,
      updatedTicket.id,
      this.prepareTicketForIndex(updatedTicket),
    );

    return updatedTicket;
  }

  async deleteTicket(id: string): Promise<void> {
    const ticket = await this.getTicketById(id);
    await this.ticketRepository.remove(ticket);

    // 从 Elasticsearch 删除
    await this.elasticsearchService.deleteDocument(this.ES_INDEX, id);
  }

  async searchTickets(keyword: string, filters: {
    status?: TicketStatus;
    priority?: TicketPriority;
    category?: TicketCategory;
  } = {}): Promise<Ticket[]> {
    try {
      console.log('searchTickets called with:', { keyword, filters });

      // 直接在数据库中进行搜索
      const query = this.ticketRepository.createQueryBuilder('ticket');

      // 添加关键词搜索条件
      if (keyword) {
        console.log('Adding keyword condition:', keyword);
        query.andWhere('(ticket.title ILIKE :keyword OR ticket.description ILIKE :keyword)', {
          keyword: `%${keyword}%`,
        });
      }

      // 添加过滤条件
      if (filters.status) {
        console.log('Adding status filter:', filters.status);
        query.andWhere('ticket.status = :status', { status: filters.status });
      }

      if (filters.priority) {
        console.log('Adding priority filter:', filters.priority);
        query.andWhere('ticket.priority = :priority', { priority: filters.priority });
      }

      if (filters.category) {
        console.log('Adding category filter:', filters.category);
        query.andWhere('ticket.category = :category', { category: filters.category });
      }

      console.log('Executing query:', query.getSql());
      const tickets = await query.getMany();
      console.log('Found tickets:', tickets);

      return tickets;
    } catch (error) {
      console.error('Error in searchTickets:', error);
      // 为了调试，我们可以返回一个包含错误信息的对象
      // 但在实际生产环境中，我们不应该这样做
      throw new Error(`Search error: ${error.message}`);
    }
  }

  private prepareTicketForIndex(ticket: Ticket): any {
    return {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      submitterId: ticket.submitterId,
      assigneeId: ticket.assigneeId,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    };
  }

  async reindexAllTickets(): Promise<void> {
    const allTickets = await this.ticketRepository.find();

    for (const ticket of allTickets) {
      await this.elasticsearchService.indexDocument(
        this.ES_INDEX,
        ticket.id,
        this.prepareTicketForIndex(ticket),
      );
    }

    console.log(`Reindexed ${allTickets.length} tickets`);
  }
}
