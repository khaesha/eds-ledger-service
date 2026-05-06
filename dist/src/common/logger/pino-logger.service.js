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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = void 0;
const common_1 = require("@nestjs/common");
const pino_1 = __importDefault(require("pino"));
let LoggerService = class LoggerService {
    logger;
    constructor() {
        this.logger = (0, pino_1.default)({
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
            redact: {
                paths: [
                    'req.headers.authorization',
                    'req.body.password',
                    'req.body.secret',
                    'req.body.token',
                    'password',
                    'secret',
                    'token',
                    'apiKey',
                ],
                remove: true,
            },
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    singleLine: process.env.NODE_ENV === 'production',
                    ignore: 'pid,hostname',
                },
            },
        });
    }
    debug(message, meta) {
        this.logger.debug({ ...meta }, message);
    }
    info(message, meta) {
        this.logger.info({ ...meta }, message);
    }
    warn(message, meta) {
        this.logger.warn({ ...meta }, message);
    }
    error(message, error, meta) {
        if (error instanceof Error) {
            this.logger.error({ ...meta, stack: error.stack }, message);
        }
        else if (typeof error === 'string') {
            this.logger.error({ ...meta, error }, message);
        }
        else if (error) {
            this.logger.error({ ...meta, error }, message);
        }
        else {
            this.logger.error(meta, message);
        }
    }
    securityEvent(event) {
        this.logger.warn({
            type: event.type,
            userId: event.userId,
            username: event.username,
            endpoint: event.endpoint,
            requestId: event.requestId,
            timestamp: event.timestamp || new Date().toISOString(),
            ...event.details,
        }, `[SECURITY] ${event.type}`);
    }
};
exports.LoggerService = LoggerService;
exports.LoggerService = LoggerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], LoggerService);
//# sourceMappingURL=pino-logger.service.js.map