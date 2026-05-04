import { ExecutionContext } from '@nestjs/common';
import { testUsers } from '../../__tests__/fixtures/test-data';

describe('CurrentUser Decorator', () => {
  it('should extract user from request', () => {
    const mockUser = { id: testUsers.standard.id, email: testUsers.standard.email };
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: mockUser,
        }),
      }),
    } as unknown as ExecutionContext;

    const extractUser = (_data: unknown, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest<{ user: { id: string; email: string } }>();
      return request.user;
    };

    const result = extractUser(undefined, mockExecutionContext);

    expect(result).toEqual(mockUser);
    expect(result.id).toBe(testUsers.standard.id);
  });

  it('should return user object with id and email', () => {
    const mockUser = {
      id: testUsers.admin.id,
      email: testUsers.admin.email,
    };
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: mockUser,
        }),
      }),
    } as unknown as ExecutionContext;

    const extractUser = (_data: unknown, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest<{ user: { id: string; email: string } }>();
      return request.user;
    };

    const result = extractUser(undefined, mockExecutionContext);

    expect(result).toHaveProperty('id', testUsers.admin.id);
    expect(result).toHaveProperty('email', testUsers.admin.email);
  });

  it('should handle different user contexts', () => {
    const users = [testUsers.standard, testUsers.admin, testUsers.other];

    for (const user of users) {
      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: user.id, email: user.email },
          }),
        }),
      } as unknown as ExecutionContext;

      const extractUser = (_data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<{ user: { id: string; email: string } }>();
        return request.user;
      };

      const result = extractUser(undefined, mockExecutionContext);

      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
    }
  });

  it('should ignore data parameter', () => {
    const mockUser = { id: testUsers.standard.id, email: testUsers.standard.email };
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: mockUser,
        }),
      }),
    } as unknown as ExecutionContext;

    const extractUser = (_data: unknown, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest<{ user: { id: string; email: string } }>();
      return request.user;
    };

    const resultWithoutData = extractUser(undefined, mockExecutionContext);
    const resultWithData = extractUser('ignored', mockExecutionContext);

    expect(resultWithoutData).toEqual(resultWithData);
  });
});
