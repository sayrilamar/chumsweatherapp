import React, { Fragment } from "react";
import styled from "@emotion/styled";
import { mmToInches } from "../../utils/weatherDetails";

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

const Precip = styled.p`
  font-family: "Fira Sans", sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: #2f7bc7;
  margin: 4px 0 0;
  text-align: center;
`;

const Condition = ({ temp, condition, description, feels_like, rainVolume1h, snowVolume1h }) => {
  const rainInches = mmToInches(rainVolume1h);
  const snowInches = mmToInches(snowVolume1h);

  return (
    <Fragment>
      <Temp>
        It is {temp}
        {"°"}
      </Temp>
      <State>{description}</State>
      <FeelsLike>Feels like {feels_like}{"°"}</FeelsLike>
      {typeof rainVolume1h === "number" && (
        <Precip>
          Rain: {rainVolume1h} mm/hr ({rainInches} in/hr)
        </Precip>
      )}
      {typeof snowVolume1h === "number" && (
        <Precip>
          Snow: {snowVolume1h} mm/hr ({snowInches} in/hr)
        </Precip>
      )}
    </Fragment>
  );
};

export default Condition;
