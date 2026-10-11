create schema success;
revoke all on schema success from public;
create function success.touch_updated() returns trigger language plpgsql as $$begin new.updated_at=now();return new;end$$;
create table success.accounts (
 id uuid primary key default gen_random_uuid(), name text not null check(length(trim(name))>0),
 owner text not null check(length(trim(owner))>0), segment text not null default 'standard',
 contact text not null default '', notice_evidence text, retention_review_on date, security_review_on date,
 source_id text unique, source_data jsonb, source_hash text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index accounts_name on success.accounts(lower(name));
create table success.contracts (
 id uuid primary key default gen_random_uuid(), account_id uuid not null references success.accounts,
 name text not null check(length(trim(name))>0), starts_on date not null, renews_on date not null,
 arr_cents bigint not null check(arr_cents>=0), currency text not null check(currency ~ '^[A-Z]{3}$'),
 status text not null default 'active' check(status in ('active','renewed','churned')),
 decided_on date, evidence text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(renews_on>starts_on), check(status='active' or (decided_on is not null and length(trim(coalesce(evidence,'')))>0))
);
create unique index one_active_contract on success.contracts(account_id) where status='active';
create table success.usage (
 id uuid primary key default gen_random_uuid(), account_id uuid not null references success.accounts,
 name text not null, observed_on date not null, active_users integer not null check(active_users>=0),
 licensed_users integer not null check(licensed_users>0 and active_users<=licensed_users), evidence text not null check(length(trim(evidence))>0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(account_id,observed_on)
);
create table success.touchpoints (
 id uuid primary key default gen_random_uuid(), account_id uuid not null references success.accounts,
 name text not null check(length(trim(name))>0), occurred_on date not null,
 sentiment text not null check(sentiment in ('positive','neutral','negative')), actor text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table success.actions (
 id uuid primary key default gen_random_uuid(), account_id uuid not null references success.accounts,
 name text not null check(length(trim(name))>0), owner text not null check(length(trim(owner))>0), due_on date not null,
 status text not null default 'open' check(status in ('open','done')), evidence text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(status='open' or length(trim(coalesce(evidence,'')))>0)
);
create table success.objectives (
 id uuid primary key default gen_random_uuid(), account_id uuid not null references success.accounts,
 name text not null check(length(trim(name))>0), due_on date not null,
 status text not null default 'open' check(status in ('open','achieved','cancelled')), evidence text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(status='open' or length(trim(coalesce(evidence,'')))>0)
);
create table success.activity (
 id uuid primary key default gen_random_uuid(), name text not null, actor text not null, detail jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
do $$declare n text;begin foreach n in array array['accounts','contracts','usage','touchpoints','actions','objectives','activity'] loop
 execute format('create trigger touch_updated before update on success.%I for each row execute function success.touch_updated()',n);
 execute format('alter table success.%I enable row level security',n);
 execute format('revoke all on success.%I from public',n);
end loop;end$$;
create view success.account_health as
with base as (
 select a.id,a.name,a.owner,a.segment,c.id contract_id,c.renews_on,c.arr_cents,c.currency,
 u.observed_on,u.active_users,u.licensed_users,round(100.0*u.active_users/nullif(u.licensed_users,0),1) adoption_pct,
 t.occurred_on last_touch,t.sentiment,
 (select count(*)::int from success.actions x where x.account_id=a.id and x.status='open' and x.due_on<current_date) overdue_actions,
 (select count(*)::int from success.objectives o where o.account_id=a.id and o.status='open' and o.due_on<current_date) overdue_objectives
 from success.accounts a left join success.contracts c on c.account_id=a.id and c.status='active'
 left join lateral (select * from success.usage u where u.account_id=a.id order by observed_on desc,id limit 1) u on true
 left join lateral (select * from success.touchpoints t where t.account_id=a.id order by occurred_on desc,created_at desc,id limit 1) t on true
)
select *,
 case when sentiment='negative' or overdue_actions>0 or (observed_on>=current_date-14 and adoption_pct<40) then 'at risk'
 when observed_on is null or observed_on<current_date-14 or last_touch is null or last_touch<current_date-30 then 'unknown'
 when adoption_pct<70 or overdue_objectives>0 then 'watch' else 'healthy' end health,
 concat_ws('; ',case when sentiment='negative' then 'negative last conversation' end,
 case when overdue_actions>0 then 'overdue follow-up' end,
 case when observed_on is null or observed_on<current_date-14 then 'usage evidence missing or stale' end,
 case when last_touch is null or last_touch<current_date-30 then 'no recent conversation' end,
 case when observed_on>=current_date-14 and adoption_pct<40 then 'adoption below 40 percent' end,
 case when overdue_objectives>0 then 'overdue customer outcome' end) reasons
from base;
create view success.renewal_queue as
select id,name,owner,renews_on,(renews_on-current_date) days_to_renewal,arr_cents,currency,health,reasons
from success.account_health where renews_on<=current_date+90;
create view success.action_queue as
select x.id,a.name account,x.name,x.owner,x.due_on,x.status,x.evidence,(x.status='open' and x.due_on<current_date) overdue
from success.actions x join success.accounts a on a.id=x.account_id;
create view success.privacy_review as
select id,name,nullif(concat_ws('; ',
 case when coalesce(trim(notice_evidence),'')='' then 'Notice assessment missing (IPP3/3A)' end,
 case when retention_review_on is null or retention_review_on<current_date then 'Retention review due (IPP9)' end,
 case when security_review_on is null or security_review_on<current_date then 'Security review due (IPP5)' end),'') finding
from success.accounts;
revoke all on all tables in schema success from public;
