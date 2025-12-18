import { Ticket } from './ticket.entity';
export declare enum UserRole {
    USER = "user",
    ADMIN = "admin",
    CUSTOMER_SERVICE = "customer_service"
}
export declare class User {
    id: string;
    username: string;
    password: string;
    role: UserRole;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    submittedTickets: Ticket[];
    assignedTickets: Ticket[];
}
