import { useRef, useEffect } from "react";
import "./CalendarTimeline.css";

interface CalendarTimelineProps {
  list: string[];
  currentIndex: number;
  isSliding: boolean;
  isLoading: boolean;
  onStart: () => void;
  onEnd: () => void;
  onChange: (index: number) => void;
  bubbleDate: Date | null;
}

const formatDateOnly = (d?: Date | null) => {
  if (!d) return "";
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const CalendarTimeline = ({
  list,
  currentIndex,
  isSliding,
  isLoading,
  onStart,
  onEnd,
  onChange,
  bubbleDate,
}: CalendarTimelineProps) => {
  const max = Math.max(list.length - 1, 0);
  const percent = max > 0 ? (currentIndex / max) * 100 : 0;
  const bubbleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (bubbleRef.current) bubbleRef.current.style.left = `${percent}%`;
  }, [percent]);

  return (
    <div className="timeline">
      <div className="timeline__inner">
        <div className="timeline__years">
          <span>{list[0]?.slice(0, 4) ?? ""}</span>
          <span>{list[list.length - 1]?.slice(0, 4) ?? ""}</span>
        </div>

        <div
          aria-hidden
          ref={bubbleRef}
          className={`timeline__bubble ${isSliding ? "is-sliding" : ""}`}
        >
          {(isSliding || isLoading) && (
            <div className="timeline__bubble-inner">
              <span className="timeline__spinner" />
              <span className="timeline__bubble-text">{formatDateOnly(bubbleDate)}</span>
            </div>
          )}
        </div>

        <input
          type="range"
          className="timeline__slider"
          min={0}
          max={max}
          step={1}
          value={Math.min(Math.max(currentIndex, 0), max)}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseDown={onStart}
          onTouchStart={onStart}
          onMouseUp={onEnd}
          onTouchEnd={onEnd}
          onKeyDown={onStart}
          onKeyUp={onEnd}
          onBlur={onEnd}
          disabled={list.length === 0}
        />
      </div>
    </div>
  );
};

export default CalendarTimeline;
