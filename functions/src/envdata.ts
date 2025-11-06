import * as functions from "firebase-functions";
import axios from "axios";

export const getWeather = functions.https.onRequest(async (req, res) => {
  const { city } = req.query;
  const apiKey = functions.config().openweather.key;
  const result = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`);
  res.json(result.data);
});
// Add similar proxies for air quality, soil moisture, etc.
