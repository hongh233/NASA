import { useMemo, useState, useCallback } from "react";
import { useIceExtentContext } from "../../context/IceExtentContext";
import "./Calendar.css";


type CalendarNudgeButtonProps = {
  label: string;        
  title: string;        
  onClick: () => void;  
  disabled?: boolean;
};

const CalendarNudgeButton: React.FC<CalendarNudgeButtonProps> = ({
  label,
  title,
  onClick,
  disabled,
}) => (
  <button
    type="button"
    className="calendar-btn"
    title={title}
    aria-label={title}
    onClick={onClick}
    disabled={disabled}
  >
    {label}
  </button>
);


export const Calendar = () => {
  const { 
    isoDate, 
    setDateFromIso, 
    availableDates, 
    selectedDate, 
    isLoading } = useIceExtentContext();


  const list = useMemo(
    () => [...(availableDates ?? [])].sort((a, b) => a.localeCompare(b)),
    [availableDates]
  );

  const max = Math.max(list.length - 1, 0);
  const sliderIndex = Math.max(0, list.indexOf(isoDate));

  const [isSliding, setIsSliding] = useState(false);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);

  const handleStart = useCallback(() => setIsSliding(true), []);
  const handleEnd = useCallback(() => {
    setIsSliding(false);

    if (pendingIndex != null) {
      const iso = list[Math.min(Math.max(pendingIndex, 0), max)];
      if (iso && iso !== isoDate) setDateFromIso(iso);
    }
  }, [pendingIndex, list, max, isoDate, setDateFromIso]);

  const handleChange = useCallback((index: number) => {
    setPendingIndex(index);
  }, []);

  const activeIndex = pendingIndex ?? sliderIndex;
  const bubbleDate =
    pendingIndex !== null ? new Date(`${list[pendingIndex]}T00:00:00Z`) : selectedDate;

  const nearestIndexToISO = useCallback(
    (targetISO: string, preferDir: number) => {
      let i = list.findIndex((d) => d >= targetISO);
      if (i === -1) return max;
      if (preferDir < 0 && i > 0 && list[i] > targetISO) i = i - 1;
      return Math.max(0, Math.min(i, max));
    },
    [list, max]
  );

  const nudge = useCallback(
    (unit: "day" | "month" | "year", dir: number) => {
      if (!list.length) return;
      const baseISO = isoDate ?? list[activeIndex];
      const dt = new Date(`${baseISO}T00:00:00Z`);
      if (unit === "day") dt.setUTCDate(dt.getUTCDate() + dir);
      else if (unit === "month") dt.setUTCMonth(dt.getUTCMonth() + dir);
      else dt.setUTCFullYear(dt.getUTCFullYear() + dir);

      const target = dt.toISOString().slice(0, 10);
      const idx = nearestIndexToISO(target, dir);
      const iso = list[idx];
      if (iso) {
        setDateFromIso(iso);
        setPendingIndex(idx);
      }
    },
    [isoDate, list, activeIndex, nearestIndexToISO, setDateFromIso]
  );

  const formattedCurrent = bubbleDate
    ? bubbleDate.toISOString().slice(0, 10)
    : isoDate ?? "";

  return (
    <div className="calendar-timeline-container">
      <div className="calendar-timeline-grid">
        <div className="calendar-timeline-header">
          <button
            className="calendar-edge-btn"
            onClick={() => list.length > 0 && setDateFromIso(list[0])}
            disabled={isLoading}
            title="Go to earliest date"
          >
            {list[0]?.slice(0, 4) ?? ""}
          </button>

          <div className="calendar-current-date">{formattedCurrent}</div>

          <button
            className="calendar-edge-btn"
            onClick={() => list.length > 0 && setDateFromIso(list[list.length - 1])}
            disabled={isLoading}
            title="Go to latest date"
          >
            {list[list.length - 1]?.slice(0, 4) ?? ""}
          </button>
        </div>


        <div className="calendar-timeline-main">
          <div className="calendar-timeline-side">
            <CalendarNudgeButton 
              label="-Y" 
              title="Previous year" 
              onClick={() => nudge("year", -1)} 
              disabled={isLoading}
            />
            <CalendarNudgeButton 
              label="-M" 
              title="Previous month" 
              onClick={() => nudge("month", -1)} 
              disabled={isLoading}
            />
            <CalendarNudgeButton 
              label="-D" 
              title="Previous day"
              onClick={() => nudge("day", -1)} 
              disabled={isLoading}
            />
          </div>

          <div className="calendar-timeline-center">
            <div className="timeline">
              <input
                type="range"
                className={`timeline__slider ${isSliding ? "is-sliding" : ""}`}
                min={0}
                max={max}
                step={1}
                value={Math.min(Math.max(activeIndex, 0), max)}
                onChange={(e) => handleChange(Number(e.target.value))}
                onMouseDown={handleStart}
                onTouchStart={handleStart}
                onMouseUp={handleEnd}
                onTouchEnd={handleEnd}
                onKeyUp={handleEnd}
                onBlur={handleEnd}
                disabled={list.length === 0 || isLoading}
              />
            </div>
          </div>

          <div className="calendar-timeline-side">
            <CalendarNudgeButton 
              label="+D" 
              title="Next day" 
              onClick={() => nudge("day", 1)} 
              disabled={isLoading}
            />
            <CalendarNudgeButton 
              label="+M" 
              title="Next month" 
              onClick={() => nudge("month", 1)} 
              disabled={isLoading}
            />
            <CalendarNudgeButton 
              label="+Y" 
              title="Next year" 
              onClick={() => nudge("year", 1)} 
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
