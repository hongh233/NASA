import {useState} from "react";
import "./App.css";
import MapView from "./components/MapView";
import RightStatsPanel from "./components/RightStatsPanel";
import {Calendar} from "./components/Calendar";
import {ParameterTools} from "./components/ParameterTools";
import {HamburgerButton} from "./components/HamburgerButton";

const App = () => {
  const [toolsVisible, setToolsVisible] = useState(true);

  const toggleToolsVisibility = () => {
    setToolsVisible((prev) => !prev);
  };

  const cardsClassName = toolsVisible
    ? "tool-bar__cards"
    : "tool-bar__cards tool-bar__cards--hidden";

  return (
    <div className="app-shell">
      <div className="map-frame">
        <div className="tool-bar">
          <HamburgerButton
            expanded={toolsVisible}
            onToggle={toggleToolsVisibility}
            controlsId="mission-tools-panel"
          />

          <div id="mission-tools-panel" className={cardsClassName}>
            <Calendar />
            <ParameterTools message="Start Point" />
            <ParameterTools message="Destination" />
          </div>
        </div>
        <MapView />
      </div>
      <RightStatsPanel />
    </div>
  );
};

export default App;
