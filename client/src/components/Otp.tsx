import React, { useState, useEffect } from "react";
import { api } from "../api";

interface Props {
  values: Record<string, any>; // { name, dob, email, purpose }
  onOtpSent?: () => void;      // callback to run after OTP is sent
}

export default function OtpButton({ values, onOtpSent }: Props) {
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  async function sendOtp() {
    try {
      setLoading(true);
      await api.post("/api/auth/request-otp", values);

      setOtpSent(true);
      setCooldown(300); // 5 minutes
      sessionStorage.setItem("otpCooldownStart", Date.now().toString());
      sessionStorage.setItem("prefill", JSON.stringify(values));

      if (onOtpSent) onOtpSent();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  // restore cooldown if page refreshed
  useEffect(() => {
    const start = sessionStorage.getItem("otpCooldownStart");
    if (start) {
      const elapsed = Math.floor((Date.now() - Number(start)) / 1000);
      if (elapsed < 300) {
        setCooldown(300 - elapsed);
        setOtpSent(true);
      }
    }
  }, []);

  // decrease cooldown every second
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  return (
    <div className="flex space-x-2">
      {/* Send OTP button */}
      <button
        type="button"
        onClick={sendOtp}
        disabled={otpSent || loading}
        className={`px-4 py-2 rounded flex-1 ${
          otpSent || loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 text-white"
        }`}
      >
        {loading ? "Sending..." : "Send OTP"}
      </button>

      {/* Resend OTP button (appears only after first click) */}
      {otpSent && (
        <button
          type="button"
          onClick={sendOtp}
          disabled={cooldown > 0 || loading}
          className={`px-4 py-2 rounded flex-1 ${
            cooldown > 0 || loading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-green-600 text-white"
          }`}
        >
          {cooldown > 0
            ? `Resend in ${Math.floor(cooldown / 60)}:${String(
                cooldown % 60
              ).padStart(2, "0")}`
            : "Resend OTP"}
        </button>
      )}
    </div>
  );
}
