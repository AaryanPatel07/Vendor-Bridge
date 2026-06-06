import React, { useEffect, useState } from "react";
import "./loader.css";

// Fallback background image if the local asset is missing
const FALLBACK_BG = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2070";

interface LoaderProps {
  onComplete?: () => void;
}

const Loader: React.FC<LoaderProps> = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    // Extended loader: 1.6s animation + 0.4s exit = 2.0s total
    const exitTrigger = setTimeout(() => {
      setIsExiting(true);
    }, 1600);

    const completeTimer = setTimeout(() => {
      setIsMounted(false);
      if (onComplete) onComplete();
    }, 2000);

    return () => {
      clearTimeout(exitTrigger);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (!isMounted) return null;

  return (
    <div className={`loader-overlay ${isExiting ? "exiting" : ""}`}>
      {/* Background image matching hero section */}
      <div
        className="loader-bg-image"
        style={{ backgroundImage: `url(${FALLBACK_BG})` }}
      />
      
      {/* Dark gradient overlay */}
      <div className="loader-gradient" />
      
      {/* Content */}
      <div className="loader-content">
        {/* Logo with scale reveal animation */}
        <div className="loader-logo-wrapper">
          <h1 className="loader-logo">VENDOR BRIDGE</h1>
          <div className="loader-tagline">
            <span className="tagline-dot"></span>
            <span className="tagline-text">PROCUREMENT ERP</span>
            <span className="tagline-dot"></span>
          </div>
        </div>
        
        {/* Minimal loading bar */}
        <div className="loader-progress">
          <div className="loader-progress-bar"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
