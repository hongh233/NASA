import { useTranslation } from 'react-i18next';

const RightStatsPanel = () => {
  const { t, ready } = useTranslation();
  
  // Show loading state while translations are loading
  if (!ready) {
    return (
      <aside className="stats-panel">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          Loading translations...
        </div>
      </aside>
    );
  }
  
  return (
    <aside className="stats-panel">
      <header className="stats-panel__header">
        <h1 className="stats-panel__title">{t('stats.title')}</h1>
        <p className="stats-panel__subtitle">
          {t('stats.subtitle')}
        </p>
      </header>

      <section className="stats-card">
        <h2 className="stats-card__label">{t('stats.monthlyChange')}</h2>
        <p className="stats-card__value">{t('stats.monthlyChangeValue')}</p>
        <p className="stats-card__meta">{t('stats.monthlyChangeMeta')}</p>
      </section>

      <section className="stats-card">
        <h2 className="stats-card__label">{t('stats.iceThickness')}</h2>
        <p className="stats-card__value">{t('stats.iceThicknessValue')}</p>
        <p className="stats-card__meta">{t('stats.iceThicknessMeta')}</p>
      </section>

      <section className="stats-card">
        <h2 className="stats-card__label">{t('stats.anomaly')}</h2>
        <p className="stats-card__value">{t('stats.anomalyValue')}</p>
        <p className="stats-card__meta">{t('stats.anomalyMeta')}</p>
      </section>
    </aside>
  );
};

export default RightStatsPanel;
