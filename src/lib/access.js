// 단원 공개 범위 + 이용권 코드.
// 무료 단원은 누구나, 나머지는 이용권 코드를 입력한 기기에서만 엽니다. (코드 확인은 Supabase: supabase/schema.sql)
export const FREE_UNITS = [1, 2, 21, 22, 41, 42, 61, 62];

const DEV_KEY = "wl.device", ENT_KEY = "wl.access.v1";
const URL_ = import.meta.env?.VITE_SUPABASE_URL, KEY_ = import.meta.env?.VITE_SUPABASE_ANON_KEY;
const safe = (fn, d) => { try { return fn(); } catch { return d; } };

export const redeemAvailable = () => !!(URL_ && KEY_);

/** 이 기기(브라우저)의 고유 번호. 이용권의 '기기 수 제한'은 이 값으로 셉니다. */
export function deviceId() {
  let id = safe(() => localStorage.getItem(DEV_KEY));
  if (!id) {
    id = (globalThis.crypto?.randomUUID?.() ?? `d${Date.now()}${Math.random().toString(36).slice(2)}`);
    safe(() => localStorage.setItem(DEV_KEY, id));
  }
  return id;
}

// 서버가 알려 준 { "3": "만료 시각", ... } 를 이 기기에 보관(오프라인에서도 만료 전까지 사용 가능).
const readUnits = () => safe(() => JSON.parse(localStorage.getItem(ENT_KEY) ?? "{}").units ?? {}, {});
const saveUnits = (units) => safe(() => localStorage.setItem(ENT_KEY, JSON.stringify({ units, at: Date.now() })));

export const isFreeUnit = (u) => FREE_UNITS.includes(u);
const devSwitch = () => import.meta.env?.DEV && safe(() => localStorage.getItem("wl.premium") === "1", false); // 개발 서버에서만 점검용
export function canOpenUnit(u) {
  if (isFreeUnit(u) || devSwitch()) return true;
  const e = readUnits()[u];
  return !!e && Date.parse(e) > Date.now();
}
export const isPremium = () => devSwitch();

/** 지금 이용 중인 이용권 요약: [{ label: "Level 1", until: Date }] */
export function accessSummary() {
  const units = Object.entries(readUnits()).map(([u, e]) => [Number(u), Date.parse(e)]).filter(([, t]) => t > Date.now());
  const out = [], loose = [];
  for (let lv = 1; lv <= 4; lv++) {
    const mine = units.filter(([u]) => Math.ceil(u / 20) === lv);
    if (mine.length === 20) out.push({ label: `Level ${lv}`, until: new Date(Math.min(...mine.map(([, t]) => t))) });
    else loose.push(...mine);
  }
  if (loose.length) out.push({ label: `Unit ${loose.map(([u]) => u).sort((a, b) => a - b).join(", ")}`, until: new Date(Math.min(...loose.map(([, t]) => t))) });
  return out;
}

async function rpc(name, body) {
  const r = await fetch(`${URL_}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: KEY_, ...(String(KEY_).startsWith("eyJ") ? { Authorization: `Bearer ${KEY_}` } : {}) },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export const REDEEM_ERRORS = {
  invalid: "코드를 찾을 수 없어요. 글자를 다시 확인해 주세요.",
  revoked: "사용이 중지된 코드예요. 구매처에 문의해 주세요.",
  expired: "이용 기간이 끝난 코드예요.",
  device_limit: "이 코드로 사용할 수 있는 기기 수를 모두 썼어요.",
  too_many: "잘못 입력한 횟수가 많아요. 잠시 후 다시 시도해 주세요.",
  bad_device: "이 기기에서는 코드를 사용할 수 없어요.",
  not_ready: "이용권 기능을 준비하고 있어요.",
  network: "인터넷 연결을 확인하고 다시 시도해 주세요.",
};

/** 코드 입력. 성공이면 { ok: true }, 실패이면 { ok: false, error } (error는 REDEEM_ERRORS의 키). */
export async function redeemCode(code) {
  if (!redeemAvailable()) return { ok: false, error: "not_ready" };
  try {
    const res = await rpc("redeem_code", { p_code: code, p_device: deviceId() });
    if (res?.ok) { saveUnits(res.units ?? {}); return { ok: true }; }
    return { ok: false, error: res?.error ?? "invalid" };
  } catch { return { ok: false, error: "network" }; }
}

/** 앱을 열 때 서버와 맞춰 보기(취소·만료 반영). 인터넷이 없으면 보관된 값을 그대로 씁니다. */
export async function refreshAccess() {
  if (!redeemAvailable() || !Object.keys(readUnits()).length) return;
  try { const res = await rpc("my_access", { p_device: deviceId() }); if (res?.ok) saveUnits(res.units ?? {}); } catch { /* 오프라인 */ }
}
