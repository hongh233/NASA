import "./App.css";
import MapView from "./components/MapView";
import RightStatsPanel from "./components/RightStatsPanel";

const App = () => (
  <div className="app-shell">
    <div className="map-frame">
      <MapView />
    </div>
    <RightStatsPanel />
  </div>
);

export default App;
