import { model, Schema } from "mongoose";
import { roles } from "../../src/utils/constant/enums.js";

// schema 
const userSchema = new Schema({
    userName: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        required: trueو
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: Object.values(roles),
        default: roles.USER
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: String,
    otpExpires: String
}, { timestamps: true })

// model
export const User = model('User', userSchema);