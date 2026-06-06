import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ScrollTypewriter } from "../App";

const CONFIG = {
  Positive: { color: "#CCFF00" }, // Dynamic Volt Accent
  Negative: { color: "#FF3B30" }, // Dynamic Precision Red
  Neutral:  { color: "#FFFFFF" }, // Clean White Baseline
};

const SentimentSection = ({ sentiment, summary, nodes = [] }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const xL = useTransform(scrollYProgress, [0, 0.4], [-80, 0]);
  const op = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  const cfg = CONFIG[sentiment] || CONFIG.Neutral;

  const total = Math.max(nodes.length, 1);
  const posCount = nodes.filter(n => n.sentiment === "Positive").length;
  const negCount = nodes.filter(n => n.sentiment === "Negative").length;
  const neuCount = nodes.filter(n => n.sentiment === "Neutral").length || (total - posCount - negCount);

  const posPct = Math.round((posCount / total) * 100);
  const negPct = Math.round((negCount / total) * 100);
  const neuPct = Math.round((neuCount / total) * 100);

  return (
    <section ref={ref} className="sticky-container">
      <motion.div style={{ opacity: op }} className="section-inner">
        
        <motion.div style={{ x: xL }} className="sentiment-narrative" style={{ maxWidth: "500px" }}>
          <div className="chapter-tag">Chapter I — Sentiment</div>
          <h2 className="trend-score" style={{ color: cfg.color }}>{sentiment}</h2>
          <p className="section-subtitle">
            <ScrollTypewriter text={summary} />
          </p>
        </motion.div>

        {/* Dynamic Hairline Metric Trackers */}
        <div style={{ flex: 1, maxWidth: "540px", width: "100%" }}>
          <div className="node-distribution">
            
            <div className="node-dist-row">
              <span className="node-dist-label">Positive Traction</span>
              <div className="node-dist-track">
                <motion.div className="node-dist-fill" style={{ background: "var(--accent, #FFF)" }}
                  initial={{ scaleX: 0 }} whileInView={{ scaleX: posPct / 100 }}
                  viewport={{ once: true }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} />
              </div>
              <span className="node-dist-pct" style={{ color: "var(--accent, #FFF)" }}>{posPct}%</span>
            </div>

            <div className="node-dist-row">
              <span className="node-dist-label">Negative Friction</span>
              <div className="node-dist-track">
                <motion.div className="node-dist-fill" style={{ background: "#FF3B30" }}
                  initial={{ scaleX: 0 }} whileInView={{ scaleX: negPct / 100 }}
                  viewport={{ once: true }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} />
              </div>
              <span className="node-dist-pct" style={{ color: "#FF3B30" }}>{negPct}%</span>
            </div>

            <div className="node-dist-row">
              <span className="node-dist-label">Neutral Baseline</span>
              <div className="node-dist-track">
                <motion.div className="node-dist-fill" style={{ background: "var(--ghost)" }}
                  initial={{ scaleX: 0 }} whileInView={{ scaleX: neuPct / 100 }}
                  viewport={{ once: true }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} />
              </div>
              <span className="node-dist-pct" style={{ color: "var(--muted)" }}>{neuPct}%</span>
            </div>

          </div>
        </div>

      </motion.div>
    </section>
  );
};

export default SentimentSection;