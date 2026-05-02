import { PrismaService } from './prisma/prisma.service';
export declare class AppService {
    private prisma;
    constructor(prisma: PrismaService);
    getHello(): string;
    getHealth(): Promise<{
        status: string;
        timestamp: string;
        database: string;
        uptime: number;
        error?: undefined;
    } | {
        status: string;
        timestamp: string;
        database: string;
        error: string;
        uptime: number;
    }>;
}
