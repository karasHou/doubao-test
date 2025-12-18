import { Repository } from 'typeorm';
import { Ticket, TicketStatus, TicketPriority, TicketCategory } from '../../entities/ticket.entity';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
export declare class TicketService {
    private readonly ticketRepository;
    private readonly elasticsearchService;
    private readonly ES_INDEX;
    constructor(ticketRepository: Repository<Ticket>, elasticsearchService: ElasticsearchService);
    createTicket(ticketData: {
        title: string;
        description: string;
        category: TicketCategory;
        priority: TicketPriority;
        submitterId: string;
    }): Promise<Ticket>;
    getTickets(filters?: {
        status?: TicketStatus;
        priority?: TicketPriority;
        category?: TicketCategory;
        submitterId?: string;
        assigneeId?: string;
    }): Promise<Ticket[]>;
    getTicketById(id: string): Promise<Ticket>;
    updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket>;
    deleteTicket(id: string): Promise<void>;
    searchTickets(keyword: string, filters?: {
        status?: TicketStatus;
        priority?: TicketPriority;
        category?: TicketCategory;
    }): Promise<Ticket[]>;
    private prepareTicketForIndex;
    reindexAllTickets(): Promise<void>;
}
