import React, { Fragment } from "react";
import styled from "@emotion/styled";

const State = styled.p`
  font-family: "Fira Sans", sans-serif;
  font-size: 1.1rem;
  font-weight: 500;
  color: #4a4a68;
  margin: 4px 0 0;
  text-align: center;
  text-transform: capitalize;
`;

const Temp = styled.p`
  font-family: "Merriweather", sans-serif;
  font-size: 4rem;
  font-weight: 700;
  line-height: 1;
  margin: 4px 0 0;
  text-align: center;
`;

const FeelsLike = styled.p`
  font-family: "Fira Sans", sans-serif;
  font-size: 0.95rem;
  color: #6b6b80;
  margin: 4px 0 0;
  text-align: center;
`;

const Condition = ({ temp, condition, description, feels_like }) => {
  return (
    <Fragment>
      <Temp>
        It is {temp}
        {"°"}
      </Temp>
      <State>{description}</State>
      <FeelsLike>Feels like {feels_like}{"°"}</FeelsLike>
    </Fragment>
  );
};

export default Condition;
