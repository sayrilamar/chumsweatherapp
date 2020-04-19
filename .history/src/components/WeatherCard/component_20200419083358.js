import React from "react";
import styled from "@emotion/styled";
import Location from "./Location";
import Icon from "./Icon";
import Condition from "./Condition";

const WeatherCard = ({temp, condition, city, state, description}) => {
    let highColor = 0;
    let lowColor = 0;
    let bg = null;

    if (temp > 53.6) {
        highColor = (1 - (temp - 53.6) / 50.4) * 255;
        lowColor = highColor - 150;
        bg = `linear-gradient(
            to top,
            rgb(255, ${highColor}, 0),
            rgb(255, ${lowColor}, 0)
          )`;
    } else if (temp <= 53.6) {
        highColor = (1 - (temp + 4) / 89) * 255;
        lowColor = highColor - 150;
        bg = `linear-gradient(
            to top,
            rgb(0, ${highColor}, 255),
            rgb(0, ${lowColor}, 255)
          )`;
    }

    const Card = styled.div `
    margin: 0 auto;
    background: ${bg};
    width: 800px;
    height: 800px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    border-radius: 15px;
  `;

    return (
        <Card>
            <h1>Hi Chum!</h1>
            <Location city={city} state={state}/>
            <Icon condition={condition}/>
            <Condition temp={temp} condition={condition} description={description}/>
        </Card>
    );
};

export default WeatherCard;
