import jwt from "jsonwebtoken";

export const generateToken = (userId, res, req) => {
    const Token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });

    const isHttps = req ? (req.secure || req.headers["x-forwarded-proto"] === "https") : false;
    const isSecure = process.env.COOKIE_SECURE === "true" || (process.env.NODE_ENV === "production" && isHttps);

    res.cookie("jwt", Token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
        secure: isSecure,
    });   
    return Token;
};

