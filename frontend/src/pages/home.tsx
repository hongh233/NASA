import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from '../components/Calendar';
import { ParameterTools } from '../components/ParameterTools';
import MapView from '../components/MapView';
import RightStatsPanel from '../components/RightStatsPanel';   
import { HamburgerButton } from '../components/HamburgerButton';
import LanguageSwitcher from '../components/LanguageSwitcher';
import SMSNotifications from '../components/SMSNotifications';

const HomePage = () => {
  const { t } = useTranslation();
  const [toolsVisible, setToolsVisible] = useState(true);

  const toggleToolsVisibility = () => {
    setToolsVisible((prev) => !prev);
  };

  const cardsClassName = toolsVisible
    ? "tool-bar__cards"
    : "tool-bar__cards tool-bar__cards--hidden";

  return (
    <div className="app-shell">
      <SMSNotifications />
      <div className="map-frame">
        <div className="tool-bar">
          <HamburgerButton
            expanded={toolsVisible}
            onToggle={toggleToolsVisibility}
            controlsId="mission-tools-panel"
          />

          <div id="mission-tools-panel" className={cardsClassName}>
            <LanguageSwitcher />
            <Calendar />
            <ParameterTools message={t('tools.startPoint')} />
            <ParameterTools message={t('tools.destination')} />
          </div>
        </div>
        <MapView />
      </div>
      <RightStatsPanel />
    </div>
  );
}

export default HomePage;