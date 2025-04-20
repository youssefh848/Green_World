import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { roles } from "../../utils/constant/enums.js";
import { isValid } from "../../middleware/validation.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { getWeatherByCoords, getWeatherByIP, getWeatherByCity } from "./weather.controller.js";
import { getWeatherByCoordsVal, getWeatherByIPVal, getWeatherByCityVal } from "./weather.validation.js";

const weatherRouter = Router();
// Get weather by user IP
weatherRouter.get(
  "/ip",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.USER]),
  isValid(getWeatherByIPVal),
  asyncHandler(getWeatherByIP)
);

// Get weather by coordinates
weatherRouter.post(
  "/coords",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.USER]),
  isValid(getWeatherByCoordsVal),
  asyncHandler(getWeatherByCoords)
);

// Get weather by city name
weatherRouter.post(
  "/city",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.USER]),
  isValid(getWeatherByCityVal),
  asyncHandler(getWeatherByCity)
);

export default weatherRouter;
