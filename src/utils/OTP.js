import { customAlphabet } from "nanoid";
import { sendEmail } from "./sendEmail.js";


// Generate a random 6-digit OTP
export const generateOTP = customAlphabet("0123456789", 6);


// send otp via mail 
export const sendOTP = async (email, otp) => {
    const mailOptions = await sendEmail({
        to: email,
        subject: "Your OTP Code",
        html: `<p>Your OTP code is: <strong>${otp}</strong>. It is valid for 10 minutes.</p>`,
    })
};
