// 단원 공개 범위 — 시범 운영 기간에는 아래 8개 단원만 누구나 이용, 나머지는 유료 가입자 전용.
// 공개 단원을 바꿀 때는 이 목록만 고치면 됩니다.
export const FREE_UNITS = [1, 2, 21, 22, 41, 42, 61, 62];

const KEY = "wl.premium";
/** 유료 가입자 여부. 지금은 이 기기(브라우저)에 저장된 값만 읽습니다.
 *  결제·로그인 서버가 생기면 이 함수만 서버 확인으로 바꾸면 됩니다.
 *  (임시 점검용: 개발자 도구 콘솔에서 localStorage.setItem("wl.premium","1") 후 새로고침) */
export function isPremium() {
  try { return localStorage.getItem(KEY) === "1" || import.meta.env?.VITE_PREMIUM === "1"; } catch { return false; }
}
export const isFreeUnit = (u) => FREE_UNITS.includes(u);
export const canOpenUnit = (u) => isFreeUnit(u) || isPremium();
