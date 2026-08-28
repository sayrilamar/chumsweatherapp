import React from "react";
import styled from "@emotion/styled";
import Location from "./Location";
import Icon from "./Icon";
import Condition from "./Condition";
import getWeatherGradient from "./gradient";

const WeatherCard = ({
    temp,
    condition,
    city,
    state,
    description,
    feels_like,
    icon
}) => {
    const bg = getWeatherGradient(temp);

    const Card = styled.div `
    margin: 0 auto;
    background: ${bg};
    width: 100%;
    height: 80%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    border-radius: 15px;
    text-align: center;
  `;

    return (
        <Card>
            <h2>Hey Chum! Here's your forcast for...</h2>
            <Location city={city} state={state}/>
            <Icon condition={condition} icon={icon}/>
            <Condition
                temp={temp}
                condition={condition}
                description={description}
                feels_like={feels_like}/>
            created by daddy!
        </Card>
    );
};

export default WeatherCard;
