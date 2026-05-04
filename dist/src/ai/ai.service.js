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
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = __importDefault(require("openai"));
const VALID_CATEGORIES = [
    'food',
    'transport',
    'entertainment',
    'subscriptions',
    'shopping',
    'health',
    'education',
    'utilities',
    'other',
];
const MODEL = 'meta-llama/llama-3.1-8b-instruct';
let AiService = class AiService {
    config;
    client;
    constructor(config) {
        this.config = config;
        this.client = new openai_1.default({
            apiKey: this.config.get('OPENROUTER_API_KEY'),
            baseURL: 'https://openrouter.ai/api/v1',
            defaultHeaders: {
                'HTTP-Referer': 'https://eds-ledger.app',
                'X-Title': 'EDS Ledger',
            },
        });
    }
    async categorizeExpenses(expenses) {
        const completion = await this.client.chat.completions.create({
            model: MODEL,
            max_tokens: 1024,
            messages: [
                {
                    role: 'system',
                    content: `You are a financial categorizer. All amounts are in IDR (Indonesian Rupiah). Return ONLY a JSON array. Each item: { "description": "...", "category": "...", "ai_note": "..." }
Valid categories: ${VALID_CATEGORIES.join(', ')}
ai_note is a SHORT 1-sentence Edward-style comment (max 10 words). Return ONLY valid JSON. No markdown.`,
                },
                {
                    role: 'user',
                    content: `Categorize these expenses (IDR):\n${JSON.stringify(expenses)}`,
                },
            ],
        });
        try {
            const text = completion.choices[0]?.message?.content ?? '[]';
            const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
            if (!Array.isArray(parsed))
                return [];
            return parsed.map((item) => ({
                description: String(item.description ?? ''),
                category: VALID_CATEGORIES.includes(item.category)
                    ? item.category
                    : 'other',
                ai_note: String(item.ai_note ?? ''),
            }));
        }
        catch {
            return [];
        }
    }
    async generateMonthlyReport(categoryTotals, totalSpent) {
        const completion = await this.client.chat.completions.create({
            model: MODEL,
            max_tokens: 1024,
            messages: [
                {
                    role: 'system',
                    content: `You are Edward Wong Hau Pepelu Tivrusky IV from Cowboy Bebop — personal finance bounty hunter.
All amounts are in IDR (Indonesian Rupiah).
Return ONLY valid JSON (no markdown):
{ "score": <0-100>, "score_reason": "...", "summary": "...", "leaks": [{"name":"...","amount":<n>,"tip":"..."}], "wins": ["..."] }`,
                },
                {
                    role: 'user',
                    content: `Expenses (IDR): ${JSON.stringify(categoryTotals)}\nTotal: Rp ${totalSpent.toLocaleString('id-ID')}`,
                },
            ],
        });
        const text = completion.choices[0]?.message?.content ?? '{}';
        const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
        return {
            score: Math.min(100, Math.max(0, Number(parsed.score) || 50)),
            score_reason: String(parsed.score_reason ?? ''),
            summary: String(parsed.summary ?? ''),
            leaks: Array.isArray(parsed.leaks) ? parsed.leaks : [],
            wins: Array.isArray(parsed.wins) ? parsed.wins : [],
        };
    }
    async chat(userMessage, categoryTotals) {
        const completion = await this.client.chat.completions.create({
            model: MODEL,
            max_tokens: 512,
            messages: [
                {
                    role: 'system',
                    content: `You are Edward Wong — chaotic genius finance AI. Use real numbers from the data below. Answer in Edward's fun voice.
All amounts are in IDR (Indonesian Rupiah).
EXPENSE DATA (IDR): ${JSON.stringify(categoryTotals)}`,
                },
                { role: 'user', content: userMessage },
            ],
        });
        return completion.choices[0]?.message?.content ?? '';
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map