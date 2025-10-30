import { useMemo, useState, useEffect, useCallback } from "react";
import { useIceExtentContext } from "../../context/IceExtentContext";
import { CalendarTimeline } from "./CalendarTimeline";
import "./Calendar.css";

export const Calendar = () => {
  const { isoDate, setDateFromIso, availableDates, selectedDate, isLoading } = useIceExtentContext();

  const list = useMemo(() => [...(availableDates ?? [])].sort((a, b) => a.localeCompare(b)), [availableDates]);
  const max = Math.max(list.length - 1, 0);
  const sliderIndex = Math.max(0, list.indexOf(isoDate));

  const [isSliding, setIsSliding] = useState(false);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);

  const handleStart = useCallback(() => setIsSliding(true), []);
  const handleEnd = useCallback(() => setIsSliding(false), []);
  const handleChange = useCallback((index: number) => setPendingIndex(index), []);

  useEffect(() => {
    if (pendingIndex === null || !isSliding) return;
    const iso = list[Math.min(Math.max(pendingIndex, 0), max)];
    if (iso && iso !== isoDate) setDateFromIso(iso);
  }, [pendingIndex, isSliding, list, max, isoDate, setDateFromIso]);

  const activeIndex = pendingIndex ?? sliderIndex;
  const bubbleDate = pendingIndex !== null ? new Date(`${list[pendingIndex]}T00:00:00Z`) : selectedDate;

  return (
    <CalendarTimeline
      list={list}
      currentIndex={activeIndex}
      isSliding={isSliding}
      isLoading={isLoading}
      onStart={handleStart}
      onEnd={handleEnd}
      onChange={handleChange}
      bubbleDate={bubbleDate ?? null}
    />
  );
};
