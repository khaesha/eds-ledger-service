# Edda's Ledger — Backend API

NestJS-based REST API server for **Edda's Ledger**, a personal finance platform with AI-powered financial insights. Handles authentication, expense management, financial reporting, and real-time chat with Edda AI.

## 🎯 Features

- **Authentication**: JWT-based login, registration, and secure session management
- **Expense Tracking**: CRUD operations and bulk CSV import with AI categorization
- **Financial Reports**: Monthly spending analysis with AI-generated insights, score calculation, and leak detection
- **Edda AI Chat**: Real-time conversational interface for financial advice
- **AI Integration**: LLaMA 3.1 model via OpenRouter for expense categorization and report generation
- **Database**: PostgreSQL via Prisma ORM (Supabase-ready)
- **Rate Limiting**: Throttler module to prevent abuse
- **Security**: JWT validation, CORS, helmet headers

## 🛠 Tech Stack

- **Framework**: [NestJS 11](https://docs.nestjs.com)
- **Language**: TypeScript 5
- **ORM**: [Prisma 7](https://www.prisma.io) with PostgreSQL adapter
- **Authentication**: [Passport.js](http://www.passportjs.org) with JWT strategy
- **Validation**: class-validator & class-transformer
- **AI**: [OpenAI SDK](https://github.com/openai/openai-node) pointed to OpenRouter
- **HTTP**: Express with CORS & helmet middleware
- **Testing**: Jest with e2e support

## 📋 Requirements

- Node.js >= 18
- PostgreSQL 14+ (local or Supabase)
- npm >= 9
- OpenRouter API key (for Edda AI)

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Create `.env`:
```env
# Database (Supabase format)
DATABASE_URL="postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres?schema=public"

# JWT
JWT_SECRET=your_random_jwt_secret_here

# AI / OpenRouter
OPENROUTER_API_KEY=sk_...your_openrouter_key...

# App
NODE_ENV=development
PORT=3001
```

### 3. Setup Database
```bash
npx prisma migrate deploy
npx prisma generate
```

### 4. Run Development Server
```bash
npm run start:dev
```

Server runs on `http://localhost:3001`

### 5. Build for Production
```bash
npm run build
npm run start:prod
```

## 📁 Project Structure

```
src/
├── main.ts                # App bootstrap
├── app.module.ts          # Root module
├── auth/                  # Authentication
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.dto.ts
│   ├── jwt.strategy.ts    # Passport strategy
│   └── auth.module.ts
├── expenses/              # Expense management
│   ├── expenses.controller.ts
│   ├── expenses.service.ts
│   ├── expenses.dto.ts
│   └── expenses.module.ts
├── reports/               # Financial reports
│   ├── reports.controller.ts
│   ├── reports.service.ts
│   └── reports.module.ts
├── chat/                  # Chat interface
│   ├── chat.controller.ts
│   ├── chat.service.ts
│   ├── chat.dto.ts
│   └── chat.module.ts
├── ai/                    # LLM integration
│   ├── ai.service.ts      # OpenRouter client
│   └── ai.module.ts
├── prisma/                # Database layer
│   ├── prisma.service.ts
│   └── prisma.module.ts
└── common/
    ├── decorators/
    │   └── current-user.decorator.ts  # @CurrentUser() for JWT payloads
    └── guards/
        └── jwt.guard.ts               # Protected routes
```

## 📡 API Endpoints

### Auth
- `POST /auth/register` — Register new user
- `POST /auth/login` — Login & receive JWT token

### Expenses (protected)
- `GET /expenses` — List user's expenses
- `POST /expenses` — Create new expense
- `POST /expenses/import` — Import CSV file

### Reports (protected)
- `GET /reports/:year/:month` — Fetch monthly report
- `POST /reports/:year/:month/generate` — Generate AI report

### Chat (protected)
- `POST /chat/ask` — Send message to Edda AI

## 🔐 Authentication

All endpoints except `/auth/*` require JWT in `Authorization` header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Use `@CurrentUser()` decorator in controllers to access the authenticated user:
```typescript
@Post('example')
@UseGuards(JwtAuthGuard)
example(@CurrentUser() user: User) {
  return { userId: user.id };
}
```

## 🤖 AI Integration

Edda AI uses three core prompts:

1. **Expense Categorization** — Categorizes new expenses into: food, transport, entertainment, utilities, shopping, health, other
2. **Monthly Report Generation** — Analyzes spending patterns, calculates score (0-100), detects leaks, and recommends wins
3. **Chat Response** — Real-time financial advice based on current month's category totals

All prompts include: *"All amounts are in IDR (Indonesian Rupiah)"* for proper financial context.

## 💾 Database Schema

### User
```
id (UUID, PK)
email (String, unique)
name (String)
passwordHash (String)
createdAt (DateTime)
```

### Expense
```
id (UUID, PK)
userId (UUID, FK → User)
amount (Decimal)
category (String)
date (DateTime)
description (String)
aiNote (String, nullable)
createdAt (DateTime)
```

### MonthlyReport
```
id (UUID, PK)
userId (UUID, FK → User)
year (Int)
month (Int)
score (Int)
scoreReason (String)
summary (String)
leaks (JSON array)
wins (JSON array)
categoryTotals (JSON)
generatedAt (DateTime)
```

Relations: User → Expenses/Reports (cascade delete)

## 🧪 Testing

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Supabase
See [SUPABASE_SETUP.md](../SUPABASE_SETUP.md) for full setup.

### Docker
```bash
docker-compose up -d
```

### Vercel / Railway / Heroku
1. Set `DATABASE_URL`, `JWT_SECRET`, `OPENROUTER_API_KEY` env vars
2. Run migrations: `npx prisma migrate deploy`
3. Build: `npm run build`
4. Start: `npm run start:prod`

## 🔗 Related

- [Frontend App](../frontend/README.md)
- [Supabase Setup](../SUPABASE_SETUP.md)
- [Project Plan](../eds-ledger-project-plan.md)
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
