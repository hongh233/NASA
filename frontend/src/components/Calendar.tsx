import {useState} from "react";

export const Calendar = () => {

    // calendar date
    const [date, setDate] = useState((new Date()));

    // calendar is open?
    const [isOpen, setIsOpen] = useState(false);

    const nextDate = () => {
        const newDate = new Date(date);

        newDate.setDate(date.getDate() + 1);

        setDate(newDate);
    }

    const prevDate = () => {
        const newDate = new Date(date);

        newDate.setDate(date.getDate() - 1);
        
        setDate(newDate);
    }

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
        <div>
            <button onClick={toggleCalendar}>{label}</button>
            <button onClick={prevDate}>↑</button>
            <span>{formatDate(date)}</span>
            <button onClick={nextDate}>↓</button>
        </div>
        
    )
}