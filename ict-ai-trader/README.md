# ICT AI Trader v2.0

**Nidaamka Ganacsiga Mustaqbalka** — Next.js · Supabase · Telegram Bot

---

## Qalabka Loo Baahan Yahay

- Node.js 18+
- npm / yarn
- Supabase account — [supabase.com](https://supabase.com)
- Telegram Bot token — @BotFather

---

## Tallaabooyinka Dejinta

### 1. Clone + Install

```bash
git clone <your-repo>
cd ict-ai-trader
npm install
```

### 2. Supabase Setup

1. [supabase.com](https://supabase.com) → Project cusub samee
2. SQL Editor → `supabase/migrations/001_schema.sql` ku run garee
3. Settings → API → URL iyo Anon Key kobi

### 3. Telegram Bot

1. Telegram → @BotFather → `/newbot`
2. Token-ka kobi
3. Channel cusub samee → bot-ka admin ka dhig

### 4. Environment Variables

```bash
cp .env.local.example .env.local
# .env.local fur oo keys-kaaga ku buuxi
```

### 5. Supabase Edge Functions Deploy

```bash
npx supabase login
npx supabase link --project-ref your-project-ref

# Secrets set garee
npx supabase secrets set TELEGRAM_BOT_TOKEN=your-token

# Functions deploy
npx supabase functions deploy ict-rules
npx supabase functions deploy signal-dispatcher
npx supabase functions deploy ml-prediction
npx supabase functions deploy news-filter
```

### 6. Run App

```bash
npm run dev
# → http://localhost:3000
```

---

## Qaab-dhismeedka Mashruuca

```
src/
├── app/
│   ├── auth-login/   — Login page
│   ├── dashboard/    — Main dashboard
│   ├── signals/      — Signal feed
│   ├── journal/      — Trade journal
│   └── settings/     — App settings
├── components/       — Reusable UI components
├── lib/
│   ├── supabase/     — DB client (browser + server)
│   ├── ict/          — ICT Rules Engine
│   ├── ml/           — ML Prediction model
│   └── telegram/     — Bot helper
├── hooks/            — React hooks
└── types/            — TypeScript types

supabase/
├── functions/
│   ├── ict-rules/          — M1: ICT scoring
│   ├── ml-prediction/      — M10: Win probability
│   ├── signal-dispatcher/  — M7: Telegram sender
│   └── news-filter/        — M2: News guard
└── migrations/
    └── 001_schema.sql      — Database schema
```

---

## Habka Shaqada

```
Market Data → ICT Rules (score 7/7?) → News Filter → ML Prediction
→ Pair Ranking → Premium Selection → Telegram + Dashboard
→ [Trade closed] → Trade Journal → AI Learning → ML Retraining
```

---

## Trading Modes

| Mode | Sharax |
|------|--------|
| `rules_only` | ICT 7/7 kaliya — ML OFF (default) |
| `hybrid` | ICT + ML labadaba — ICT ayaa final word leh |
| `ml_priority` | ML ayaa go'aansata — 1000+ trades ka dib |
