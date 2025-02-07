// import modules
import joi from 'joi';
import { AppError } from '../utils/appError.js';

export const generalFields = {
    name: joi.string(),
    phoneNumber: joi.string().pattern(new RegExp(/^01[0-2,5]{1}[0-9]{8}$/)),
    password: joi.string().pattern(new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)),
    confirmPassword: joi.alternatives().try(
        joi.ref("password"),
        joi.ref("newPassword")
    ),
    email: joi.string().email(),
    objectId: joi.string().hex().length(24),
    otp: joi.string().length(6),
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
