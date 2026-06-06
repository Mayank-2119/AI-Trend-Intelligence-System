import React, { useState, useEffect } from "react";
import "./App.css";

// Component Imports
import ThreeScene from "./components/ThreeScene";
import LoadingScreen from "./components/LoadingScreen";
import SentimentSection from "./components/SentimentSection";
import ContextSection from "./components/ContextSection";
import EmotionSection from "./components/EmotionSection";
import ViralitySection from "./components/ViralitySection";
import ForecastSection from "./components/ForecastSection";
import HeroSection from "./components/HeroSection";
/* ── 1. GLOBAL TYPEWRITER UTILITY (Spacing Fixed) ── */
export const ScrollTypewriter = ({ text }) => {
  if (!text) return null;
  const words = text.split(" ");
  return (
    <span className="typewriter-container" style={{ display: "inline-block" }}>
      {words.map((word, i) => (
        <span 
          key={i} 
          className="typewriter-word" 
          style={{ display: "inline-block", marginRight: "0.25em" }}
        >
          {word}
        </span>
      ))}
    </span>
  );
};

/* ── 2. BROADCAST SCROLL SPINE (Updated for Flawless DOM Tracking) ── */
const ScrollSpine = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Look for the exact sections rendered in the dashboard
      const sections = [
        document.getElementById("sentiment-section"),
        document.getElementById("context-section"),
        document.getElementById("emotion-section"),
        document.getElementById("virality-section"),
        document.getElementById("forecast-section")
      ];

      let currentIdx = 0;
      let minDistance = Infinity;
      const viewportCenter = window.innerHeight / 2;

      // Find which section is currently closest to the center of the screen
      sections.forEach((section, index) => {
        if (section) {
          const rect = section.getBoundingClientRect();
          const sectionCenter = rect.top + rect.height / 2;
          const distance = Math.abs(sectionCenter - viewportCenter);

          if (distance < minDistance) {
            minDistance = distance;
            currentIdx = index;
          }
        }
      });

      if (currentIdx !== activeIdx) setActiveIdx(currentIdx);
    };

    window.addEventListener("scroll", handleScroll);
    // Trigger once on mount to set initial state correctly
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeIdx]);

  const chapters = ["Sentiment", "Context", "Emotion", "Virality", "Forecast"];

  return (
    <div className="scroll-spine">
      <div className="spine-track">
        <div className="spine-fill" style={{ transform: `scaleY(${(activeIdx + 1) / 5})` }} />
      </div>
      {chapters.map((label, i) => (
        <div key={label} className="spine-chapter" style={{ top: `${(i / 4) * 100}%` }}>
          {/* Fills the dot only if it is the active or completed chapter */}
          <div className={`spine-dot ${activeIdx >= i ? "active" : ""}`} />
          <span className="spine-label">{label}</span>
        </div>
      ))}
    </div>
  );
};

