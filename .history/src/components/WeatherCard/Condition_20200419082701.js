import React, {Fragment} from "react";
import styled from "@emotion/styled";

const Condition = ({temp, condition, description}) => {
  const Temp = styled.h1 `
    font-family: "Fira Sans", sans-serif;
    font-size: 2rem;
    font-weight: 200;
  `;

  const State = styled.h3 `
    font-family: "Merriweather", sans-serif;
    font-size: 1.2rem;
  `;

  return (
    <Fragment>
      <Temp>It is {temp}+" " Degrees outside!</Temp>
      <State>{description}</State>
    </Fragment>
  );
};

export default Condition;
