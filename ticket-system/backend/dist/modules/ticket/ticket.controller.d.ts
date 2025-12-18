import { TicketService } from './ticket.service';
import { Ticket, TicketStatus, TicketPriority, TicketCategory } from '../../entities/ticket.entity';
export declare class TicketController {
    private readonly ticketService;
    constructor(ticketService: TicketService);
    createTicket(body: {
        title: string;
        description: string;
        category: TicketCategory;
        priority: TicketPriority;
        submitterId: string;
    }): Promise<Ticket>;
    getTickets(status?: TicketStatus, priority?: TicketPriority, category?: TicketCategory, submitterId?: string, assigneeId?: string): Promise<Ticket[]>;
    getTicketById(id: string): Promise<Ticket>;
    updateTicket(id: string, body: Partial<Ticket>): Promise<Ticket>;
    deleteTicket(id: string): Promise<void>;
    searchTickets(keyword: string, status?: TicketStatus, priority?: TicketPriority, category?: TicketCategory): Promise<Ticket[]>;
}
