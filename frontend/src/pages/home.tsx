import { Calendar } from '../components/Calendar';
import { ParameterTools } from '../components/ParameterTools';
import MapView from '../components/MapView';
import RightStatsPanel from '../components/RightStatsPanel';   

const HomePage = () => {
  return (
    <div className="app-shell">
    
    <div className="map-frame">
      <div className="tool-bar">
        <Calendar />

        <ParameterTools message = "Start Point"/>

        <ParameterTools message = "Destination"/>
      </div>
      <MapView />
    </div>
    <RightStatsPanel />
  </div>
  );
}

export default HomePage;