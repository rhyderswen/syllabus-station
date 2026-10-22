import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

import {Strategy as CasStrategy} from "@coursetable/passport-cas";
import {prismaGlobal} from "~/sharedDb";

let router = express.Router();
const refreshTokenTTLms = 7 * 24 * 60 * 60 * 1000;
const tokenLifetime = '15m';
const refreshTokenExpiry = '7d';

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

router.get("/login", passport.authenticate('cas', {session: false}), async (req, res) => {
    if (!req.user) {
        return res.status(401).send("Authentication failed");
    }

    if (!await prismaGlobal.user.findUnique({where: {id: (req.user as any).netId}})) {
        await prismaGlobal.user.create({
            data: {
                id: (req.user as any).netId as string,
                isAdmin: false,
                isBanned: false,
            }
        });
    }

    const userPayload = {netId: (req.user as any).netId};
    const token = jwt.sign(userPayload, process.env.JWT_SECRET!, {expiresIn: tokenLifetime});
    const refreshToken = jwt.sign(userPayload, process.env.JWT_SECRET!, {expiresIn: refreshTokenExpiry});

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    await prismaGlobal.refreshToken.create({
        data: {
            token: refreshToken,
            userId: (req.user as any).netId,
            expiresAt: new Date(Date.now() + refreshTokenTTLms),
        }
    })

    res.redirect('/');
});

router.post('/login/password', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

router.get('/checkAuth', (req, res) => {
    if (!req.user) {
        return res.status(401).send("Unauthorized");
    }
    res.status(200).send("Authenticated");
})

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    res.redirect('/');
});

router.get('/refresh', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).send("Refresh token not found");
    }

    try {
        const dbToken = await prismaGlobal.refreshToken.findUnique({
            where: {token: refreshToken},
            include: {user: true}
        });

        if (!dbToken) {
            return res.status(403).send("Invalid or expired refresh token");
        }

        if (dbToken.expiresAt.getTime() < Date.now()) {
            await prismaGlobal.refreshToken.delete({where: {token: refreshToken}});
            return res.status(403).send("Invalid or expired refresh token");
        }

        const userPayload = {netId: dbToken.userId};
        const newToken = jwt.sign(userPayload, process.env.JWT_SECRET!, {expiresIn: tokenLifetime});
        const newRefreshToken = jwt.sign(userPayload, process.env.JWT_SECRET!, {expiresIn: refreshTokenExpiry});

        res.cookie('token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        await prismaGlobal.refreshToken.delete({where: {token: refreshToken}});
        await prismaGlobal.refreshToken.create({
            data: {
                token: newRefreshToken,
                userId: dbToken.userId,
                expiresAt: new Date(Date.now() + refreshTokenTTLms)
            }
        });

        res.send("Refreshed token");
    } catch (err) {
        console.error("Refresh error:", err);
        res.status(403).send("Invalid refresh token");
    }
})

export default router;