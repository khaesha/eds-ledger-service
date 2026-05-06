"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let HttpExceptionFilter = class HttpExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const isDevelopment = process.env.NODE_ENV === 'development';
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal Server Error';
        let error;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const response = exceptionResponse;
                message = response.message || exception.message;
                error = response.error || undefined;
            }
            else {
                message = exceptionResponse;
            }
        }
        else if (exception instanceof Error) {
            message = exception.message;
            error = exception.name;
        }
        const errorResponse = {
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
            requestId: request.id,
            ...(isDevelopment && { error }),
        };
        if (isDevelopment && exception instanceof Error) {
            console.error({
                requestId: request.id,
                error: exception.message,
                stack: exception.stack,
                url: request.url,
                method: request.method,
            });
        }
        response.status(status).json(errorResponse);
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)(),
    (0, common_1.Injectable)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map