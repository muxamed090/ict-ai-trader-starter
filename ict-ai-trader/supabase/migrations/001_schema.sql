-- ═══════════════════════════════════════════════════════════
--  ICT AI Trader v2.0 — Database Schema
-- ═══════════════════════════════════════════════════════════

-- ── Signals ──────────────────────────────────────────────────
create table if not exists signals (
  id              uuid primary key default gen_random_uuid(),
  pair            text not null,
  direction       text not null check (direction in ('BUY','SELL')),
  score           int  not null check (score between 1 and 7),
  confidence      int  not null check (confidence between 0 and 100),
  entry           numeric(12,5) not null,
  sl              numeric(12,5) not null,
  tp1             numeric(12,5) not null,
  tp2             numeric(12,5) not null,
  session         text not null check (session in ('London','New York','Asia')),
  confluences     text[] not null default '{}',
  win_probability int  not null default 0,
  status          text not null default 'pending' check (status in ('pending','active','closed')),
  created_at      timestamptz not null default now()
);

-- ── Trade Journal ─────────────────────────────────────────────
create table if not exists trade_journal (
  id         uuid primary key default gen_random_uuid(),
  signal_id  uuid references signals(id) on delete set null,
  pair       text not null,
  session    text not null,
  score      int  not null,
  result     text not null check (result in ('WIN','LOSS','OPEN','CANCELLED')),
  pips       numeric(8,1) not null default 0,
  profit     numeric(10,2) not null default 0,
  rr_ratio   numeric(5,2) not null default 0,
  notes      text,
  closed_at  timestamptz,
  created_at timestamptz not null default now()
);

-- ── ML Weights (AI Learning) ──────────────────────────────────
create table if not exists ml_weights (
  id         serial primary key,
  weights    jsonb not null default '{
    "bos":0.20,"choch":0.18,"ob":0.17,"fvg":0.15,
    "liquidity":0.12,"ote":0.10,"htf":0.08
  }',
  version    int not null default 1,
  trade_count int not null default 0,
  updated_at timestamptz not null default now()
);

insert into ml_weights (id) values (1) on conflict do nothing;

-- ── News Events ───────────────────────────────────────────────
create table if not exists news_events (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  impact       text not null check (impact in ('HIGH','MEDIUM','LOW')),
  currency     text not null,
  scheduled_at timestamptz not null,
  actual       text,
  forecast     text,
  previous     text,
  created_at   timestamptz not null default now()
);

-- ── App Settings ─────────────────────────────────────────────
create table if not exists app_settings (
  id                    int primary key default 1 check (id = 1),
  trading_mode          text not null default 'rules_only',
  ai_learning_enabled   boolean not null default false,
  max_signals_per_day   int not null default 3,
  min_score             int not null default 7,
  telegram_enabled      boolean not null default true,
  telegram_channel_id   text not null default '',
  pairs_watchlist       text[] not null default
    '{"EURUSD","GBPUSD","XAUUSD","USDJPY","EURJPY","GBPJPY","AUDUSD","USDCAD","NZDUSD","USDCHF"}',
  updated_at            timestamptz not null default now()
);

insert into app_settings (id) values (1) on conflict do nothing;

-- ── Indexes ───────────────────────────────────────────────────
create index if not exists idx_signals_created    on signals(created_at desc);
create index if not exists idx_signals_status     on signals(status);
create index if not exists idx_journal_created    on trade_journal(created_at desc);
create index if not exists idx_journal_pair       on trade_journal(pair);
create index if not exists idx_news_scheduled     on news_events(scheduled_at);

-- ── Row Level Security ─────────────────────────────────────────
alter table signals       enable row level security;
alter table trade_journal enable row level security;
alter table ml_weights    enable row level security;
alter table news_events   enable row level security;
alter table app_settings  enable row level security;

-- Authenticated users can read/write all rows (single-user app)
create policy "auth_all" on signals       for all using (auth.role() = 'authenticated');
create policy "auth_all" on trade_journal for all using (auth.role() = 'authenticated');
create policy "auth_all" on ml_weights    for all using (auth.role() = 'authenticated');
create policy "auth_all" on news_events   for all using (auth.role() = 'authenticated');
create policy "auth_all" on app_settings  for all using (auth.role() = 'authenticated');
