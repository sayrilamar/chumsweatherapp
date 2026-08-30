import React from "react";
import styled from "@emotion/styled";

const Container = styled.div`
  text-align: center;
`;

const City = styled.h1`
  font-family: "Merriweather", sans-serif;
  font-size: 2.6rem;
  font-weight: 700;
  margin: 0;
  text-align: center;
`;

const Country = styled.h3`
  font-family: "Fira Sans", sans-serif;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b6b80;
  margin: 2px 0 0;
  text-align: center;
`;

const Location = ({ city, state }) => {
  return (
    <Container>
      <City>{city}</City>
      <Country>{state}</Country>
    </Container>
  );
};

export default Location;
