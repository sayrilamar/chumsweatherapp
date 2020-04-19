import React from "react";
import styled from "@emotion/styled";

const Location = ({city, state}) => {
  const Container = styled.div `
    text-align: center;
  `;

  const City = styled.h1 `
    font-family: "Merriweather", sans-serif;
    font-size: 3.6rem;
    text-align: center;
  `;

  const Country = styled.h3 `
    font-family: "Fira Sans", sans-serif;
    font-size: 1.1rem;
    text-align: center;
  `;

  return (
    <Container>
      <City>{city}</City>
      <Country>{state}</Country>
    </Container>
  );
};

export default Location;
