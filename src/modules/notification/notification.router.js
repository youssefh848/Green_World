import { Router } from 'express';
import { sendNotification, fetchWeatherAndNotify } from './notification.controller.js';
import { isAuthenticated } from '../../middleware/authentication.js';
import { isAuthorized } from '../../middleware/autheraization.js';
import { roles } from '../../utils/constant/enums.js';
import { isValid } from '../../middleware/validation.js';
import { sendNotificationVal } from './notification.validation.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';

const notificationRouter = Router();

// Route to send a notification
notificationRouter.post(
  '/',
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.USER]),
  isValid(sendNotificationVal),
  sendNotification
);

// Route to fetch weather and send notification
notificationRouter.post(
  '/weather',
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.USER]),
  asyncHandler(fetchWeatherAndNotify)
);

export default notificationRouter; 
