export const createMockOpenAiClient = (overrides = {}) => ({
  chat: {
    completions: {
      create: jest.fn(async () => {
        const defaults = {
          choices: [
            {
              message: {
                content: JSON.stringify([
                  {
                    description: 'Coffee at Starbucks',
                    category: 'food',
                    ai_note: 'Morning caffeine boost',
                  },
                ]),
              },
            },
          ],
        };
        return { ...defaults, ...overrides };
      }),
    },
  },
});

export const createMockOpenAiReportResponse = () => ({
  score: 78,
  score_reason: 'Good spending habits with moderate entertainment expenses',
  summary: 'Your spending was well-balanced this month.',
  leaks: [
    {
      name: 'Subscriptions',
      amount: 150000,
      tip: 'Consider canceling unused services.',
    },
  ],
  wins: ['Reduced transport costs by 20%'],
});
