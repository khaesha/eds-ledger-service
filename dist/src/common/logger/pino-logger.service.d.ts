export interface SecurityEvent {
    type: 'AUTH_FAILED' | 'AUTH_SUCCESS' | 'ACCESS_DENIED' | 'RATE_LIMIT' | 'INJECTION_ATTEMPT' | 'IDOR_ATTEMPT';
    userId?: string;
    username?: string;
    endpoint?: string;
    details?: Record<string, unknown>;
    requestId?: string;
    timestamp?: string;
}
export declare class LoggerService {
    private logger;
    constructor();
    debug(message: string, meta?: Record<string, unknown>): void;
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, error?: Error | string, meta?: Record<string, unknown>): void;
    securityEvent(event: SecurityEvent): void;
}
