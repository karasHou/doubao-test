import { UserService } from '../user/user.service';
export declare class AuthService {
    private readonly userService;
    constructor(userService: UserService);
    validateUser(username: string, password: string): Promise<any>;
}
