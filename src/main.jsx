import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 모든 버튼에 클릭 리플. 화면에서 이미 리플을 만든 버튼(.ripple 있음)은 건너뜁니다.
document.addEventListener("click", (e) => {
  const b = e.target instanceof Element ? e.target.closest("button") : null;
  if (!b || b.disabled || b.querySelector(".ripple")) return;
  const r = b.getBoundingClientRect(); const d = Math.max(r.width, r.height);
  const c = document.createElement("span"); c.className = "ripple";
  const light = getComputedStyle(b).backgroundColor.match(/\d+/g)?.slice(0, 3).reduce((a, v) => a + Number(v), 0) > 600;
  c.style.cssText = `width:${d}px;height:${d}px;left:${(e.clientX || r.left + r.width / 2) - r.left - d / 2}px;top:${(e.clientY || r.top + r.height / 2) - r.top - d / 2}px;background:${light ? "rgba(29,111,216,0.25)" : "rgba(255,255,255,0.4)"}`;
  b.appendChild(c); setTimeout(() => c.remove(), 450);
}, false);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}