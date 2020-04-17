import React from "react";
import styled from "@emotion/styled";

const Location = props => {
    const container = styled.div `
    text-align: center;
  `;

    return (
        <div className="location">
            <h1 className="city">Sydney</h1>
            <h3 className="country">AU</h3>
        </div>
    );
};

export default Location;
