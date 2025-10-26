import { useCallback, useState } from "react";
import { Calendar } from "../components/Calendar";
import MapView from "../components/MapView";
import RightStatsPanel from "../components/RightStatsPanel";
import { HamburgerButton } from "../components/HamburgerButton";
import type { RouteControls } from "../components/routePredictions/AnimatedRouteOverlay";

const HomePage = () => {
  const [toolsVisible, setToolsVisible] = useState(true);
  const [routeStatus, setRouteStatus] = useState("idle");
  const [routeControls, setRouteControls] = useState<RouteControls>({
    clearMarkers: () => {},
    hasMarkers: false,
  });

  const toggleToolsVisibility = () => {
    setToolsVisible((prev) => !prev);
  };

  const handleRouteControlsChange = useCallback((controls: RouteControls) => {
    setRouteControls((prev) => {
      if (prev.clearMarkers === controls.clearMarkers && prev.hasMarkers === controls.hasMarkers) {
        return prev;
      }
      return controls;
    });
  }, []);

  const cardsClassName = toolsVisible
    ? "tool-bar__cards"
    : "tool-bar__cards tool-bar__cards--hidden";

  const routeStatusLabel =
    routeStatus === "requesting"
      ? "Calculating route..."
      : routeControls.hasMarkers
      ? "Pins ready. Start animation on map."
      : "Tap the map twice to set route pins.";

  return (
    <div className="app-shell">
      <div className="map-frame">
        <div className="tool-bar">
          <HamburgerButton expanded={toolsVisible} onToggle={toggleToolsVisibility} />

          <div id="mission-tools-panel" className={cardsClassName}>
            <Calendar />
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
          </div>
        </div>

        <MapView
          onRouteStatusChange={setRouteStatus}
          onRouteControlsChange={handleRouteControlsChange}
        />
      </div>
      <RightStatsPanel />
    </div>
  );
};

export default HomePage;
