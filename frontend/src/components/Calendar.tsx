import {useEffect, useRef, useState} from "react";
import type {PointerEventHandler} from "react";

export const Calendar = () => {

    // calendar date
    const [date, setDate] = useState((new Date()));

    // calendar is open?
    const [isOpen, setIsOpen] = useState(false);

    const adjustDate = (offset: number) => {
        setDate((prevDate) => {
            const updated = new Date(prevDate);
            updated.setDate(prevDate.getDate() + offset);
            return updated;
        });
    };

    const repeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const suppressClickRef = useRef(false);

    const clearRepeat = () => {
        if (repeatIntervalRef.current) {
            clearInterval(repeatIntervalRef.current);
            repeatIntervalRef.current = null;
        }
    };

    type ButtonPointerEvent = Parameters<PointerEventHandler<HTMLButtonElement>>[0];

    const stopContinuousUpdate = (event?: ButtonPointerEvent) => {
        if (event) {
            const {currentTarget, pointerId} = event;
            if (currentTarget.hasPointerCapture(pointerId)) {
                currentTarget.releasePointerCapture(pointerId);
            }
        }
        clearRepeat();
    };

    useEffect(() => () => clearRepeat(), []);

    const createPointerDownHandler = (direction: number): PointerEventHandler<HTMLButtonElement> => (event) => {
        suppressClickRef.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        adjustDate(direction);
        clearRepeat();
        repeatIntervalRef.current = setInterval(() => adjustDate(direction), 150);
    };

    const handlePointerEnd: PointerEventHandler<HTMLButtonElement> = (event) => {
        stopContinuousUpdate(event);
        if (event.type !== "pointerup") {
            suppressClickRef.current = false;
        }
    };

    const createClickHandler = (direction: number) => () => {
        if (suppressClickRef.current) {
            suppressClickRef.current = false;
            return;
        }
        adjustDate(direction);
    };

    // toggle calendar visibility
    const toggleCalendar = () => setIsOpen(!isOpen);

    // format date (YYYY - MM - DD)
    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    let label;
    if(isOpen){
        label = "Close Calendar";
    }
    else{
        label = "Select Date";
    }

    return(
        <div className="tool-card tool-card--calendar">
            <button onClick={toggleCalendar}>{label}</button>
            <button
                onClick={createClickHandler(-1)}
                onPointerDown={createPointerDownHandler(-1)}
                onPointerUp={handlePointerEnd}
                onPointerLeave={handlePointerEnd}
                onPointerCancel={handlePointerEnd}
            >↑</button>
            <span>{formatDate(date)}</span>
            <button
                onClick={createClickHandler(1)}
                onPointerDown={createPointerDownHandler(1)}
                onPointerUp={handlePointerEnd}
                onPointerLeave={handlePointerEnd}
                onPointerCancel={handlePointerEnd}
            >↓</button>
        </div>

    )
}
