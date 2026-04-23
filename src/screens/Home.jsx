import { units } from "../data/units";
function CircleProgress({ percent }) {
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  return (
    <div style={styles.circleWrapper}>
      <svg width="28" height="28">
        <circle
          cx="18"
          cy="18"
          r={radius}
          stroke="#ddd"
          strokeWidth="3"
          fill="none"
        />
        <circle
          cx="14"
          cy="14"
          r={radius}
          stroke="#58cc02"
          strokeWidth="3"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={
            circumference * (1 - percent / 100)
          }
          style={{ transition: "0.5s" }}
        />
      </svg>

      <div style={styles.circleText}>{percent}%</div>
    </div>
  );
}
export default function Home({ goUnit, unlockedUnits, progress }) {
  return (
    <div style={styles.container}>
      <h1 
        style={{ 
            fontSize: "clamp(12px, 4vw, 26px)",
            fontWeight: "bold",
            marginBottom: "20px" }}>
            🎮 English Vocabulary Fun Master
      </h1>
      <img src="/study.png" 
        style={{
          width: "120px",
          marginTop: "10px",
          borderRadius: "8px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)" 
        }} 
      />
      <p style={{ fontSize: "14px", opacity: 0.8 }}>
        Learn words step by step!
      </p>
      <h2
        style={{ 
            fontSize: "20px",
            marginTop: "10px",
            marginBottom: "10px" }}>
        Select a Unit
      </h2>

    {units.map((u) => {
      const isUnlocked = unlockedUnits.includes(u.id);
      const p = progress[u.id] || {};

      const percent = Math.floor(
        ((p.classification ? 1 : 0) +
        (p.matching ? 1 : 0) +
        (p.paragraph ? 1 : 0)) / 3 * 100
      );
      const isComplete = percent === 100;
        <button
          key={u.id}
          style={{
            ...styles.card,
            background: isUnlocked
              ? isComplete
              ? "#dcfce7"   // ⭐ 연한 초록
              : "white"
              : "#ccc",
            border: isComplete ? "2px solid #22c55e" : "none"  // ⭐ 강조
          }}>
        </button>

      return (
      <button
        key={u.id}
        style={{
          ...styles.card,
          background: isUnlocked
            ? isComplete
            ? "#d9f99d"
            : "white"
            : "#ccc",
          animation: isComplete ? "shine 1s ease" : "none"
        }}
        onClick={() => goUnit(u.id)}
        onMouseOver={(e) =>
          (e.currentTarget.style.transform = "scale(1.03)")
        }
        onMouseOut={(e) =>
          (e.currentTarget.style.transform = "scale(1)")
        }
      >
        <div style={styles.row}>
          <span>
            {isUnlocked ? "📘" : "🔒"} Unit {u.id}
          </span>

          <CircleProgress percent={Math.floor(percent)} />
        </div>

        {/* 진행바 */}
        <div style={styles.progressBg}>
          <div
            style={{
              
              ...styles.progressFill,
              width: `${percent}%`
            }}
          />
        </div>

        {isComplete && (
          <div style={styles.complete}>🏆 Complete!</div>
        )}
      </button>
    );
    })}
    </div>
  );
}
const styles = {
  container: {
    minHeight: "100vh",
    background: "#4facfe",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "16px",
    color: "white"
  },

  card: {
    width: "100%",
    maxWidth: "300px",
    padding: "8px",
    borderRadius: "8px",
    border: "none",
    marginTop: "6px",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  progressBg: {
    height: "6px",
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

  circleWrapper: {
    position: "relative",
    width: "36px",
    height: "36px"
  },

  circleText: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "8px",
    fontWeight: "bold"
  },

  complete: {
    marginTop: "5px",
    fontSize: "12px",
    color: "#166534",
    fontWeight: "bold"
  }
};