import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

import {Strategy as CasStrategy} from "@coursetable/passport-cas";

let router = express.Router();

passport.use(
    new CasStrategy(
        {
            version: "CAS2.0",
            ssoBaseURL: "https://login.case.edu/cas",
            serverBaseURL: 'https://localhost:3000'
        },
        function (profile, done) {
            console.log("verify user: ", profile);
            done(null, {
                netId: profile.user,
            });
        }
    )
);

router.get("/login", passport.authenticate('cas', { session: false }), (req, res) => {
    if (!req.user) {
        return res.status(401).send("Authentication failed");
    }

    const token = jwt.sign(req.user, process.env.JWT_SECRET!, { expiresIn: '1d' });

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    res.send("Logged in as: " + (req.user as any).netId + "");
});

router.post('/login/password', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

export default router;