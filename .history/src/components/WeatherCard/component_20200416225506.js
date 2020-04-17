import React from "react";
import styled from "@emotion/styled";
import Location from "./Location";
import Icon from "./Icon";
import Condition from "./Condition";

const WeatherCard = props => {
    let temp = 30;
    let highColor = (1 - (temp - 12) / 28) * 255;
    let lowColor = highColor - 150;
    const Card = styled.div `
    margin: 0 auto;
    background: linear-gradient(to bottom, rgb(255, ${green}, 0), lightblue);
    width: 200px;
    height: 240px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    border-radius: 15px;
  `;

    return (
        <Card>
            <Location/>
            <Icon/>
            <Condition/>
        </Card>
    );
};

export default WeatherCard;
