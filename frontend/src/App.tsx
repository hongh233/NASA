import "./App.css";
import MapView from "./components/MapView";
import RightStatsPanel from "./components/RightStatsPanel";
import LanguageSwitcher from "./components/LanguageSwitcher";

const App = () => (
  <div className="app-shell">
    <LanguageSwitcher />
    <div className="map-frame">
      <MapView />
    </div>
    <RightStatsPanel />
  </div>
);

export default App;
