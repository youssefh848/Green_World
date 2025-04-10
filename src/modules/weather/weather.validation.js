import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const getWeatherByIPVal = joi.object({
    city: generalFields.city,
    country: generalFields.country,
    coordinates: generalFields.coordinates,
    temperature: generalFields.temperature,
    feelsLike: generalFields.feelsLike,
    humidity: generalFields.humidity,
});

export const getWeatherByCoordsVal = joi.object({
    city: generalFields.city,
    country: generalFields.country,
    coordinates: generalFields.coordinates.required(),
    temperature: generalFields.temperature,
    feelsLike: generalFields.feelsLike,
    humidity: generalFields.humidity,
});

export const getWeatherByCityVal = joi.object({
  city: generalFields.city.required(),
});
