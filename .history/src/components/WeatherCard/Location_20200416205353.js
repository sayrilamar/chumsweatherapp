import React from "react";
import styled from "@emotion/styled";

const Location = props => {
    const Container = styled.div `
    text-align: center;
  `;

    return (
        <Container>
            <h1 className="city">Sydney</h1>
            <h3 className="country">AU</h3>
        </Container>
    );
};

export default Location;
