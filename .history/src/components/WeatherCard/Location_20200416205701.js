import React from "react";
import styled from "@emotion/styled";

const Location = props => {
    const Container = styled.div `
    text-align: center;
  `;

    const City = styled.div `
    font-family: "Merriweather", sans-serif;
    font-size: 1.6rem;
  `;

    return (
        <Container>
            <h1 className="city">Sydney</h1>
            <h3 className="country">AU</h3>
        </Container>
    );
};

export default Location;
