import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { genreateToken } from "./token.js";
import { User } from "../../db/index.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ email: profile.emails[0].value });

                if (!user) {
                    user = new User({
                        userName: profile.displayName,
                        email: profile.emails[0].value,
                        password: null, // not responce with google
                        isVerified: true, // because his verified by google
                    });
                    await user.save();
                }

                const token = genreateToken({ payload: { email: user.email, _id: user._id } });
                return done(null, { user, token });
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

export default passport;
