import jwt from "jsonwebtoken";

export const generateToken = (userId, res, req) => {
    const secret = process.env.JWT_SECRET || "thisissecretkeyofmyprojetc";

    const Token = jwt.sign({ userId }, secret, {
        expiresIn: "7d",
    });

    const isHttps = req ? (req.secure || req.headers["x-forwarded-proto"] === "https") : false;
    const isProduction = process.env.NODE_ENV === "production";

    // Support both single-domain and cross-domain production deployments (e.g. Render + Vercel)
    const sameSiteMode = (isProduction && isHttps) ? "none" : "lax";
    const isSecure = (sameSiteMode === "none") || process.env.COOKIE_SECURE === "true" || (isProduction && isHttps);

    res.cookie("jwt", Token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: sameSiteMode,
        secure: isSecure,
    });   
    return Token;
};


