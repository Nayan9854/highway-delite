import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false, // true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Test connection on server startup
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ SMTP connection failed:", err);
  } else {
    console.log("✅ SMTP server is ready to send emails");
  }
});

export async function sendOtpEmail(to: string, otp: string) {
  try {
    const info = await transporter.sendMail({
      to,
      from: `"HD" <${process.env.SMTP_USER}>`,
      subject: "Your OTP Code",
      html: `<h2>Your OTP: ${otp}</h2><p>Expires in 5 minutes.</p>`,
    });

    console.log("✅ OTP email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Error sending OTP email:", err);
    throw err;
  }
}
