import { UserService } from './user.service';
import { User, UserRole } from '../../entities/user.entity';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    createUser(body: {
        username: string;
        password: string;
        email?: string;
        role?: UserRole;
    }): Promise<User>;
    getUsers(role?: UserRole): Promise<User[]>;
    getUserById(id: string): Promise<User>;
    updateUser(id: string, body: Partial<User>): Promise<User>;
    deleteUser(id: string): Promise<void>;
}
