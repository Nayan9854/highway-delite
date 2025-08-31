import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import Otp from "../models/Otp";
import User from "../models/User";
import { sendOtpEmail } from "../utils/mailer";
import { cookieOpts } from "../middleware/auth";
import { signAccess, signRefresh, verifyAccess } from "../utils/jwt";

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ------------------ Request OTP ------------------
const requestOtpSchema = z.object({
  name: z.string().min(2),
  dob: z.string().optional(),
  email: z.string().email(),
  purpose: z.enum(["signup", "login"])
});

router.post("/request-otp", async (req, res) => {
  const parsed = requestOtpSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });

  const { name, dob, email, purpose } = parsed.data;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await Otp.deleteMany({ email, purpose });
  await Otp.create({ email, otpHash, purpose, expiresAt });

  try {
    await sendOtpEmail(email, otp);
  } catch (err) {
    console.error("Failed to send OTP email:", err);
    return res.status(500).json({ message: "Failed to send OTP email" });
  }

  res.json({ ok: true, prefill: { name, dob, email } });
});

// ------------------ Verify OTP ------------------
const verifySchema = z.object({
  name: z.string().min(2),
  dob: z.string().optional(),
  email: z.string().email(),
  otp: z.string().length(6)
});

router.post("/verify-otp", async (req, res) => {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });

  const { name, dob, email, otp } = parsed.data;
  const record = await Otp.findOne({ email }).sort({ createdAt: -1 });
  if (!record) return res.status(400).json({ message: "OTP not found or expired" });

  const ok = await bcrypt.compare(otp, record.otpHash);
  if (!ok) return res.status(400).json({ message: "Incorrect OTP" });

  let user = await User.findOne({ email });
  if (!user) user = await User.create({ name, dob, email, authProvider: "email" });

  await Otp.deleteMany({ email });

  const access = signAccess(user);
  const refresh = signRefresh(user);
  res.cookie("access_token", access, cookieOpts());
  res.cookie("refresh_token", refresh, cookieOpts(7 * 24 * 60 * 60 * 1000));
  res.json({ user: { id: user.id, name: user.name, email: user.email, dob: user.dob } });
});

// ------------------ Google Login ------------------
router.post("/google", async (req, res) => {
  try {
    console.log("Incoming Google login body:", req.body);

    const schema = z.object({ idToken: z.string().min(10) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      console.warn("Invalid Google token format:", parsed.error.issues);
      return res.status(400).json({ message: "Invalid Google token" });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error("Missing GOOGLE_CLIENT_ID in environment");
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: parsed.data.idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload.sub) {
      console.warn("Invalid Google payload:", payload);
      return res.status(400).json({ message: "Invalid Google credential" });
    }

    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        name: payload.name || payload.email.split("@")[0],
        email: payload.email,
        authProvider: "google",
        googleId: payload.sub
      });
    }

    console.log("User found/created:", user);

    const access = signAccess(user);
    const refresh = signRefresh(user);
    res.cookie("access_token", access, cookieOpts());
    res.cookie("refresh_token", refresh, cookieOpts(7 * 24 * 60 * 60 * 1000));
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("Google auth route error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ------------------ Me ------------------
router.get("/me", async (req, res) => {
  const token = req.cookies["access_token"];
  if (!token) return res.json({ user: null });

  try {
    const { uid } = verifyAccess(token);
    const user = await User.findById(uid).lean();
    res.json({ user: user ? { id: user._id, name: user.name, email: user.email, dob: user.dob } : null });
  } catch (err) {
    console.error("Error verifying access token:", err);
    res.json({ user: null });
  }
});

// ------------------ Logout ------------------
router.post("/logout", (_req, res) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.json({ ok: true });
});

export default router;
