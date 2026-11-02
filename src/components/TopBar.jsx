export default function TopBar({
  left,
  title,
  onBack,
  score,
  progress = 0,
  level,
  xp
}) {
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
        <div style={styles.title}>{title}</div>

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
    minWidth: "56px",
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
    fontSize: "16px",
    textAlign: "center"
  },

  score: {
    fontSize: "15px",
    minWidth: "56px",
    textAlign: "right"
  },

  progressBg: {
    height: "8px",
    background: "#ddd",
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