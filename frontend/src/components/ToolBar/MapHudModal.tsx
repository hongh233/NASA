import React, { useState, useEffect } from "react";
import "./MapHudModal.css";

export const MapHudModal = () => {
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 1024);
  const [isWide, setIsWide] = useState(window.innerWidth >= 768);

  // fake trend data
  const [trendValue, setTrendValue] = useState(-12.4);
  useEffect(() => {
    const interval = setInterval(() => {
      setTrendValue(-10 - Math.random() * 6);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const wide = window.innerWidth >= 768;
      setIsWide(wide);
      if (!wide) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [layers, setLayers] = useState({
    iceExtent: true,
    cityPoints: true,
    prediction: false,
  });

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleModal = () => setIsOpen(prev => !prev);

  return (
    <div className="hud-container">
      <button
        className={`hud-toggle ${isOpen ? "active" : ""}`}
        onClick={toggleModal}
        aria-label="Toggle HUD"
      >
        {isOpen ? "✕ HUD" : "🧭 HUD"}
      </button>

      {isOpen && (
        <div className="hud-modal">
          <div className="hud-section">
            <h4>🧊 Legend</h4>
            <ul>
              <li><span className="legend-dot ice"></span> Sea Ice</li>
              <li><span className="legend-dot land"></span> Land</li>
              <li><span className="legend-dot water"></span> Ocean</li>
            </ul>
          </div>

          <div className="hud-section">
            <h4>🗺 Layers</h4>
            <div className="layer-toggle">
              <label><input type="checkbox" checked={layers.iceExtent} onChange={() => toggleLayer("iceExtent")} /> Ice Extent</label>
              <label><input type="checkbox" checked={layers.cityPoints} onChange={() => toggleLayer("cityPoints")} /> City Points</label>
              <label><input type="checkbox" checked={layers.prediction} onChange={() => toggleLayer("prediction")} /> Prediction Overlay</label>
            </div>
          </div>

          <div className="hud-section">
            <h4>📈 Global Trend</h4>
            <p>Ice extent <strong>{trendValue.toFixed(1)}%</strong> (simulated)</p>
          </div>
        </div>
      )}
    </div>
  );
};
