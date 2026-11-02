-- Word Ladder 1200 — 이용권 코드 (Supabase SQL Editor에 통째로 붙여 넣고 Run)
-- 학생 앱은 아래 두 함수(redeem_code, my_access)만 호출할 수 있고, 표는 직접 읽을 수 없습니다.

create table if not exists access_codes (
  code          text primary key,                 -- 대문자·숫자 12자(하이픈 없이)
  kind          text not null check (kind in ('level','all','unit')),
  levels        int[] not null default '{}',      -- kind=level: [1] 또는 [1,2] …
  units         int[] not null default '{}',      -- kind=unit : [3,5] …
  duration_days int  not null,                    -- 처음 사용한 날부터 며칠
  max_devices   int  not null default 3,          -- 개인 3, 학원 30
  label         text,                             -- 판매처·학원 이름(메모)
  created_at    timestamptz not null default now(),
  expires_at    timestamptz,                      -- 처음 사용할 때 채워짐
  revoked       boolean not null default false    -- true로 바꾸면 즉시 무효
);

create table if not exists code_activations (
  code         text not null references access_codes(code) on delete cascade,
  device_id    text not null,
  activated_at timestamptz not null default now(),
  last_seen    timestamptz not null default now(),
  primary key (code, device_id)
);

create table if not exists code_attempts (        -- 잘못된 코드 입력 기록(무차별 대입 방지)
  device_id text not null,
  at        timestamptz not null default now()
);
create index if not exists code_attempts_idx on code_attempts (device_id, at);

alter table access_codes      enable row level security;   -- 정책을 만들지 않으므로
alter table code_activations  enable row level security;   -- 앱(anon)은 표를 직접 읽지 못함
alter table code_attempts     enable row level security;

create or replace function wl_norm(p text) returns text
language sql immutable as $$ select upper(regexp_replace(coalesce(p,''), '[^A-Za-z0-9]', '', 'g')) $$;

-- 한 코드가 여는 단원 번호들
create or replace function wl_code_units(c access_codes) returns int[]
language sql immutable as $$
  select case c.kind
    when 'all'  then array(select generate_series(1,80))
    when 'unit' then c.units
    else array(select u from generate_series(1,80) u where ceil(u/20.0)::int = any(c.levels))
  end
$$;

-- 이 기기에서 지금 열 수 있는 단원과 각각의 만료 시각:  {"ok":true,"units":{"3":"2027-11-02T..."}}
create or replace function my_access(p_device text) returns json
language sql security definer set search_path = public as $$
  select json_build_object('ok', true, 'units',
    coalesce((select json_object_agg(u::text, e) from (
      select u, max(c.expires_at) as e
      from code_activations a
      join access_codes c on c.code = a.code
      cross join lateral unnest(wl_code_units(c)) as u
      where a.device_id = p_device and not c.revoked and c.expires_at > now()
      group by u) t), '{}'::json))
$$;

create or replace function redeem_code(p_code text, p_device text) returns json
language plpgsql security definer set search_path = public as $$
declare c access_codes; n int; k text := wl_norm(p_code);
begin
  if p_device is null or length(p_device) < 8 then
    return json_build_object('ok', false, 'error', 'bad_device');
  end if;
  if (select count(*) from code_attempts where device_id = p_device and at > now() - interval '10 minutes') >= 10 then
    return json_build_object('ok', false, 'error', 'too_many');
  end if;

  select * into c from access_codes where code = k for update;
  if not found then
    insert into code_attempts(device_id) values (p_device);
    return json_build_object('ok', false, 'error', 'invalid');
  end if;
  if c.revoked then return json_build_object('ok', false, 'error', 'revoked'); end if;
  if c.expires_at is not null and c.expires_at <= now() then
    return json_build_object('ok', false, 'error', 'expired');
  end if;

  if exists (select 1 from code_activations where code = c.code and device_id = p_device) then
    update code_activations set last_seen = now() where code = c.code and device_id = p_device;
  else
    select count(*) into n from code_activations where code = c.code;
    if n >= c.max_devices then return json_build_object('ok', false, 'error', 'device_limit'); end if;
    insert into code_activations(code, device_id) values (c.code, p_device);
    if c.expires_at is null then
      update access_codes set expires_at = now() + make_interval(days => c.duration_days) where code = c.code;
    end if;
  end if;
  return my_access(p_device);
end $$;

revoke all on function redeem_code(text, text) from public;
revoke all on function my_access(text) from public;
grant execute on function redeem_code(text, text) to anon;
grant execute on function my_access(text) to anon;
