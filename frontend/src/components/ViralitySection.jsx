import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ScrollTypewriter } from "../App";

const ViralitySection = ({ score, topic }) => {
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

  const vScore = score || 50;
  const statusLabel = vScore >= 80 ? "Critical Velocity" : vScore >= 50 ? "Steady Momentum" : "Low Traction";

  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (vScore / 100) * circumference;

  const narrativeText = `Velocity metrics indicate that content related to ${topic} is moving at ${statusLabel.toLowerCase()} across major distribution channels, showing an engagement index of ${vScore} points.`;

  return (
    <section ref={ref} className="sticky-container">
      <motion.div style={{ opacity: op }} className="section-inner">

        <motion.div style={{ x: xL }} className="sentiment-narrative">
          <div className="chapter-tag">Chapter IV — Virality</div>
          <h2 className="trend-score" style={{ color: "var(--accent)" }}>
            Velocity
          </h2>
          <p className="section-subtitle">
            <ScrollTypewriter text={narrativeText} />
          </p>
        </motion.div>

        <motion.div style={{ x: xR }} className="ring-viz" style={{ border: "none", background: "transparent" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "48px", width: "100%" }}>
            
            <div style={{ position: "relative", width: "260px", height: "260px" }}>
              <svg width="260" height="260" viewBox="0 0 260 260" style={{ transform: "rotate(-90deg)" }}>
                {/* Hairline background track */}
                <circle cx="130" cy="130" r={radius} fill="transparent" stroke="var(--border)" strokeWidth="1" />
                {/* Neon Accent Fill */}
                <motion.circle 
                  cx="130" cy="130" r={radius} fill="transparent" 
                  stroke="var(--accent)" strokeWidth="4" strokeLinecap="square"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: visible ? strokeDashoffset : circumference }}
                  transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </svg>

              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "80px", fontWeight: "300", letterSpacing: "-0.04em", color: "var(--platinum)", lineHeight: "1" }}>
                  {vScore}
                </span>
                <span style={{ fontSize: "10px", fontWeight: "600", color: "var(--ghost)", letterSpacing: "2px", textTransform: "uppercase", marginTop: "8px" }}>
                  / 100 Index
                </span>
              </div>
            </div>

            <div style={{ textAlign: "center", borderTop: "1px solid var(--border)", paddingTop: "24px", width: "100%", maxWidth: "260px" }}>
              <span className="score-label" style={{ color: "var(--ghost)", fontSize: "9px", marginBottom: "8px", display: "block" }}>
                Transmission Status
              </span>
              <div style={{ fontSize: "13px", fontWeight: "400", color: "var(--platinum)", textTransform: "uppercase", letterSpacing: "2px" }}>
                {statusLabel}
              </div>
            </div>

          </div>
        </motion.div>

      </motion.div>
    </section>
  );
};

export default ViralitySection;