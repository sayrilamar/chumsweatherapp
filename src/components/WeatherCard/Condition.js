import React, {Fragment} from "react";
import styled from "@emotion/styled";

const Condition = ({temp, condition, description, feels_like}) => {
  const Temp = styled.h1 `
    font-family: "Fira Sans", sans-serif;
    font-size: 2rem;
    font-weight: 200;
    text-align: center;
  `;

  const State = styled.h3 `
    font-family: "Merriweather", sans-serif;
    font-size: 1.5rem;
    text-align: center;
  `;

  return (
    <Fragment>
      <State>{"It is " + description + " outside!"}</State>
      <Temp>
        It is {temp + " "}
        degrees outside, but it actually feels like {feels_like}!
      </Temp>
    </Fragment>
  );
};

export default Condition;
