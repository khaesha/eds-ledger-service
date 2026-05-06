"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockLoggerService = void 0;
const createMockLoggerService = () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    securityEvent: jest.fn(),
});
exports.createMockLoggerService = createMockLoggerService;
//# sourceMappingURL=logger.mock.js.map