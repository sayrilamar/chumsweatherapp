// Extracted from WeatherCard/component.js (behavior unchanged) so the
// temperature -> background-gradient mapping can be unit tested directly
// instead of only incidentally via rendered CSS output.
const getWeatherGradient = (temp) => {
  let highColor = 0;
  let lowColor = 0;
  let bg = null;

  if (temp > 53.6) {
    highColor = (1 - (temp - 53.6) / 50.4) * 255;
    lowColor = highColor - 150;
    bg = `linear-gradient(
      to top,
      rgb(255, ${highColor}, 0),
      rgb(255, ${lowColor}, 0)
    )`;
  } else if (temp <= 53.6) {
    highColor = (1 - (temp + 4) / 89) * 255;
    lowColor = highColor - 150;
    bg = `linear-gradient(
      to top,
      rgb(0, ${highColor}, 255),
      rgb(0, ${lowColor}, 255)
    )`;
  }

  return bg;
};

export default getWeatherGradient;
