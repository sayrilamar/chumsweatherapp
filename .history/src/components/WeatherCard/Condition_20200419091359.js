import React, {Fragment} from "react";
import styled from "@emotion/styled";

const Condition = ({temp, condition, description, feels_like}) => {
  const Temp = styled.h1 `
    font-family: "Fira Sans", sans-serif;
    font-size: 4rem;
    font-weight: 200;
  `;

  const State = styled.h3 `
    font-family: "Merriweather", sans-serif;
    font-size: 1.2rem;
  `;

  return (
    <Fragment>
      <Temp>
        It is {temp + " "}
        Degrees outside, but it actually feels like {feels_like}!
      </Temp>
      <State>{"Look up and you'll see " + description + "!"}</State>
    </Fragment>
  );
};

export default Condition;
