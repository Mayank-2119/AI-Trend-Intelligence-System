import React from "react";

const LoadingScreen = ({ topic, visible }) => {
  if (!visible) return null;
  
  return (
    <div className="loading-screen">
      <div className="broadcast-loader">
        <div className="broadcast-bar"></div>
        <div className="broadcast-bar"></div>
        <div className="broadcast-bar"></div>
        <div className="broadcast-bar"></div>
        <div className="broadcast-bar"></div>
      </div>
      <h2 className="loading-topic">{topic}</h2>
      <div className="loading-status-text">Compiling Intelligence...</div>
    </div>
  );
};

export default LoadingScreen;