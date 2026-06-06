import { motion, AnimatePresence, useAnimation, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const HeroSection = ({ topic, setTopic, handleAnalyze, loading, analysisReady }) => {
  const [phase, setPhase] = useState("idle");
  const controls = useAnimation();
  const containerRef = useRef(null);

  // The Magic: Parallax scrolling physics
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const inputY = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

  useEffect(() => {
    if (!analysisReady) return;
    setPhase("dissolving");
    controls.start({
      scale: 0.95, y: -40, filter: "blur(12px)", opacity: 0,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
    }).then(() => setTimeout(() => setPhase("gone"), 100));
  }, [analysisReady, controls]);

  const onBeginStory = async () => {
    if (!topic.trim() || phase === "analyzing") return;
    setPhase("analyzing");
    await handleAnalyze();
  };

  if (phase === "gone") return null;

  return (
    <motion.section
      ref={containerRef}
      className="hero"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.4 }}
      style={{ position: "relative", minHeight: "100vh", overflow: "hidden", display: "flex", alignItems: "center" }}
    >
      {/* MASSIVE BACKGROUND TYPOGRAPHY (Parallax) */}
      <motion.div 
        style={{ y: textY, opacity: textOpacity, position: "absolute", top: "15%", left: "-2%", width: "120%", zIndex: 0, pointerEvents: "none" }}
        animate={controls}
      >
        <h1 style={{ 
          fontSize: "clamp(8rem, 15vw, 16rem)", 
          fontWeight: 300, 
          letterSpacing: "-0.06em", 
          lineHeight: 0.8,
          color: "rgba(255, 255, 255, 0.03)", 
          whiteSpace: "nowrap",
          textTransform: "uppercase"
        }}>
          Global
          <br />
          <span style={{ color: "rgba(255, 255, 255, 0.08)", fontStyle: "italic", paddingLeft: "10%" }}>Intelligence</span>
        </h1>
      </motion.div>

      {/* FOREGROUND INTERACTIVE LAYER */}
      <motion.div 
        className="hero-content" 
        style={{ y: inputY, position: "relative", zIndex: 10, padding: "0 10%", width: "100%", maxWidth: "1200px" }}
        animate={controls}
      >
        <motion.div 
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.9 }}
          style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "3px", textTransform: "uppercase", color: "var(--accent)", marginBottom: "24px" }}
        >
          Dynamic Narrative Analysis
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: "clamp(3rem, 6vw, 5rem)", fontWeight: 400, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "40px" }}
        >
          Decoding <br/>
          <motion.span
            key={topic || "default"}
            initial={{ opacity: 0, filter: "blur(6px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.4 }}
            style={{ fontStyle: "italic", color: "var(--accent)" }}
          >
            {topic || "Digital Humanity"}
          </motion.span>
        </motion.h2>

        <motion.div className="input-area"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: "600px", borderBottom: "1px solid var(--border)", display: "flex" }}
        >
          <input
            type="text"
            placeholder="Enter a topic..."
            value={topic}
            onChange={(e) => { setTopic(e.target.value); if (phase === "idle") setPhase("typing"); }}
            onKeyDown={(e) => e.key === "Enter" && onBeginStory()}
            disabled={phase === "analyzing" || phase === "dissolving"}
            style={{ background: "transparent", border: "none", color: "#FFF", fontSize: "18px", padding: "16px 0", flex: 1, outline: "none", fontWeight: 300 }}
          />
          <motion.button
            onClick={onBeginStory}
            disabled={loading || phase === "analyzing" || phase === "dissolving"}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ background: "transparent", color: "var(--accent)", border: "none", paddingLeft: "24px", fontSize: "11px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}
          >
            {phase === "analyzing" ? "Extracting..." : "Analyze"}
          </motion.button>
        </motion.div>

        <AnimatePresence mode="wait">
          {phase === "analyzing" && (
            <motion.div key="status" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              style={{ marginTop: "24px", fontSize: "12px", color: "var(--muted)", display: "flex", alignItems: "center", gap: "12px" }}
            >
              <span style={{ width: "6px", height: "6px", background: "var(--accent)", borderRadius: "50%" }} />
              Scanning behavioral anchors for {topic}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.section>
  );
};

export default HeroSection;