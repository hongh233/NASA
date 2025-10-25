import type { CSSProperties } from 'react';

export const PinPoint = (props: any) => {

    function handleClick(){
        if(props.message == "Start Point"){
            console.log("should open a start point");
        }
        else{
            console.log("should open a destination");
        }
    }
    const boxStyle: CSSProperties = {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        width: "150px",
    };
    return(
        <div style={boxStyle}>
            <h3>{props.message}</h3>

            <button onClick={handleClick}>Drop a pin point</button>
        </div>
    )
}