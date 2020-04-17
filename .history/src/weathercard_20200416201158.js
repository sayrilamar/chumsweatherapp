import React from "react";

const WeatherCard = props => {
    return (
        <div className="card">
            <div className="location">
                <h1 className="city">Sydney</h1>
                <h3 className="country">AU</h3>
            </div>
            <img
                className="icon"
                src="http://openweathermap.org/img/wn/03d@2x.png"
                alt="Weather Icon"/>
            <h1 className="temp">20</h1>
            <h3 className="condition">Cloudy</h3>
        </div>
    );
};

export default WeatherCard;
