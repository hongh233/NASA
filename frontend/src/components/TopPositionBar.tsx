import React, { useEffect, useState } from 'react';
import './TopPositionBar.css';

export interface ViewState {
  lat: number;
  lon: number;
  zoom?: number;
}

interface Props {
  view?: ViewState | null;
  showTimestamp?: boolean;
}

export const TopPositionBar: React.FC<Props> = ({ 
  view, 
  showTimestamp = true 
}) => {
  const [now, setNow] = useState<string>(() => new Date().toISOString().replace('T', ' ').split('.')[0] + ' UTC');

  useEffect(() => {
    if (!showTimestamp) return;
    const id = setInterval(() => {
      setNow(new Date().toISOString().replace('T', ' ').split('.')[0] + ' UTC');
    }, 1000);
    return () => clearInterval(id);
  }, [showTimestamp]);

  const fmt = (n?: number, dp = 4) => (n === undefined ? '—' : n.toFixed(dp));
  return (
    <div className="top-position-bar" role="status" aria-live="polite">
      <div className="top-position-inner">
        <div className="pos-item">
          <span className="label">Center</span>
          <span className="value">{view ? `${fmt(view.lat, 4)}°, ${fmt(view.lon, 4)}°` : '—'}</span>
        </div>
        <div className="pos-item">
          <span className="label">Zoom</span>
          <span className="value">{view && view.zoom !== undefined ? view.zoom.toFixed(2) : '—'}</span>
        </div>
        {showTimestamp && (
          <div className="pos-item timestamp">
            <span className="label">UTC</span>
            <span className="value">{now}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopPositionBar;