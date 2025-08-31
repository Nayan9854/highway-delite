"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = sendOtpEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});
async function sendOtpEmail(to, otp) {
    await transporter.sendMail({
        to,
        from: `"HD" <${process.env.SMTP_USER}>`,
        subject: "Your OTP Code",
        html: `<h2>Your OTP: ${otp}</h2><p>Expires in 5 minutes.</p>`
    });
}
