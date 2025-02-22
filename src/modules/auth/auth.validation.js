// modules
import joi from 'joi';
import { generalFields } from '../../middleware/validation.js';


// signupVal
export const signupVal = joi.object({
    userName: generalFields.name.required(),
    email: generalFields.email.required(),
    password: generalFields.password.required(),
})

// loginVal
export const loginVal = joi.object({
    email: generalFields.email.required(),
    password: generalFields.password.required()
})

// forgetPasswordVal
export const forgetPasswordVal = joi.object({
    email: generalFields.email.required()
})

// verifyOtpVal
export const verifyOtpVal = joi.object({
    otp: generalFields.otp.required(),
    email: generalFields.email.required()
})

// resetPasswordVal
export const resetPasswordVal = joi.object({
    email: generalFields.email.required(),
    newPassword: generalFields.password.required(),
    confirmPassword: generalFields.confirmPassword.required()
})