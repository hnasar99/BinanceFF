create extension if not exists pgcrypto;

create type bounty_pricing_model as enum ('fixed', 'performance', 'hybrid');
create type bounty_status as enum ('draft', 'open', 'forming_team', 'running', 'evaluating', 'completed', 'failed', 'cancelled');

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  locale text not null default 'en',
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists agents (
  id uuid primary key default gen_random_uuid(),
  identity_ref text,
  name text not null,
  endpoint text,
  capabilities jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bounties (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references profiles(id) on delete set null,
  objective text not null,
  pricing_model bounty_pricing_model not null,
  budget_usd numeric(20,6) not null default 0,
  success_fee_bps integer not null default 0 check (success_fee_bps between 0 and 10000),
  constraints jsonb not null default '{}'::jsonb,
  status bounty_status not null default 'draft',
  gross_result_usd numeric(30,10),
  execution_cost_usd numeric(30,10),
  platform_fee_usd numeric(30,10),
  net_result_usd numeric(30,10),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  fingerprint text not null,
  display_name text,
  created_at timestamptz not null default now(),
  unique(fingerprint)
);

create table if not exists bounty_team_runs (
  id uuid primary key default gen_random_uuid(),
  bounty_id uuid not null references bounties(id) on delete cascade,
  team_id uuid not null references teams(id) on delete restrict,
  selected boolean not null default false,
  predicted_score numeric(10,6),
  realized_score numeric(10,6),
  created_at timestamptz not null default now()
);

create table if not exists team_members (
  team_id uuid not null references teams(id) on delete cascade,
  agent_id uuid not null references agents(id) on delete restrict,
  role text not null,
  ordinal integer not null default 0,
  primary key (team_id, agent_id, role)
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  bounty_id uuid not null references bounties(id) on delete cascade,
  agent_id uuid references agents(id) on delete set null,
  capability text not null,
  status text not null,
  cost_usd numeric(20,8) not null default 0,
  latency_ms numeric(20,6),
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists outcome_proofs (
  id uuid primary key default gen_random_uuid(),
  bounty_id uuid not null unique references bounties(id) on delete cascade,
  proof jsonb not null,
  verified boolean not null default false,
  verifier_ref text,
  created_at timestamptz not null default now()
);

create table if not exists agent_performance_events (
  id bigint generated always as identity primary key,
  agent_id uuid not null references agents(id) on delete cascade,
  bounty_id uuid references bounties(id) on delete cascade,
  team_id uuid references teams(id) on delete set null,
  success boolean not null,
  revenue_generated_usd numeric(30,10),
  cost_usd numeric(30,10),
  latency_ms numeric(20,6),
  risk_score numeric(10,6),
  task_embedding_ref text,
  created_at timestamptz not null default now()
);

create table if not exists tutor_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  locale text not null,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists notification_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  type text not null,
  payload jsonb not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table bounties enable row level security;
alter table tutor_sessions enable row level security;
alter table notification_events enable row level security;

create policy "profiles_self_select" on profiles for select using (auth.uid() = id);
create policy "profiles_self_update" on profiles for update using (auth.uid() = id);
create policy "bounties_owner_select" on bounties for select using (auth.uid() = requester_id);
create policy "bounties_owner_insert" on bounties for insert with check (auth.uid() = requester_id);
create policy "tutor_owner_all" on tutor_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notifications_owner_select" on notification_events for select using (auth.uid() = user_id);
