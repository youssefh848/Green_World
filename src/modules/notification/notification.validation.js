import joi from 'joi';
import { generalFields } from '../../middleware/validation.js';

export const sendNotificationVal = joi.object({
   message: generalFields.message.required(),
   userId: generalFields.objectId,
});


export const fetchWeatherAndNotifyVal = joi.object({
  userId: generalFields.objectId,
});