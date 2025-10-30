import { useEffect, useState } from "react";
import type { RouteControls } from "../routePredictions/AnimatedRouteOverlay";
import { predictIceExtent } from "../../services/icePredictionAPI";
import type { FeatureCollection } from "geojson";
import "./ToolBar.css";

interface ToolBarProps {
  routeControls: RouteControls;
  routeStatus: string;
  onRouteStatusChange: (status: string) => void;
  setPredictedData: (data: FeatureCollection | null) => void;
}

export const ToolBar = ({
  routeControls,
  routeStatus,
  setPredictedData,
}: ToolBarProps) => {
  const [predicting, setPredicting] = useState(false);
  const [predictError, setPredictError] = useState<string | null>(null);
  const [predictDate, setPredictDate] = useState<string>("2026-01-01");
  const [predictRadius, setPredictRadius] = useState<number>(500);
  const [predictThresh, setPredictThresh] = useState<number>(0.5);
  const [expanded, setExpanded] = useState(false);

  const routeStatusLabel =
    routeStatus === "requesting"
      ? "Calculating route..."
      : routeControls.hasMarkers
      ? "Pins ready. Start animation on map."
      : "Tap the map twice to set route pins.";

  const handlePredict = async () => {
    setPredicting(true);
    setPredictError(null);
    try {
      const result = await predictIceExtent(
        predictDate,
        predictRadius,
        predictThresh
      );
      setPredictedData(result.feature_collection);
    } catch (err: any) {
      setPredictError(err?.message ?? String(err));
      setPredictedData(null);
    } finally {
      setPredicting(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setExpanded(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="tool-bar">
      <button
        className="tool-toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-label="Toggle Toolbox"
      >
        <span className="toolbox-label">Toolbox</span>
        <span className="toolbox-icon">{expanded ? "✕" : "☰"}</span>
      </button>

      <div
        id="mission-tools-panel"
        className={`toolbox-modal ${expanded ? "visible" : ""}`}
      >
        <div className="tool-card tool-card--stacked tool-card--route">
          <h3>Route Tools</h3>
          <button
            type="button"
            onClick={routeControls.clearMarkers}
            disabled={!routeControls.hasMarkers || routeStatus === "requesting"}
          >
            Clear pins
          </button>
          <span className="animated-route-status">{routeStatusLabel}</span>
        </div>

        <div className="tool-card tool-card--stacked tool-card--predict">
          <h3>Predict Ice</h3>

          <label>
            Date
            <input
              type="date"
              value={predictDate}
              onChange={(e) => setPredictDate(e.target.value)}
            />
          </label>

          <label>
            Radius (km)
            <input
              type="number"
              value={predictRadius}
              onChange={(e) => setPredictRadius(Number(e.target.value))}
            />
          </label>

          <label>
            Threshold
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={predictThresh}
              onChange={(e) => setPredictThresh(Number(e.target.value))}
            />
          </label>

          <div className="predict-controls">
            <button
              type="button"
              onClick={handlePredict}
              disabled={predicting}
            >
              {predicting ? "Predicting…" : "Predict"}
            </button>
            <button
              type="button"
              onClick={() => setPredictedData(null)}
              disabled={predicting}
            >
              Clear
            </button>
          </div>

          {predictError && <div className="error">{predictError}</div>}
        </div>
      </div>
    </div>
  );
};
