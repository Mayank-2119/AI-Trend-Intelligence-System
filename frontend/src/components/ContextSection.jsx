import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ScrollTypewriter } from "../App";

const ContextSection = ({ topic, contextData }) => {
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

  const data = contextData || { summary: "Extracting structural drivers...", key_events: [] };

  return (
    <section ref={ref} className="sticky-container">
      <motion.div style={{ opacity: op }} className="section-inner">

        <motion.div style={{ x: xL }} className="sentiment-narrative">
          <div className="chapter-tag">Chapter II — Context</div>
          <h2 className="trend-score">Drivers</h2>
          <p className="section-subtitle">
            <ScrollTypewriter text={data.summary} />
          </p>
        </motion.div>

        <motion.div style={{ x: xR }} className="radar-viz">
          <div className="event-grid">
            <span className="score-label" style={{ marginBottom: "12px", display: "block" }}>
              Extracted Intelligence Anchors
            </span>
            
            {data.key_events.map((ev, i) => (
              <motion.div 
                key={i} 
                className="event-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
                transition={{ duration: 0.8, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                <h4 className="event-headline">{ev.headline}</h4>
                <p className="event-detail">{ev.detail}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
};

export default ContextSection;