import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { useIceExtentContext } from "../context/IceExtentContext";
import "./Calendar.css";

export const Calendar = () => {
  const { isoDate, setDateFromIso, availableDates, selectedDate, isLoading } = useIceExtentContext();

  const list = availableDates ?? [];
  const max = Math.max(list.length - 1, 0);
  const sliderIndex = useMemo(() => Math.max(0, list.indexOf(isoDate)), [list, isoDate]);

  const [isSliding, setIsSliding] = useState(false);

  const handleStart = useCallback(() => setIsSliding(true), []);
  const handleEnd = useCallback(() => setIsSliding(false), []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = Number(e.target.value);
    const nextIso = list[idx];
    if (nextIso) setDateFromIso(nextIso);
  };

  const formatDateOnly = (d?: Date | null) => {
    if (!d) return "";
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Calculate bubble position as percent across the track
  const percent = max > 0 ? (sliderIndex / max) * 100 : 0;
  const bubbleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (bubbleRef.current) {
      bubbleRef.current.style.left = `${percent}%`;
    }
  }, [percent]);

  return (
    <div className="calendar-horizontal">
      <div className="calendar-horizontal__inner">
        {/* year labels */}
        <div className="calendar-horizontal__years">
          <div className="calendar-horizontal__year--start">{list[0]?.slice(0, 4) ?? ""}</div>
          <div className="calendar-horizontal__year--end">{list[list.length - 1]?.slice(0, 4) ?? ""}</div>
        </div>

        {/* floating bubble above thumb - left percentage is dynamic */}
        <div
          aria-hidden
          ref={bubbleRef}
          className={`calendar-horizontal__bubble ${isSliding ? "is-sliding" : ""}`}
        >
          {isSliding || isLoading ? (
            <div className="calendar-horizontal__bubble-inner">
              <span className="calendar-horizontal__spinner" aria-hidden />
              <span className="calendar-horizontal__bubble-text">{formatDateOnly(selectedDate)}</span>
            </div>
          ) : null}
        </div>

        {/* slider */}
        <input
          className="calendar-horizontal__slider"
          aria-label="date-slider"
          type="range"
          min={0}
          max={max}
          step={1}
          value={sliderIndex}
          onChange={handleChange}
          onMouseDown={handleStart}
          onTouchStart={handleStart}
          onMouseUp={handleEnd}
          onTouchEnd={handleEnd}
          disabled={list.length === 0}
        />
      </div>
    </div>
  );
};
