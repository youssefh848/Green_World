// import modules
import joi from 'joi';
import { AppError } from '../utils/appError.js';
import { plantCategories, soilTypes, wateringFrequencies } from '../utils/constant/enums.js';

export const generalFields = {
    name: joi.string(),
    phoneNumber: joi.string().pattern(new RegExp(/^01[0-2,5]{1}[0-9]{8}$/)),
    password: joi.string()
        .pattern(new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/))
        .messages({
            "string.pattern.base": "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.",
        }),
    confirmPassword: joi.alternatives().try(
        joi.ref("password"),
        joi.ref("newPassword")
    ),
    email: joi.string().email(),
    objectId: joi.string().hex().length(24),
    otp: joi.string().length(6),
    scientificName: joi.string().trim().optional(),
    category: joi.string().valid(...Object.values(plantCategories)).required(),
    origin: joi.string().trim().required(),
    description: joi.string().trim().optional(),
    image: joi.object({
    secure_url: joi.string().uri().required(),
    public_id: joi.string().required(),
    }).required(),
    wateringFrequency: joi.string().valid(...Object.values(wateringFrequencies)).required(),
    temperatureRange: joi.object({
        min: joi.number().required()
          .custom((value) => `${value}°C`, "Temperature with unit"), // إضافة "°C"
        max: joi.number().required()
          .custom((value) => `${value}°C`, "Temperature with unit"),
      }).required(),
    soilType: joi.string().valid(...Object.values(soilTypes)).required(),
    objectId: joi.string().hex().length(24),
    city: joi.string().trim(),
    country: joi.string().trim(),
    coordinates: joi.object({
        lat: joi.number().min(-90).max(90),
        lon: joi.number().min(-180).max(180),
    }),
    temperature: joi.number(),
    feelsLike: joi.number(),
    humidity: joi.number(),
    title: joi.string().trim(),
    message: joi.string(),
    link: joi.string().uri(),
    read: joi.boolean(),
    
};

export const isValid = (schema) => {
    return (req, res, next) => {
        let data = { ...req.body, ...req.params, ...req.query };
        const { error } = schema.validate(data, { abortEarly: false });
        if (error) {
            const errorMessage = error.details.map((detail) => detail.message).join(', ');
            return next(new AppError(errorMessage, 400));
        }
        next();
    };
};
