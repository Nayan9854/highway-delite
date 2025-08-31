"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookieOpts = void 0;
exports.requireAuth = requireAuth;
const jwt_1 = require("../utils/jwt");
const cookieOpts = (maxAge = 15 * 60 * 1000) => ({
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge
});
exports.cookieOpts = cookieOpts;
function requireAuth(req, res, next) {
    const token = req.cookies["access_token"];
    if (!token)
        return res.status(401).json({ message: "Unauthorized" });
    try {
        const { uid } = (0, jwt_1.verifyAccess)(token);
        req.userId = uid;
        next();
    }
    catch {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}
