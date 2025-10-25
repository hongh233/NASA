import "./App.css";
import MapView from "./components/MapView";
import RightStatsPanel from "./components/RightStatsPanel";
import LanguageSwitcher from "./components/LanguageSwitcher";
import SMSNotifications from "./components/SMSNotifications";

const App = () => (
  <div className="app-shell">
    <LanguageSwitcher />
    <div className="left-panel">
      <SMSNotifications />
    </div>
    <div className="map-frame">
      <MapView />
    </div>
    <div className="right-panel">
      <RightStatsPanel />
    </div>
  </div>
);

export default App;
