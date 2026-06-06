import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ScrollTypewriter } from "../App";

function generateForecastPoints(baseScore, sentiment) {
  const trend = sentiment === "Positive" ? 1.18 : sentiment === "Negative" ? 0.82 : 1.0;
  let val = Math.max(20, baseScore * 0.6);
  const pts = [];
  for (let i = 0; i < 14; i++) {
    const noise = (Math.random() - 0.5) * 12;
    const growth = i < 7 ? (trend - 1) * 6 + noise : (trend - 1) * 3 + noise * 0.6;
    val = Math.max(5, Math.min(100, val + growth));
    pts.push(Math.round(val));
  }
  return pts;
}

function buildPath(points, W, H, pad = 28) {
  const uw = W - pad * 2, uh = H - pad * 2;
  const xs = points.map((_, i) => pad + (i / (points.length - 1)) * uw);
  const ys = points.map(v => pad + uh - (v / 100) * uh);
  let d = `M ${xs[0]} ${ys[0]}`;
  for (let i = 1; i < points.length; i++) {
    const c1x = xs[i - 1] + (xs[i] - xs[i - 1]) * 0.5, c2x = xs[i] - (xs[i] - xs[i - 1]) * 0.5;
    d += ` C ${c1x} ${ys[i - 1]}, ${c2x} ${ys[i]}, ${xs[i]} ${ys[i]}`;
  }
  return { d, xs, ys };
}

const W = 480, H = 220;
const DAYS = ["W1", "", "W3", "", "W5", "", "W7", "", "W9", "", "W11", "", "W13", ""];

