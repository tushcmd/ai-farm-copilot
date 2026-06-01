import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Groq — OpenAI-compatible API, free tier, no credit card required
// Sign up + get key at: https://console.groq.com/keys
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const MODEL = "llama-3.3-70b-versatile";

// Retry a function up to maxAttempts times on 429 errors, with exponential backoff
async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      const isRateLimit =
        typeof err === "object" &&
        err !== null &&
        "status" in err &&
        (err as { status: number }).status === 429;
      if (!isRateLimit || attempt === maxAttempts) throw err;
      const waitMs = attempt * 10000; // 10s, 20s
      console.warn(`429 rate limit – retrying in ${waitMs / 1000}s (attempt ${attempt}/${maxAttempts})`);
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }
  throw lastError;
}

function buildAnalysisPrompt(csvSummary: string): string {
  return `You are an AI business analyst for MicrorootsKE, a microgreens farm in Nairobi, Kenya.

Here is a structured summary of their recent sales data:
${csvSummary}

Provide EXACTLY 5 bullet-point insights. Be specific with numbers from the data.
Focus on: revenue patterns, top-performing products, customer loyalty, risk signals, and operational opportunities.

Respond with a JSON object with key "insights" containing an array of exactly 5 objects:
{
  "insights": [
    { "type": "REVENUE", "text": "specific finding with numbers" },
    { "type": "PRODUCT", "text": "specific finding with numbers" },
    { "type": "CUSTOMER", "text": "specific finding with numbers" },
    { "type": "RISK", "text": "specific finding with numbers" },
    { "type": "OPPORTUNITY", "text": "specific finding with numbers" }
  ]
}

Use KES for currency. Be specific, data-driven, and actionable. No generic advice.`;
}

function buildPlantingPrompt(csvSummary: string): string {
  const today = new Date().toLocaleDateString("en-KE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return `You are an expert microgreens farm manager advising MicrorootsKE in Nairobi, Kenya.

Sales data summary:
${csvSummary}

Today is ${today}. Microgreens typically take 7-14 days to grow.

Based on sales velocity, revenue data, and demand patterns, provide planting recommendations for THIS WEEK.

Respond with ONLY valid JSON:
{
  "plant_now": [
    { "product": "product name", "quantity": "X trays", "reason": "brief reason based on data" },
    { "product": "product name", "quantity": "X trays", "reason": "brief reason based on data" },
    { "product": "product name", "quantity": "X trays", "reason": "brief reason based on data" }
  ],
  "reduce": { "product": "product name", "reason": "brief reason based on data" },
  "opportunity": { "product": "product name or new idea", "reason": "brief reason based on data" }
}`;
}

// Strip markdown code fences that some models wrap JSON in
function extractJson(raw: string): string {
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  return match ? match[1].trim() : raw.trim();
}

export async function POST(request: NextRequest) {
  try {
    const { csvSummary } = await request.json();
    if (!csvSummary) {
      return NextResponse.json({ error: "csvSummary is required" }, { status: 400 });
    }

    // Run sequentially to avoid doubling rate-limit pressure
    const insightsRes = await withRetry(() =>
      openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: buildAnalysisPrompt(csvSummary) }],
        temperature: 0.3,
        max_tokens: 1500,
      })
    );

    const plantingRes = await withRetry(() =>
      openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: buildPlantingPrompt(csvSummary) }],
        temperature: 0.4,
        max_tokens: 1000,
      })
    );

    const insightsRaw = extractJson(insightsRes.choices[0]?.message?.content || "{}");
    const plantingRaw = extractJson(plantingRes.choices[0]?.message?.content || "{}");

    let insights;
    try {
      const parsed = JSON.parse(insightsRaw);
      insights = parsed.insights || (Array.isArray(parsed) ? parsed : []);
    } catch {
      insights = [];
    }

    let planting;
    try {
      planting = JSON.parse(plantingRaw);
    } catch {
      planting = null;
    }

    return NextResponse.json({ insights, planting });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    console.error("Analyze error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
