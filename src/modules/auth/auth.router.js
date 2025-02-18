import { Router } from "express";
import { isValid } from "../../middleware/validation.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import passport from "../../utils/passport.js";
import { forgetPasswordVal, loginVal, resetPasswordVal, signupVal, verifyOtpVal } from "./auth.validation.js";
import { forgetPassword, login, loginGoogle, resetPassword, signup, verifyAccount, verifyOtp } from "./auth.controller.js";


const authRouter = Router();

// signup
authRouter.post('/signup',
    isValid(signupVal),
    asyncHandler(signup)
)

// verify account
authRouter.get('/verify/:token',
    asyncHandler(verifyAccount)
)

// login
authRouter.post('/login',
    isValid(loginVal),
    asyncHandler(login)
)

// forget password
authRouter.post('/forget-password',
    isValid(forgetPasswordVal),
    asyncHandler(forgetPassword)
)

// verifyResetOtp
authRouter.post('/verify-otp',
    isValid(verifyOtpVal),
    asyncHandler(verifyOtp)
)

// resetPassword
authRouter.post('/reset-password',
    isValid(resetPasswordVal),
    asyncHandler(resetPassword)
)

// sign up with google
authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

// login callback
authRouter.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login", session: false },),
    asyncHandler(loginGoogle),
);


export default authRouter;