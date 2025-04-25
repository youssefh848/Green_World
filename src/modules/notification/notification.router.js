import { Router } from 'express';
import { sendNotification, fetchWeatherAndNotify } from './notification.controller.js';
import { isAuthenticated } from '../../middleware/authentication.js';
import { isAuthorized } from '../../middleware/autheraization.js';
import { roles } from '../../utils/constant/enums.js';
import { isValid } from '../../middleware/validation.js';
import { fetchWeatherAndNotifyVal, sendNotificationVal } from './notification.validation.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';

const notificationRouter = Router();

// Route to send a notification
notificationRouter.post(
  '/',
  isAuthenticated(),
  isAuthorized([roles.ADMIN]),
  isValid(sendNotificationVal),
  sendNotification
);

// Route to fetch weather and send notification
notificationRouter.get(
  '/weather',
  isAuthenticated(),
  isAuthorized([roles.ADMIN]),
  isValid(fetchWeatherAndNotifyVal),
  asyncHandler(fetchWeatherAndNotify)
);

export default notificationRouter; 
