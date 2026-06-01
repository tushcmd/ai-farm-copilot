import { NextRequest } from 'next/server';
import OpenAI from 'openai';

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://microrootske.com',
    'X-Title': 'MicrorootsKE AI Farm Copilot',
  },
});
const MODEL = 'deepseek/deepseek-v3-0324:free';

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

function buildSystemPrompt(csvSummary: string): string {
  return `You are the AI Farm Copilot for MicrorootsKE, a microgreens farm in Nairobi, Kenya.

You have access to their real sales data:
${csvSummary}

Your role:
- Answer business questions using the data above
- Give specific, actionable recommendations grounded in the data
- Use Kenyan context (KES currency, Nairobi market, local growing conditions)
- Be concise — 2-4 sentences unless a list is more useful
- When data doesn't support a claim, say so clearly
- Always use actual customer names, product names, and revenue figures from the data

You can answer questions about: revenue trends, best customers, churn risk, what to plant, pricing, and operational efficiency.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages: ChatMessage[] = body.messages;
    const csvSummary: string = body.csvSummary;

    if (!messages || !csvSummary) {
      return new Response(
        JSON.stringify({ error: 'messages and csvSummary are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Create a streaming ReadableStream using OpenAI streaming
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const openaiStream = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: buildSystemPrompt(csvSummary) },
              ...messages,
            ],
            temperature: 0.5,
            stream: true,
          });

          for await (const chunk of openaiStream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              controller.enqueue(new TextEncoder().encode(delta));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Chat failed';
    console.error('Chat error:', err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
