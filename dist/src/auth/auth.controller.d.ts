import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        user: {
            email: string;
            name: string;
            id: string;
            createdAt: Date;
        };
        token: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            email: string;
            name: string;
            id: string;
            createdAt: Date;
        };
        token: string;
    }>;
    me(req: Express.Request & {
        user: {
            id: string;
            email: string;
        };
    }): Express.User & {
        id: string;
        email: string;
    };
}
