import { useMemo } from "react";
import { useIceExtentContext } from "../context/IceExtentContext";

export const Calendar = () => {
  const { isoDate, setDateFromIso, availableDates } = useIceExtentContext();

  const list = availableDates ?? [];
  const sliderIndex = useMemo(() => Math.max(0, list.indexOf(isoDate)), [list, isoDate]);
  const max = Math.max(list.length - 1, 0);

  return (
    <div className="calendar-vertical">
      <div className="calendar-vertical__year calendar-vertical__year--top">
        {list[0]?.slice(0, 4) ?? ""}
      </div>
      <input
        className="calendar-vertical__slider"
        aria-label="slideBar"
        type="range"
        min={0}
        max={max}
        step={1}
        value={sliderIndex}
        onChange={(e) => {
          const idx = Number(e.target.value);
          const nextIso = list[idx];
          if (nextIso) setDateFromIso(nextIso);
        }}
      />
      <div className="calendar-vertical__date">{isoDate}</div>
      <div className="calendar-vertical__year calendar-vertical__year--bottom">
        {list[list.length - 1]?.slice(0, 4) ?? ""}
      </div>
    </div>
  );
};
