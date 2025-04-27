import axios from "axios";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";

// Get weather by user IP
export const getWeatherByIP = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  // Get location data using IP
  const locationRes = await axios.get(`http://ip-api.com/json/${ip}`);
  const { lat, lon, city, country } = locationRes.data;

  // Check if location data is valid
  if (!lat || !lon || !city || !country) {
    return next(new AppError(messages.weather.failToLocate, 400));
  }

  // Get weather data from OpenWeather API
  const apiKey = process.env.WEATHER_API_KEY;
  const weatherRes = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  );

  const { description } = weatherRes.data.weather[0];
  const { temp, feels_like, humidity, temp_min, temp_max } = weatherRes.data.main;

  // Send weather data in the response
  res.status(200).json({
    success: true,
    message: messages.weather.fetchedSuccessfully,
    data: {
      location: { city, country },
      weather: {
        description,
        temperature: temp,
        minTemperature: temp_min,
        maxTemperature: temp_max,
        feelsLike: feels_like,
        humidity,
      },
    },
  });
};

// Get weather by provided coordinates
export const getWeatherByCoords = async (req, res, next) => {
  const { coordinates } = req.body;

  // Check if coordinates are provided
  if (!coordinates || !coordinates.lat || !coordinates.lon) {
    return next(new AppError(messages.weather.invalidCoordinates, 400));
  }

  const { lat, lon } = coordinates;

  // Validate coordinate ranges
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return next(new AppError(messages.weather.invalidCoordinateRange , 400));
  }

  // Get weather data from OpenWeather API
  const apiKey = process.env.WEATHER_API_KEY;
  const weatherRes = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  );

  // Check if the response contains valid weather data
  if (!weatherRes.data || !weatherRes.data.weather || weatherRes.data.weather.length === 0) {
    return next(new AppError(messages.weather.failToLocate, 400));
  }

  const { name: city, sys, weather, main } = weatherRes.data;

  const { temp, feels_like, humidity, temp_min, temp_max } = main;

  // Save the weather data to the database
  const weatherData = await Weather.create({
    city,
    country: sys.country,
    coordinates: { lat, lon },
    description: weather[0].description,
    temperature: temp,
    minTemperature: temp_min,
    maxTemperature: temp_max,
    feelsLike: feels_like,
    humidity,
  });

  // Return the weather data without saving to the database
  res.status(200).json({
    success: true,
    message: messages.weather.fetchedSuccessfully,
    data: {
      location: { city, country: sys.country },
      weather: {
        description: weather[0].description,
        temperature: temp,
        minTemperature: temp_min,
        maxTemperature: temp_max,
        feelsLike: feels_like,
        humidity,
      },
    },
  });
};

// Get weather by city name
export const getWeatherByCity = async (req, res, next) => {
  const { city } = req.body;

  // Check if city name is provided
  if (!city) {
    return next(new AppError(messages.weather.cityNameRequired, 400));
  }

  // Get weather data from OpenWeather API
  const apiKey = process.env.WEATHER_API_KEY;
  const weatherRes = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
  );

  // Check if the response contains valid weather data
  if (!weatherRes.data || !weatherRes.data.weather || weatherRes.data.weather.length === 0) {
    return next(new AppError(messages.weather.failToLocate, 400));
  }

  const { name: cityName, sys, weather, main } = weatherRes.data;

  const { temp, feels_like, humidity, temp_min, temp_max } = main;

  // Return the weather data
  res.status(200).json({
    success: true,
    message: messages.weather.fetchedSuccessfully,
    data: {
      location: { city: cityName, country: sys.country },
      weather: {
        description: weather[0].description,
        temperature: temp,
        minTemperature: temp_min,
        maxTemperature: temp_max,
        feelsLike: feels_like,
        humidity,
      },
    },
  });
};