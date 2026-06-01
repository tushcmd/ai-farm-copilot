import { NextRequest } from "next/server";
import OpenAI from "openai";

// Groq — OpenAI-compatible API, free tier, no credit card required
// Sign up + get key at: https://console.groq.com/keys
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const MODEL = "llama-3.3-70b-versatile";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages: ChatMessage[] = body.messages;
    const csvSummary: string = body.csvSummary;

    if (!messages || !csvSummary) {
      return new Response(JSON.stringify({ error: "messages and csvSummary are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Retry up to 3 times on 429 with backoff
    let openaiStream;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        openaiStream = await openai.chat.completions.create({
          model: MODEL,
          messages: [
            { role: "system", content: buildSystemPrompt(csvSummary) },
            ...messages,
          ],
          temperature: 0.5,
          max_tokens: 800,
          stream: true,
        });
        break;
      } catch (err: unknown) {
        const isRateLimit =
          typeof err === "object" &&
          err !== null &&
          "status" in err &&
          (err as { status: number }).status === 429;
        if (!isRateLimit || attempt === 3) throw err;
        const waitMs = attempt * 10000;
        console.warn(`429 rate limit on chat – retrying in ${waitMs / 1000}s (attempt ${attempt}/3)`);
        await sleep(waitMs);
      }
    }

    if (!openaiStream) {
      throw new Error("Failed to create stream after retries");
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of openaiStream!) {
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
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Chat failed";
    console.error("Chat error:", err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
