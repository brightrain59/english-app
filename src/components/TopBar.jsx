import { useRef, useLayoutEffect, useState } from "react";

export default function TopBar({
  left,
  title,
  titleSize,
  onBack,
  score,
  progress = 0,
  level,
  xp
}) {
  // 제목은 되도록 한 줄: 19px에서 시작해 16px까지 줄여 보고, 그래도 넘치면 18px로 두 줄
  const titleRef = useRef(null);
  const [size, setSize] = useState(19);
  useLayoutEffect(() => {
    const el = titleRef.current; if (!el) return;
    let sz = 19; el.style.whiteSpace = "nowrap";
    while (sz > 16 && el.scrollWidth > el.clientWidth) { sz -= 0.5; el.style.fontSize = sz + "px"; }
    if (el.scrollWidth > el.clientWidth) { sz = 18; el.style.whiteSpace = "normal"; el.style.fontSize = "18px"; }
    setSize(sz);
  }, [title]);

  return (
    <div style={styles.wrapper}>
      
      {/* 상단 */}
      <div style={styles.row}>
        
        {/* 뒤로가기 */}
        {left ? (
          left
        ) : (
          <button 
            style={styles.backBtn} 
            onClick={() => {
              onBack && onBack();
            }}
          >
            ❮
          </button>
        )}

        {/* 제목 */}
        <div ref={titleRef} style={{ ...styles.title, fontSize: `${size}px` }}>{title}</div>

        {/* 점수 */}
        <div style={styles.score}>{score != null ? `⭐ ${score}` : ""}</div>
        </div>

      {/* 진행률 바 */}
      <div style={styles.progressBg}>
        <div
          style={{
            ...styles.progressFill,
            width: `${progress}%`
          }}
        />
        </div>

        {level != null && xp != null && (
          <>
            <div style={styles.level}>🏅 Lv.{level} | XP {xp}</div>
            <div style={styles.xpBarWrap}>
              <div style={{ ...styles.xpBar, width: `${(xp % 50) * 2}%` }} />
            </div>
          </>
        )}
      </div>
  );
}

const styles = {
  wrapper: {
    width: "100%",
    maxWidth: "400px",
    marginBottom: "10px"
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "white"
  },

  backBtn: {
    minWidth: "36px",
    textAlign: "left",
    border: "none",
    background: "transparent",
    color: "white",
    fontSize: "20px",
    cursor: "pointer"
  },

  title: {
    color: "#fff",
    fontWeight: "bold",
    flex: 1,
    minWidth: 0,
    textAlign: "center",
    lineHeight: 1.3
  },

  score: {
    fontSize: "15px",
    minWidth: "44px",
    textAlign: "right"
  },

  progressBg: {
    height: "5px",
    background: "#ffcf70",   // 연한 골드(오렌지 기운)
    borderRadius: "10px",
    marginTop: "5px"
  },

  progressFill: {
    height: "100%",
    background: "#58cc02",
    borderRadius: "10px",
    transition: "0.3s"
  },

  level: {
    fontSize: "13px",
    color: "white"
  },

  xpBarWrap: {
    width: "100%",
    height: "6px",
    background: "rgba(255,255,255,0.3)",
    borderRadius: "10px",
    marginTop: "6px",
    overflow: "hidden"
  },

  xpBar: {
    height: "100%",
    background: "linear-gradient(90deg, #ffeb3b, #ff9800)",
    transition: "width 0.3s ease"
  }
};