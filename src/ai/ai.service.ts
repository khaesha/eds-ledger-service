import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface CategorizedExpense {
  description: string;
  category: string;
  ai_note: string;
}

export interface ReportResult {
  score: number;
  score_reason: string;
  summary: string;
  leaks: { name: string; amount: number; tip: string }[];
  wins: string[];
}

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

// Cheap & capable for JSON tasks via OpenRouter (~$0.06/M tokens)
const MODEL = 'meta-llama/llama-3.1-8b-instruct';

@Injectable()
export class AiService {
  private readonly client: OpenAI;

  constructor(private readonly config: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.config.get<string>('OPENROUTER_API_KEY'),
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://eds-ledger.app',
        'X-Title': 'EDS Ledger',
      },
    });
  }

  async categorizeExpenses(
    expenses: { description: string; amount: number }[],
  ): Promise<CategorizedExpense[]> {
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
      const parsed: unknown = JSON.parse(
        text.replace(/```json|```/g, '').trim(),
      );
      if (!Array.isArray(parsed)) return [];

      return (parsed as CategorizedExpense[]).map((item) => ({
        description: String(item.description ?? ''),
        category: VALID_CATEGORIES.includes(item.category)
          ? item.category
          : 'other',
        ai_note: String(item.ai_note ?? ''),
      }));
    } catch {
      return [];
    }
  }

  async generateMonthlyReport(
    categoryTotals: Record<string, number>,
    totalSpent: number,
  ): Promise<ReportResult> {
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
    const parsed = JSON.parse(
      text.replace(/```json|```/g, '').trim(),
    ) as ReportResult;

    return {
      score: Math.min(100, Math.max(0, Number(parsed.score) || 50)),
      score_reason: String(parsed.score_reason ?? ''),
      summary: String(parsed.summary ?? ''),
      leaks: Array.isArray(parsed.leaks) ? parsed.leaks : [],
      wins: Array.isArray(parsed.wins) ? parsed.wins : [],
    };
  }

  async chat(
    userMessage: string,
    categoryTotals: Record<string, number>,
  ): Promise<string> {
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
}