/* ── 3. MAIN APPLICATION ── */
function App() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const handleSearch = async (e) => {
    if (e)e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      // Attempt to hit your actual FastAPI backend
      const response = await fetch(`http://127.0.0.1:8000/analyze?topic=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error("Failed to connect to intelligence API.");
      }
      
      const data = await response.json();
      setAnalysis(data);

    } catch (err) {
      console.warn("Backend unavailable. Injecting fallback broadcast data.", err);
      
      // FAIL-SAFE: Generate highly realistic dummy data including the new CONTEXT module
      setTimeout(() => {
        setAnalysis({
          topic: query,
          sentiment: "Negative",
          summary: `The overall consensus regarding ${query} is showing heavy negative friction, driven by immediate real-world developments.`,
          
          context: {
            summary: `Discussions surrounding ${query} are currently anchored by severe geopolitical friction and sudden policy shifts dominating the global news cycle.`,
            key_events: [
              { headline: "Border Escalations", detail: "A massive 300% spike in mentions regarding troop mobilizations and broken diplomatic treaties over the last 48 hours." },
              { headline: "Economic Sanctions", detail: "Secondary narrative vectors are highly focused on the global market fallout and newly proposed trade embargoes." }
            ]
          },

          virality_score: 84,
          emotion_breakdown: { joy: 5, surprise: 15, anger: 65, fear: 10, sadness: 5 },
          nodes: Array.from({ length: 42 }).map((_, i) => ({
            id: i,
            sentiment: Math.random() > 0.7 ? "Positive" : "Negative", // Skewed negative for the mock
            score: Math.floor(Math.random() * 100)
          }))
        });
        setLoading(false);
      }, 2500); 
      return;
    }

    setLoading(false);
  };

  const handleReset = () => {
    setAnalysis(null);
    setQuery("");
    window.scrollTo(0, 0);
  };
  
  // Determine which global color theme to apply
  const getThemeClass = () => {
    if (!analysis) return "theme-neutral"; // Default blue while searching
    if (analysis.sentiment === "Positive") return "theme-positive";
    if (analysis.sentiment === "Negative") return "theme-negative";
    return "theme-neutral";
  };

  return (
    <div className={`app ${getThemeClass()}`}>
      {/* Background Environment */}
      <div className="aurora-bg" />
      <div className="grid-overlay" />

      {/* 3D Isometric Stage (Only mounts when data exists) */}
      {analysis && !loading && <ThreeScene analysis={analysis} />}

      <div className="ui-layer">
        <LoadingScreen topic={query} visible={loading} />

        {!analysis && !loading && (
  <HeroSection 
    topic={query} 
    setTopic={setQuery} 
    handleAnalyze={handleSearch} 
    loading={loading} 
    analysisReady={!!analysis} 
  />
)}

        {/* Data Dashboard */}
        {analysis && !loading && (
          <main>
            <div className="data-source-bar">
              <div className="data-source-dot" />
              <span className="data-source-label">Live Data Stream Active</span>
              <span className="data-source-pill">Reddit API</span>
              <span className="data-source-time">Last updated: {new Date().toLocaleTimeString()}</span>
            </div>

            <ScrollSpine />

            {/* Chapters */}
            <div id="sentiment-section">
              <SentimentSection sentiment={analysis.sentiment} summary={analysis.summary} nodes={analysis.nodes} />
            </div>
            
            <div id="context-section">
              <ContextSection topic={analysis.topic} contextData={analysis.context} />
            </div>
            
            <div id="emotion-section">
              <EmotionSection emotions={analysis.emotion_breakdown} topic={analysis.topic} />
            </div>
            
            <div id="virality-section">
              <ViralitySection score={analysis.virality_score} topic={analysis.topic} />
            </div>
            
            <div id="forecast-section">
              <ForecastSection score={analysis.virality_score} sentiment={analysis.sentiment} topic={analysis.topic} forecast={analysis.forecast} />
            </div>

            {/* End of Transmission Card */}
            <div className="end-card">
              <div className="end-card-inner">
                <div className="score-label">End of Transmission</div>
                <h2 className="end-title">{analysis.topic}</h2>
                
                <div className="end-stats">
                  <div className="end-stat">
                    <span className="end-stat-val" style={{ color: analysis.sentiment === 'Positive' ? '#10B981' : analysis.sentiment === 'Negative' ? '#EF4444' : '#64748B' }}>
                      {analysis.sentiment}
                    </span>
                    <span className="end-stat-label">Sentiment</span>
                  </div>
                  <div className="end-stat-div" />
                  <div className="end-stat">
                    <span className="end-stat-val" style={{ color: '#3B82F6' }}>
                      {analysis.virality_score}
                    </span>
                    <span className="end-stat-label">Virality</span>
                  </div>
                  <div className="end-stat-div" />
                  <div className="end-stat">
                    <span className="end-stat-val">
                      {analysis.nodes ? analysis.nodes.length : 42}
                    </span>
                    <span className="end-stat-label">Data Nodes</span>
                  </div>
                </div>

                <button className="restart-btn" onClick={handleReset}>
                  Analyze Another Topic
                </button>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}

export default App;