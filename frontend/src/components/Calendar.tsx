import { useEffect, useRef, useState } from "react";
import type { FormEvent, PointerEventHandler } from "react";
import { useIceExtentContext } from "../context/IceExtentContext";

export const Calendar = () => {
    const { selectedDate, isoDate, shiftDate, setDateFromIso, isLoading, error } = useIceExtentContext();

    const [isOpen, setIsOpen] = useState(false);
    const [monthInput, setMonthInput] = useState("");
    const [yearInput, setYearInput] = useState("");

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
        if (isLoading) return;
        suppressClickRef.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        shiftDate(direction);
        clearRepeat();
        repeatIntervalRef.current = setInterval(() => shiftDate(direction), 150);
    };

    const handlePointerEnd: PointerEventHandler<HTMLButtonElement> = (event) => {
        stopContinuousUpdate(event);
        if (event.type !== "pointerup") {
            suppressClickRef.current = false;
        }
    };

    const createClickHandler = (direction: number) => () => {
        if (isLoading) return;
        if (suppressClickRef.current) {
            suppressClickRef.current = false;
            return;
        }
        shiftDate(direction);
    };

    // toggle calendar visibility
    const toggleCalendar = () => {
        if (isOpen) {
            setIsOpen(false);
            return;
        }

        const current = selectedDate;
        setMonthInput(String(current.getUTCMonth() + 1).padStart(2, "0"));
        setYearInput(String(current.getUTCFullYear()));
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

        const iso = `${String(yearValue).padStart(4, "0")}-${String(monthValue).padStart(2, "0")}-01`;
        setDateFromIso(iso);
        setIsOpen(false);
    };

    useEffect(() => {
        if (!isOpen) return;
        const [year, month] = isoDate.split("-");
        setYearInput(year);
        setMonthInput(month);
    }, [isoDate, isOpen]);

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
                disabled={isLoading}
            >↑</button>
            <span>{isoDate}</span>
            <button
                onClick={createClickHandler(1)}
                onPointerDown={createPointerDownHandler(1)}
                onPointerUp={handlePointerEnd}
                onPointerLeave={handlePointerEnd}
                onPointerCancel={handlePointerEnd}
                disabled={isLoading}
            >↓</button>
            {error && <span className="calendar-error">{error}</span>}
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
