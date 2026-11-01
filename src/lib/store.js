// 지금 학습 중인 단원 데이터를 동기적으로 읽을 수 있게 보관합니다. App이 단원에 들어갈 때 loadUnit()으로 채웁니다.
const cache = new Map();
export const primeUnit = (u, data) => cache.set(u, data);
export const getLoaded = (u) => cache.get(u);
