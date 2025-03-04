import bcrypt from 'bcrypt';
import { User } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";
import { genreateToken, verifyToken } from '../../utils/token.js';
import { roles } from '../../utils/constant/enums.js';
import { sendEmail } from '../../utils/sendEmail.js';
import { generateOTP, sendOTP } from '../../utils/OTP.js';

// signup
export const signup = async (req, res, next) => {
    // get data from req
    const { userName, email, password } = req.body;
    // check user existence
    const userExist = await User.findOne({ email });
    if (userExist) {
        return next(new AppError(messages.user.alreadyExist, 409))
    }
    // hash password
    const hashedPassword = bcrypt.hashSync(password, 10);
    // creat a new user 
    const user = new User({
        userName,
        email,
        password: hashedPassword
    })
    // save in DB
    const userCreated = await user.save()
    // handel fail
    if (!userCreated) {
        return next(new AppError(messages.user.failToCreate, 500))
    }
    // genreta token
    const token = genreateToken({ payload: { email, _id: userCreated._id } })
    // send verifction to email 
    await sendEmail({
        to: email,
        subject: "🌱 Green World - Verify Your Account",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f6fff0; text-align: center;">
            <h2 style="color: #4CAF50;">🌱 Welcome to Green World!</h2>
            <p style="font-size: 16px; color: #333;">
                Thank you for signing up! Please verify your email to activate your account.
            </p>
            <a href="${req.protocol}://${req.headers.host}/auth/verify/${token}" 
                style="display: inline-block; padding: 12px 20px; background-color: #4CAF50; color: white; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 8px; margin-top: 10px;">
                Verify Your Account
            </a>
            <p style="color: #555; font-size: 14px; margin-top: 10px;">
                If you did not create this account, please ignore this email.
            </p>
            <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
                © 2025 Green World. Growing together. 🌿
            </p>
        </div>
        `,
    });
    // send res
    return res.status(201).json({
        message: messages.user.created,
        success: true,
        data: userCreated
    })
}

// verifyAccount
export const verifyAccount = async (req, res, next) => {
    // Get the token from request parameters
    const { token } = req.params;

    // Verify the token and extract payload
    const payload = verifyToken(token);

    // If the token is invalid, return an error
    if (!payload) {
        return res.send(`
            <html>
                <head>
                    <title>Verification Failed</title>
                    <style>
                        body { text-align: center; font-family: Arial, sans-serif; background-color: #f6fff0; padding: 50px; }
                        .container { max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff; }
                        h1 { color: red; }
                        p { color: #555; font-size: 16px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>❌ Verification Failed</h1>
                        <p>The verification link is invalid or has expired.</p>
                    </div>
                </body>
            </html>
        `);
    }

    // Find the user by email and update their status to VERIFIED
    const updatedUser = await User.findOneAndUpdate(
        { email: payload.email, role: roles.USER },
        { isVerified: true },
        { new: true }
    );

    // Check if user was found and updated
    if (!updatedUser) {
        return res.send(`
            <html>
                <head>
                    <title>Verification Failed</title>
                    <style>
                        body { text-align: center; font-family: Arial, sans-serif; background-color: #f6fff0; padding: 50px; }
                        .container { max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff; }
                        h1 { color: red; }
                        p { color: #555; font-size: 16px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>❌ Verification Failed</h1>
                        <p>User not found. Please check your email for a new verification link.</p>
                    </div>
                </body>
            </html>
        `);
    }

    // Send success response
    return res.send(`
        <html>
            <head>
                <title>Verification Successful</title>
                <style>
                    body { text-align: center; font-family: Arial, sans-serif; background-color: #f6fff0; padding: 50px; }
                    .container { max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff; }
                    h1 { color: #4CAF50; }
                    p { color: #555; font-size: 16px; }
                    .btn {
                        display: inline-block;
                        padding: 12px 20px;
                        background-color: #4CAF50;
                        color: white;
                        text-decoration: none;
                        font-size: 16px;
                        font-weight: bold;
                        border-radius: 8px;
                        margin-top: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>✅ Verification Successful</h1>
                    <p>Your account has been successfully verified. You can now log in.</p>
                </div>
            </body>
        </html>
    `);
};

// login
export const login = async (req, res, next) => {
    // get data from req
    const { email, password } = req.body
    // check existance by phone number
    const userExist = await User.findOne({ email });
    if (!userExist) {
        return next(new AppError(messages.user.invalidCredntiols, 401))
    }
    // check if password is correct 
    const isPasswordCorrect = bcrypt.compareSync(password, userExist.password)
    if (!isPasswordCorrect) {
        return next(new AppError(messages.user.invalidCredntiols, 401))
    }
    // check if user is verified
    if (!userExist.isVerified) {
        return next(new AppError(messages.user.notVerified, 403))
    }
    // genreate token
    const token = genreateToken({ payload: { email: email, _id: userExist._id } })
    // send res 
    return res.status(200).json({
        message: messages.user.loginSuccessfully,
        success: true,
        token: token
    })
}

// forget password
export const forgetPassword = async (req, res, next) => {
    // get data from req
    const { email } = req.body
    // check existance
    const userExist = await User.findOne({ email });
    if (!userExist) {
        return next(new AppError(messages.user.notExist, 401))
    }
    // genreate otp
    const otp = generateOTP()
    // send otp 
    await sendOTP(userExist.email, otp)
    userExist.otp = otp; // Save OTP to user record
    userExist.otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minut
    // save otp in db to check
    const addOtp = await userExist.save()
    if (!addOtp) {
        return next(new AppError(messages.user.failToUpdate, 500))
    }
    // send res
    return res.status(200).json({ message: messages.user.otpSent, success: true })
}

// verifyResetOtp
export const verifyOtp = async (req, res, next) => {
    // get data from req
    const { otp, email } = req.body
    // check if user exist 
    const userExist = await User.findOne({ email });
    if (!userExist) {
        return next(new AppError(messages.user.notExist, 401))
    }
    // check if otp valid
    if (userExist.otp !== otp || Date.now() > userExist.otpExpires) {
        return next(new AppError(messages.user.invalidOTP, 400));
    }
    // clear otp from db
    userExist.otp = undefined;
    userExist.otpExpires = undefined;
    userExist.otpVerified = true;
    // save edition in db 
    const updatedUser = await userExist.save()
    // handel fail
    if (!updatedUser) {
        return next(new AppError(messages.user.failToUpdate, 400))
    }
    // send res 
    return res.status(200).json({ message: messages.user.otpVerified, success: true })

}

// resetPassword
export const resetPassword = async (req, res, next) => {
    // get data from req
    const { email, newPassword } = req.body;
    // check if user exist
    const userExist = await User.findOne({ email });
    if (!userExist) {
        return next(new AppError(messages.user.notExist, 401))
    }
    // check if user has verified otp
    if (!userExist.otpVerified) {
        return next(new AppError(messages.user.invalidOTP, 400));
    }
    // hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // update user password
    userExist.password = hashedPassword;
    userExist.otpVerified = false;
    // save edition in db
    const updatedUser = await userExist.save()
    // handel fail
    if (!updatedUser) {
        return next(new AppError(messages.user.failToUpdate, 400))
    }
    // send res
    return res.status(200).json({ message: messages.user.passwordUpdated, success: true })
}

// loginGoogle
export const loginGoogle = async (req, res, next) => {
    // get data from req
    const { token } = req.user;

    const deepLink = `myapp://auth?token=${token}`;

    // send res 
    return res.redirect(deepLink);

}


