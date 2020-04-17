import React from "react";
import styled from "@emotion/styled";
import Location from "./Location";

const WeatherCard = props => {
    const Card = styled.div `
    margin: 0 auto;
    background: linear-gradient(to bottom, blue, lightblue);
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
            <Location/> {/*https://openweathermap.org/weather-conditions */}
            <img
                className="icon"
                src="http://openweathermap.org/img/wn/03d@2x.png"
                alt="Weather Icon"/>
            <h1 className="temp">20</h1>
            <h3 className="condition">Cloudy</h3>
        </Card>
    );
};

export default WeatherCard;