const ForecastSection = ({ score, sentiment, topic, forecast }) => {
  const ref = useRef(null);
  const [drawn, setDrawn] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const xL = useTransform(scrollYProgress, [0, 0.4], [-80, 0]);
  const xR = useTransform(scrollYProgress, [0, 0.4], [80, 0]);
  const op = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  useEffect(() => {
    const unsub = scrollYProgress.on("change", v => { if (v > 0.1) { setDrawn(true); unsub(); } });
    return unsub;
  }, [scrollYProgress]);

  const points = forecast?.length ? forecast : generateForecastPoints(score, sentiment);
  const { d, xs, ys } = buildPath(points, W, H);
  const areaD = d + ` L ${xs[xs.length - 1]} ${H} L ${xs[0]} ${H} Z`;
  const peakIdx = points.indexOf(Math.max(...points));
  const peakX = xs[peakIdx], peakY = ys[peakIdx], peakVal = points[peakIdx];
  const delta = points[points.length - 1] - points[0];
  
  const trending = delta > 8 ? "Upward" : delta < -8 ? "Declining" : "Stable";
  // Hardcoded Lookbook Colors for the SVG
  const trendColor = delta > 8 ? "#9EB800" : delta < -8 ? "#FF3B30" : "#111111";
  const pathLen = 900;

  const momentum = delta > 8 ? "continue accelerating with sustained momentum over the next two weeks" : delta < -8 ? "experience tapering engagement as peak saturation approaches" : "maintain its current trajectory with measured, consistent presence";
  const narrativeText = `Predictive modeling suggests ${topic} will ${momentum}.`;

  return (
    <section ref={ref} className="sticky-container">
      <motion.div style={{ opacity: op }} className="section-inner">

        <motion.div style={{ x: xL }} className="sentiment-narrative">
          <div className="chapter-tag">Chapter V — Forecast</div>
          {/* THE FIX: Stripped gradient, clean color text */}
          <h2 className="trend-score" style={{ color: trendColor }}>
            {trending}
          </h2>
          <p className="section-subtitle">
            <ScrollTypewriter text={narrativeText} />
          </p>
          <div className="forecast-stats" style={{ display: "flex", gap: "24px", marginTop: "40px", borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
            <div className="fstat" style={{ display: "flex", flexDirection: "column" }}>
              <span className="fstat-value" style={{ color: trendColor, fontSize: "24px", fontWeight: "300" }}>{peakVal}</span>
              <span className="fstat-label" style={{ fontSize: "9px", color: "var(--ghost)", textTransform: "uppercase", letterSpacing: "1px" }}>Peak Index</span>
            </div>
            <div className="fstat" style={{ display: "flex", flexDirection: "column" }}>
              <span className="fstat-value" style={{ color: "var(--platinum)", fontSize: "24px", fontWeight: "300" }}>{points[points.length - 1]}</span>
              <span className="fstat-label" style={{ fontSize: "9px", color: "var(--ghost)", textTransform: "uppercase", letterSpacing: "1px" }}>Week 14</span>
            </div>
            <div className="fstat" style={{ display: "flex", flexDirection: "column" }}>
              <span className="fstat-value" style={{ color: trendColor, fontSize: "24px", fontWeight: "300" }}>
                {delta >= 0 ? "+" : ""}{delta}
              </span>
              <span className="fstat-label" style={{ fontSize: "9px", color: "var(--ghost)", textTransform: "uppercase", letterSpacing: "1px" }}>Δ Delta</span>
            </div>
          </div>
        </motion.div>

        <motion.div style={{ x: xR }} className="chart-viz">
          <div className="chart-organic">
            <div className="chart-header">
              <span className="score-label" style={{ color: "var(--ghost)" }}>14-Week Projection</span>
              <span className="forecast-trend-badge" style={{ color: trendColor, borderColor: trendColor }}>
                {trending}
              </span>
            </div>

            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", marginTop: 8 }}>
              <defs>
                <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={trendColor} stopOpacity="0.1" />
                  <stop offset="100%" stopColor={trendColor} stopOpacity="0" />
                </linearGradient>
              </defs>

              {[25, 50, 75].map(pct => {
                const y = 28 + (H - 56) * (1 - pct / 100);
                return <g key={pct}>
                  <line x1="28" y1={y} x2={W - 28} y2={y} stroke="rgba(0,0,0,0.05)" strokeWidth="1" strokeDasharray="4 4" />
                  <text x="22" y={y + 4} fill="rgba(0,0,0,0.3)" fontSize="9" textAnchor="end">{pct}</text>
                </g>;
              })}

              {xs.map((x, i) => DAYS[i] && (
                <text key={i} x={x} y={H - 6} fill="rgba(0,0,0,0.3)" fontSize="9" textAnchor="middle">{DAYS[i]}</text>
              ))}

              <motion.path d={areaD} fill="url(#areaG)"
                initial={{ opacity: 0 }} animate={{ opacity: drawn ? 1 : 0 }}
                transition={{ duration: 1.2, delay: 0.6 }} />

              <motion.path d={d} fill="none" stroke={trendColor} strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" strokeDasharray={pathLen}
                initial={{ strokeDashoffset: pathLen }} animate={{ strokeDashoffset: drawn ? 0 : pathLen }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }} />

              {xs.map((x, i) => (
                <motion.circle key={i} cx={x} cy={ys[i]} r={i === peakIdx ? 3.5 : 2}
                  fill={i === peakIdx ? trendColor : "var(--platinum)"}
                  opacity={i === peakIdx ? 1 : 0.45}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: drawn ? 1 : 0, opacity: drawn ? (i === peakIdx ? 1 : 0.45) : 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + (i / points.length) * 1.4 }}
                  style={{ transformOrigin: `${x}px ${ys[i]}px` }} />
              ))}

              {drawn && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8, duration: 0.5 }}>
                  <line x1={peakX} y1={peakY - 6} x2={peakX} y2={peakY - 26} stroke={trendColor} strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
                  <rect x={peakX - 18} y={peakY - 42} width="36" height="15" rx="3" fill="#F4F4F0" stroke={trendColor} strokeWidth="0.8" />
                  <text x={peakX} y={peakY - 32} fill={trendColor} fontSize="9" textAnchor="middle" fontWeight="600">{peakVal}</text>
                </motion.g>
              )}
            </svg>
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
};

export default ForecastSection;