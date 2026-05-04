export const createMockBcryptModule = () => ({
  hash: jest.fn(async (password: string, _rounds: number) => {
    return `$2b$12$hashed_${password}`;
  }),
  compare: jest.fn(async (password: string, hash: string) => {
    return hash === `$2b$12$hashed_${password}`;
  }),
});
