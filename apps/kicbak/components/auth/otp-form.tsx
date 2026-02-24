"use client";

import { useState, useRef } from "react";
import { Button } from "../ui/button";
import axios, { AxiosError } from "axios";
import { getErrorMessage } from "@/lib/utils";

type AuthStep = "signin" | "resetEmail" | "resetOtp" | "resetPassword";

interface OtpFormProps {
  setAuthStep: (step: AuthStep) => void;
  resetEmail: string;
}

export const OtpForm = ({ setAuthStep, resetEmail }: OtpFormProps) => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return; // only allow single digit
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
    if (error) setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!paste) return;

    const newOtp = Array(6)
      .fill("")
      .map((_, i) => paste[i] || "");
    setOtp(newOtp);

    // focus the last filled input or last box
    const lastFilledIndex = paste.length >= 6 ? 5 : paste.length;
    inputsRef.current[lastFilledIndex]?.focus();
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    setError(null);
    if (otpValue.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post("/api/auth/reset-password/verify-otp", {
        email: resetEmail,
        otp: otpValue,
      });
      if (res.data.status === 1) {
        setAuthStep("resetPassword");
      } else {
        setError(res.data.message);
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        setError(getErrorMessage(error.response.data));
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-center">Enter OTP</h2>
      <p className="text-sm text-muted-foreground text-center">
        We sent a 6-digit code to <strong>{resetEmail}</strong>
      </p>

      <div className="flex justify-center gap-2">
        {otp.map((digit, i) => (
          <input
            key={i}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            className="w-12 h-12 text-center border rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={digit}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            onChange={(e) => handleChange(e.target.value, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={handlePaste}
          />
        ))}
      </div>

      {error && <p className="text-xs text-red-600 text-center">{error}</p>}

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="w-1/2 h-12"
          onClick={() => setAuthStep("resetEmail")}
        >
          Back
        </Button>

        <Button
          type="button"
          size="lg"
          className="w-1/2 transition-transform hover:scale-[1.02] duration-200"
          disabled={loading}
          onClick={handleVerifyOtp}
        >
          {loading ? (
            <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mx-auto"></span>
          ) : (
            "Verify OTP"
          )}
        </Button>
      </div>
    </div>
  );
};
