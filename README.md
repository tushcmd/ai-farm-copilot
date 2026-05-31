# MicrorootsKE — AI Farm Copilot

AI-powered business intelligence for a microgreens farm. Built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**, and **OpenAI GPT-4o**.

## Stack

- **Next.js 16.2.6** — App Router, Turbopack, Server + Client Components
- **TypeScript** — strict mode
- **Tailwind CSS v4** — CSS variables theming
- **OpenAI GPT-4o** — business analysis, planting recommendations, streaming chat
- **Recharts** — revenue + product charts
- **PapaParse** — CSV parsing in the browser
- **react-dropzone** — drag-and-drop file upload
- **date-fns** — date calculations

## App Router Structure

```
app/
├── layout.tsx              # Root Server Component layout
├── page.tsx                # / — Upload page (Client Component)
├── dashboard/
│   └── page.tsx            # /dashboard — Metrics dashboard (Client Component)
├── chat/
│   └── page.tsx            # /chat — GPT-4o chat (Client Component)
└── api/
    ├── analyze/
    │   └── route.ts        # POST /api/analyze — business analysis + planting
    └── chat/
        └── route.ts        # POST /api/chat — streaming chat (ReadableStream)

components/
├── layout/
│   ├── Sidebar.tsx         # Navigation sidebar
│   └── AnalysisProviderWrapper.tsx  # Client boundary for React context
├── upload/
│   ├── CsvDropzone.tsx     # Drag-and-drop CSV upload
│   └── ColumnValidator.tsx # Column detection UI
├── dashboard/
│   ├── KpiCard.tsx         # Revenue / orders / product / customer KPIs
│   ├── RevenueChart.tsx    # Weekly revenue area chart
│   ├── ProductBreakdown.tsx# Product revenue bar chart
│   ├── CustomerTable.tsx   # Customer list with churn flags
│   ├── InsightsPanel.tsx   # GPT-4o business insights
│   └── PlantingCard.tsx    # AI weekly planting plan
└── chat/
    ├── ChatBubble.tsx      # Message bubble
    ├── ChatInput.tsx       # Textarea + send button
    └── SuggestedChips.tsx  # Starter question chips

context/
└── AnalysisContext.tsx     # Global state: parsed CSV, insights, chat history

lib/
└── csvParser.ts            # PapaParse wrapper + data analysis

types/
└── index.ts                # All TypeScript interfaces
```

## Setup

### 1. Clone and install

```bash
cd microroots-next
npm install
```

### 2. Add your OpenAI API key

```bash
echo "OPENAI_API_KEY=sk-your-key-here" > .env.local
```

### 3. Run development server

```bash
npm run dev
# Open http://localhost:3000
```

### 4. Build for production

```bash
npm run build
npm run start
```

## CSV Export from Odoo

Go to **Sales → Orders → Orders**, select orders, click **Action → Export**.

Required columns:

| Odoo Field | App Column |
|---|---|
| `name` | `order_id` |
| `date_order` | `order_date` |
| `partner_id` | `customer_name` |
| `order_line/product_id` | `product_name` |
| `order_line/product_uom_qty` | `quantity` |
| `order_line/price_unit` | `unit_price` |
| `order_line/price_subtotal` | `subtotal` |
| `state` | `order_status` |

A sample CSV with 90 days of realistic MicrorootsKE data is in `public/sample_data/`.

## How it works

1. **Upload** — drag-and-drop your Odoo CSV. Browser parses it with PapaParse, validates columns, runs data analysis locally (no server needed for this step).
2. **Analyze** — `POST /api/analyze` sends a structured data summary (~800 tokens) to GPT-4o. Returns 5 business insights + weekly planting recommendations.
3. **Dashboard** — KPI cards, revenue chart, product breakdown, customer table, AI insights panel, and planting card — all populated from your data.
4. **Chat** — `POST /api/chat` streams GPT-4o responses using `ReadableStream`. Full conversation history + CSV context sent on every request.

## Deploy to Vercel

```bash
npx vercel
# Add OPENAI_API_KEY in Vercel dashboard → Settings → Environment Variables
```

---

Built with [Perplexity Computer](https://perplexity.ai/computer) · MicrorootsKE · Nairobi, Kenya
