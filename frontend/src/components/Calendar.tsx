import {useEffect, useRef, useState} from "react";
import type {FormEvent, PointerEventHandler} from "react";

export const Calendar = () => {

    // calendar date
    const [date, setDate] = useState((new Date()));

    // calendar is open?
    const [isOpen, setIsOpen] = useState(false);
    const [monthInput, setMonthInput] = useState("");
    const [yearInput, setYearInput] = useState("");

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
    const toggleCalendar = () => {
        if (isOpen) {
            setIsOpen(false);
            return;
        }

        const current = date;
        setMonthInput(String(current.getMonth() + 1).padStart(2, "0"));
        setYearInput(String(current.getFullYear()));
        setIsOpen(true);
    };

    const handleJumpSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const monthValue = parseInt(monthInput, 10);
        const yearValue = parseInt(yearInput, 10);

        if (!Number.isFinite(monthValue) || monthValue < 1 || monthValue > 12) {
            return;
        }

        if (!Number.isFinite(yearValue) || yearValue < 1) {
            return;
        }

        const next = new Date(date);
        next.setFullYear(yearValue);
        next.setMonth(monthValue - 1, 1);
        next.setHours(0, 0, 0, 0);

        setDate(next);
        setIsOpen(false);
    };

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
            {isOpen && (
                <form className="calendar-quick-jump" onSubmit={handleJumpSubmit}>
                    <label className="calendar-quick-jump__field">
                        <span>Month</span>
                        <input
                            type="number"
                            min="1"
                            max="12"
                            value={monthInput}
                            onChange={(event) => setMonthInput(event.target.value)}
                        />
                    </label>
                    <label className="calendar-quick-jump__field">
                        <span>Year</span>
                        <input
                            type="number"
                            min="1"
                            value={yearInput}
                            onChange={(event) => setYearInput(event.target.value)}
                        />
                    </label>
                    <button className="calendar-quick-jump__submit" type="submit" aria-hidden="true" />
                </form>
            )}
        </div>

    )
}
