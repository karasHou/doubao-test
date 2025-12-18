import { User } from './user.entity';
export declare enum TicketStatus {
    OPEN = "open",
    IN_PROGRESS = "in_progress",
    RESOLVED = "resolved",
    CLOSED = "closed"
}
export declare enum TicketPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}
export declare enum TicketCategory {
    BUG = "bug",
    FEATURE = "feature",
    SUPPORT = "support",
    OTHER = "other"
}
export declare class Ticket {
    id: string;
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    category: TicketCategory;
    submitterId: string;
    assigneeId: string;
    createdAt: Date;
    updatedAt: Date;
    submitter: User;
    assignee: User;
}
