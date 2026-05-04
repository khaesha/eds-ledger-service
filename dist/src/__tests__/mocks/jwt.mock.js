"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockJwtService = void 0;
const createMockJwtService = () => ({
    sign: jest.fn((payload, options) => {
        return `mock_jwt_token_${payload.sub}_${Date.now()}`;
    }),
    verify: jest.fn((token, options) => {
        return {
            sub: 'user-1',
            email: 'test@example.com',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 900,
        };
    }),
    decode: jest.fn((token) => {
        return {
            sub: 'user-1',
            email: 'test@example.com',
        };
    }),
});
exports.createMockJwtService = createMockJwtService;
//# sourceMappingURL=jwt.mock.js.map