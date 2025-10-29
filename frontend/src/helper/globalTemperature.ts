const MONTH_OFFSETS = [
  -0.06, -0.04, -0.02, 0.0, 0.03, 0.05,
  0.06, 0.05, 0.03, 0.0, -0.03, -0.05,
];

const BASE_YEAR = 1979;
const BASELINE = -0.32;
const TREND_PER_YEAR = 0.019; // ~0.19 °C per decade

/**
 * Approximate a global temperature anomaly (°C) relative to the 1850–1900 baseline
 * using a simple trend model with seasonal variability.
 *
 * This is a lightweight heuristic intended to provide contextual figures without
 * bundling a large historical dataset.
 */
export const getGlobalTemperatureAnomaly = (isoDate?: string | null): number | null => {
  if (!isoDate) return null;
  const dt = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(dt.getTime())) return null;

  const year = dt.getUTCFullYear();
  const monthIndex = dt.getUTCMonth();
  const yearDelta = year - BASE_YEAR;

  const trendComponent = yearDelta * TREND_PER_YEAR;
  const seasonalComponent = MONTH_OFFSETS[monthIndex] ?? 0;

  // Slight acceleration after 2015 to mimic observed records
  const accelerationYears = Math.max(0, year - 2015);
  const accelerationComponent = accelerationYears * 0.0035;

  const anomaly = BASELINE + trendComponent + seasonalComponent + accelerationComponent;
  return Number(anomaly.toFixed(2));
};

