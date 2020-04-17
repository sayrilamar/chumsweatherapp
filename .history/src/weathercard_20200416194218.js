import React from "react";

const WeatherCard = props => {
    return (
        <div className="card">
            <h1 className="city">Sydney</h1>
            <h3 className="country">AU</h3>
            <img className="icon" src="" alt="Weather Icon"/>
            <h1 className="temp">20</h1>
            <h3 className="condition">Cloudy</h3>
        </div>
    );
};

export default WeatherCard;
