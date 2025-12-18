import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';
export declare class UserService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    createUser(userData: {
        username: string;
        password: string;
        email?: string;
        role?: UserRole;
    }): Promise<User>;
    getUsers(role?: UserRole): Promise<User[]>;
    getUserById(id: string): Promise<User>;
    getUserByUsername(username: string): Promise<User>;
    updateUser(id: string, updates: Partial<User>): Promise<User>;
    deleteUser(id: string): Promise<void>;
}
