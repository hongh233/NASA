type ParameterToolsProps = {
    message: string;
};

export const ParameterTools = ({message}: ParameterToolsProps) => {

    function handleClick(){
        if(message == "Start Point"){
            console.log("should open a start point");
        }
        else{
            console.log("should open a destination");
        }
    }
    return(
        <div className="tool-card tool-card--stacked">
            <h3>{message}</h3>

            <button onClick={handleClick}>Drop a pin point</button>
        </div>
    )
}
