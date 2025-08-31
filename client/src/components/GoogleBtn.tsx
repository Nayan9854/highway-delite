import React, { useEffect } from "react";
import { api } from "../api";

declare global {
  interface Window {
    google: any;
  }
}

export default function GoogleBtn() {
  async function handleCredentialResponse(res: any) {
    try {
      const { data } = await api.post("/api/auth/google", { idToken: res.credential });
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/dashboard";
    } catch (e: any) {
      alert(e.response?.data?.message || "Google login failed");
    }
  }

  useEffect(() => {
    const clientId = '700592042109-aov90v65qsvfdn21vv0lvdg57c0rfti9.apps.googleusercontent.com'
    if (!clientId) {
      console.error("Missing Google Client ID (VITE_GOOGLE_CLIENT_ID)");
      return;
    }

    window.google?.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
    });

    window.google?.accounts.id.renderButton(
      document.getElementById("google-btn"),
      { theme: "outline", size: "large", width: 320 }
    );
  }, []);

  return <div id="google-btn" className="w-full flex justify-center" />;
}
