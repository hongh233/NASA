import "./App.css";
import MapView from "./components/MapView";
import RightStatsPanel from "./components/RightStatsPanel";
import LanguageSwitcher from "./components/LanguageSwitcher";
import SMSNotifications from "./components/SMSNotifications";

const App = () => (
  <div className="app-shell">
    <LanguageSwitcher />
    <SMSNotifications />
    <div className="map-frame">
      <MapView />
    </div>
    <RightStatsPanel />
  </div>
);

export default App;
