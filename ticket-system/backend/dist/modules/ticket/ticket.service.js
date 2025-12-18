"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ticket_entity_1 = require("../../entities/ticket.entity");
const elasticsearch_service_1 = require("../elasticsearch/elasticsearch.service");
let TicketService = class TicketService {
    constructor(ticketRepository, elasticsearchService) {
        this.ticketRepository = ticketRepository;
        this.elasticsearchService = elasticsearchService;
        this.ES_INDEX = 'tickets';
    }
    async createTicket(ticketData) {
        const ticket = this.ticketRepository.create({
            ...ticketData,
            status: ticket_entity_1.TicketStatus.OPEN,
        });
        const savedTicket = await this.ticketRepository.save(ticket);
        await this.elasticsearchService.indexDocument(this.ES_INDEX, savedTicket.id, this.prepareTicketForIndex(savedTicket));
        return savedTicket;
    }
    async getTickets(filters = {}) {
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
    async getTicketById(id) {
        const ticket = await this.ticketRepository.findOne({ where: { id } });
        if (!ticket) {
            throw new common_1.NotFoundException(`Ticket with ID ${id} not found`);
        }
        return ticket;
    }
    async updateTicket(id, updates) {
        const ticket = await this.getTicketById(id);
        const updatedTicket = await this.ticketRepository.save({
            ...ticket,
            ...updates,
        });
        await this.elasticsearchService.updateDocument(this.ES_INDEX, updatedTicket.id, this.prepareTicketForIndex(updatedTicket));
        return updatedTicket;
    }
    async deleteTicket(id) {
        const ticket = await this.getTicketById(id);
        await this.ticketRepository.remove(ticket);
        await this.elasticsearchService.deleteDocument(this.ES_INDEX, id);
    }
    async searchTickets(keyword, filters = {}) {
        try {
            console.log('searchTickets called with keyword:', keyword);
            console.log('searchTickets called with filters:', filters);
            const allTickets = await this.ticketRepository.find();
            console.log('All tickets in database:', allTickets);
            if (keyword) {
                const filteredTickets = allTickets.filter(ticket => ticket.title.includes(keyword) ||
                    ticket.description.includes(keyword));
                console.log('Filtered tickets:', filteredTickets);
                return filteredTickets;
            }
            return allTickets;
        }
        catch (error) {
            console.error('Error in searchTickets:', error);
            throw error;
        }
    }
    prepareTicketForIndex(ticket) {
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
    async reindexAllTickets() {
        const allTickets = await this.ticketRepository.find();
        for (const ticket of allTickets) {
            await this.elasticsearchService.indexDocument(this.ES_INDEX, ticket.id, this.prepareTicketForIndex(ticket));
        }
        console.log(`Reindexed ${allTickets.length} tickets`);
    }
};
exports.TicketService = TicketService;
exports.TicketService = TicketService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ticket_entity_1.Ticket)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        elasticsearch_service_1.ElasticsearchService])
], TicketService);
//# sourceMappingURL=ticket.service.js.map