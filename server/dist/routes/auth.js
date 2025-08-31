"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const google_auth_library_1 = require("google-auth-library");
const Otp_1 = __importDefault(require("../models/Otp"));
const User_1 = __importDefault(require("../models/User"));
const mailer_1 = require("../utils/mailer");
const auth_1 = require("../middleware/auth");
const jwt_1 = require("../utils/jwt");
const router = (0, express_1.Router)();
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const requestOtpSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    dob: zod_1.z.string().optional(),
    email: zod_1.z.string().email(),
    purpose: zod_1.z.enum(["signup", "login"])
});
router.post("/request-otp", async (req, res) => {
    const parsed = requestOtpSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    const { name, dob, email, purpose } = parsed.data;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt_1.default.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await Otp_1.default.deleteMany({ email, purpose });
    await Otp_1.default.create({ email, otpHash, purpose, expiresAt });
    try {
        await (0, mailer_1.sendOtpEmail)(email, otp);
    }
    catch {
        return res.status(500).json({ message: "Failed to send OTP email" });
    }
    res.json({ ok: true, prefill: { name, dob, email } });
});
const verifySchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    dob: zod_1.z.string().optional(),
    email: zod_1.z.string().email(),
    otp: zod_1.z.string().length(6)
});
router.post("/verify-otp", async (req, res) => {
    const parsed = verifySchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
    const { name, dob, email, otp } = parsed.data;
    const record = await Otp_1.default.findOne({ email }).sort({ createdAt: -1 });
    if (!record)
        return res.status(400).json({ message: "OTP not found or expired" });
    const ok = await bcrypt_1.default.compare(otp, record.otpHash);
    if (!ok)
        return res.status(400).json({ message: "Incorrect OTP" });
    let user = await User_1.default.findOne({ email });
    if (!user)
        user = await User_1.default.create({ name, dob, email, authProvider: "email" });
    await Otp_1.default.deleteMany({ email });
    const access = (0, jwt_1.signAccess)(user);
    const refresh = (0, jwt_1.signRefresh)(user);
    res.cookie("access_token", access, (0, auth_1.cookieOpts)());
    res.cookie("refresh_token", refresh, (0, auth_1.cookieOpts)(7 * 24 * 60 * 60 * 1000));
    res.json({ user: { id: user.id, name: user.name, email: user.email, dob: user.dob } });
});
router.post("/google", async (req, res) => {
    const schema = zod_1.z.object({ idToken: zod_1.z.string().min(10) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ message: "Invalid Google token" });
    const ticket = await googleClient.verifyIdToken({
        idToken: parsed.data.idToken,
        audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload.sub)
        return res.status(400).json({ message: "Invalid Google credential" });
    let user = await User_1.default.findOne({ email: payload.email });
    if (!user) {
        user = await User_1.default.create({
            name: payload.name || payload.email.split("@")[0],
            email: payload.email,
            authProvider: "google",
            googleId: payload.sub
        });
    }
    const access = (0, jwt_1.signAccess)(user);
    const refresh = (0, jwt_1.signRefresh)(user);
    res.cookie("access_token", access, (0, auth_1.cookieOpts)());
    res.cookie("refresh_token", refresh, (0, auth_1.cookieOpts)(7 * 24 * 60 * 60 * 1000));
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
});
router.get("/me", async (req, res) => {
    const token = req.cookies["access_token"];
    if (!token)
        return res.json({ user: null });
    try {
        const { uid } = (0, jwt_1.verifyAccess)(token);
        const user = await User_1.default.findById(uid).lean();
        res.json({ user: user ? { id: user._id, name: user.name, email: user.email, dob: user.dob } : null });
    }
    catch {
        res.json({ user: null });
    }
});
router.post("/logout", (_req, res) => {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    res.json({ ok: true });
});
exports.default = router;
