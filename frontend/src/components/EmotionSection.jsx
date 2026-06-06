import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ScrollTypewriter } from "../App";

const EMO_LABELS = {
  joy: "Joy",
  anger: "Anger",
  fear: "Fear",
  surprise: "Surprise",
  sadness: "Sadness",
};

/* ── EDITORIAL 3D ISOMETRIC BAR CHART ── */
const IsometricBarChart = ({ emotions, visible, dominantKey }) => {
  const data = Object.entries(emotions || { joy: 20, anger: 20, fear: 20, surprise: 20, sadness: 20 });
  const maxVal = Math.max(...data.map(d => d[1]), 1);
  const dx = 18; 
  const dy = 10; 

  return (
    <svg viewBox="0 0 420 320" style={{ width: "100%", height: "100%", overflow: "visible", marginTop: "24px" }}>
      {data.map(([key, val], i) => {
        const isDominant = key === dominantKey;
        const label = EMO_LABELS[key] || key;
        
        // Color Theory: Neon accent for the winner, deep matte charcoal for the rest
        const baseFill = isDominant ? "var(--accent)" : "#161616";
        const topFill = isDominant ? "var(--accent)" : "#222222";
        const fillOpacityLeft = isDominant ? 0.8 : 1;
        const fillOpacityRight = isDominant ? 0.5 : 1;

        const targetHeight = Math.max((val / maxVal) * 180, 10);
        const x = 60 + i * 65; 
        const y = 240; 

        const leftFace = `M ${x},${y} L ${x},${y - targetHeight} L ${x + dx},${y - targetHeight + dy} L ${x + dx},${y + dy} Z`;
        const rightFace = `M ${x + dx},${y + dy} L ${x + dx},${y - targetHeight + dy} L ${x + dx * 2},${y - targetHeight} L ${x + dx * 2},${y} Z`;
        const topFace = `M ${x},${y - targetHeight} L ${x + dx},${y - targetHeight - dy} L ${x + dx * 2},${y - targetHeight} L ${x + dx},${y - targetHeight + dy} Z`;

        return (
          <g key={key}>
            <motion.path d={leftFace} fill={baseFill} opacity={fillOpacityLeft}
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: visible ? fillOpacityLeft : 0, pathLength: visible ? 1 : 0 }}
              transition={{ duration: 1, delay: i * 0.1 }} />
            <motion.path d={rightFace} fill={baseFill} opacity={fillOpacityRight}
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: visible ? fillOpacityRight : 0, pathLength: visible ? 1 : 0 }}
              transition={{ duration: 1, delay: i * 0.1 }} />
            <motion.path d={topFace} fill={topFill}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
              transition={{ duration: 0.8, delay: i * 0.1 + 0.2 }} />

            <motion.text
              x={x + dx} y={y - targetHeight - 20}
              fill={isDominant ? "var(--accent)" : "var(--muted)"}
              fontSize="14" fontWeight="300" textAnchor="middle"
              initial={{ opacity: 0 }} animate={{ opacity: visible ? 1 : 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}>
              {val}%
            </motion.text>

            <motion.text
              x={x + dx} y={y + 35}
              fill="var(--ghost)"
              fontSize="10" fontWeight="600" letterSpacing="2px" textAnchor="middle" textTransform="uppercase"
              initial={{ opacity: 0 }} animate={{ opacity: visible ? 1 : 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}>
              {label}
            </motion.text>
          </g>
        );
      })}
      
      <motion.line x1="20" y1="260" x2="400" y2="260" stroke="var(--border)" strokeWidth="1"
        initial={{ scaleX: 0 }} animate={{ scaleX: visible ? 1 : 0 }} transition={{ duration: 1 }} />
    </svg>
  );
};

const EmotionSection = ({ emotions, topic }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const xL = useTransform(scrollYProgress, [0, 0.4], [-80, 0]);
  const xR = useTransform(scrollYProgress, [0, 0.4], [80, 0]);
  const op = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  useEffect(() => {
    const unsub = scrollYProgress.on("change", v => {
      if (v > 0.1) { setVisible(true); unsub(); }
    });
    return unsub;
  }, [scrollYProgress]);

  const entries  = Object.entries(emotions || {});
  const dominant = entries.reduce((a, b) => b[1] > a[1] ? b : a, ["", 0]);
  const label    = EMO_LABELS[dominant[0]] || "Mixed";

  const narrativeText = `The primary behavioral driver in discussions surrounding ${topic} is ${label.toLowerCase()}, directly influencing the velocity of information spread.`;

  return (
    <section ref={ref} className="sticky-container">
      <motion.div style={{ opacity: op }} className="section-inner">

        <motion.div style={{ x: xL }} className="sentiment-narrative">
          <div className="chapter-tag">Chapter III — Emotion</div>
          <h2 className="trend-score" style={{ color: "var(--accent)" }}>
            {label}
          </h2>
          <p className="section-subtitle">
            <ScrollTypewriter text={narrativeText} />
          </p>
          
          <div style={{ marginTop: "40px", borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
            <span style={{ color: "var(--accent)", fontSize: "48px", fontWeight: "300", letterSpacing: "-0.02em", display: "block", marginBottom: "8px" }}>
              {dominant[1]}%
            </span>
            <span className="score-label" style={{ fontSize: "10px", color: "var(--ghost)" }}>{label} Saturation</span>
          </div>
        </motion.div>

        <motion.div style={{ x: xR }} className="radar-viz">
          <div style={{ width: "100%", position: "relative", display: "flex", justifyContent: "center" }}>
            <span className="score-label" style={{ position: "absolute", top: 0, left: 0, color: "var(--ghost)" }}>Emotional Index</span>
            <IsometricBarChart emotions={emotions} visible={visible} dominantKey={dominant[0]} />
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
};

export default EmotionSection;