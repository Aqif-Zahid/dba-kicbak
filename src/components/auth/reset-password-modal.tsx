"use client";

import { useState } from "react";
import ResponsiveModal from "@/components/modals/responsive-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useResetPasswordModal } from "@/hooks/use-reset-password-modal";
import axios from "axios";

export default function ResetPasswordModal() {
  const { isOpen, close } = useResetPasswordModal();

  const [step, setStep] = useState<"email" | "otp" | "reset" | "success">(
    "email"
  );
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Password visibility
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Inline error states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // STEP 1 — Request OTP
  const handleSendOtp = async () => {
    setEmailError(null);
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        "/api/auth/reset-password/request-otp",
        { email },
        {
          validateStatus: (status) =>
            (status >= 200 && status < 300) || status === 404,
        }
      );

      if (res.status === 404) {
        setEmailError(
          res.data?.message || "No account found with this email address."
        );
        return;
      }

      if (res.data.status === 1) {
        setStep("otp");
      } else {
        setEmailError(res.data.message || "Failed to send OTP");
      }
    } catch (err: any) {
      setEmailError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 — Verify OTP
  const handleVerifyOtp = async () => {
    setOtpError(null);
    if (!otp.trim()) {
      setOtpError("OTP is required");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        "/api/auth/reset-password/verify-otp",
        { email, otp },
        {
          validateStatus: (status) =>
            (status >= 200 && status < 300) || status === 400,
        }
      );

      if (res.status === 400) {
        setOtpError(res.data?.message || "Incorrect OTP");
        return;
      }

      if (res.data.status === 1) {
        setStep("reset");
      } else {
        setOtpError(res.data.message || "Invalid OTP");
      }
    } catch (err: any) {
      setOtpError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // STEP 3 — Reset Password
  const handleResetPassword = async () => {
    setPasswordErrors([]);

    if (newPassword !== confirmPassword) {
      setPasswordErrors(["Passwords do not match"]);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "/api/auth/reset-password",
        {
          email,
          otp,
          newPassword,
          confirmPassword,
        },
        {
          validateStatus: (status) =>
            (status >= 200 && status < 300) || status === 400,
        }
      );

      if (res.data.status === 1) {
        // ✅ Show success message directly in modal
        setEmail("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordErrors([]);
        setStep("success");
      } else if (res.data.errors) {
        setPasswordErrors(res.data.errors);
      } else {
        setPasswordErrors([res.data.message || "Failed to reset password"]);
      }
    } catch (err: any) {
      const serverErrors = err?.response?.data?.errors;
      if (serverErrors && Array.isArray(serverErrors)) {
        setPasswordErrors(serverErrors);
      } else {
        setPasswordErrors([
          err?.response?.data?.message || "Reset failed. Please try again.",
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={close} size="sm">
      {/* STEP 1 — EMAIL */}
      {step === "email" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-center">Forgot Password</h2>
          <p className="text-sm text-muted-foreground text-center">
            Enter your email to receive a one-time code
          </p>
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(null);
            }}
          />
          {emailError && (
            <p className="text-xs text-red-600 mt-1">{emailError}</p>
          )}
          <Button onClick={handleSendOtp} disabled={loading} className="w-full">
            {loading ? "Sending..." : "Send OTP"}
          </Button>
        </div>
      )}

      {/* STEP 2 — OTP */}
      {step === "otp" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-center">Enter OTP</h2>
          <p className="text-sm text-muted-foreground text-center">
            We sent a 6-digit code to <strong>{email}</strong>
          </p>
          <Input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => {
              const raw = e.target.value;
              const cleaned = raw.replace(/\D/g, "");
              const limited = cleaned.slice(0, 6);
              setOtp(limited);
              if (otpError) setOtpError(null);
            }}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
          />
          {otpError && <p className="text-xs text-red-600 mt-1">{otpError}</p>}
          <Button
            onClick={handleVerifyOtp}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>
        </div>
      )}

      {/* STEP 3 — RESET PASSWORD */}
      {step === "reset" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-center">Reset Password</h2>

          {/* New Password */}
          <div className="relative">
            <Input
              type={showNewPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Inline password errors */}
          {passwordErrors.length > 0 && (
            <ul className="mt-2 text-xs text-red-600 space-y-1">
              {passwordErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          )}

          <Button
            onClick={handleResetPassword}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </div>
      )}

      {/* STEP 4 — SUCCESS MESSAGE */}
      {step === "success" && (
        <div className="space-y-4 text-center">
          <h2 className="text-lg font-semibold text-green-600">
            Password Changed Successfully
          </h2>
          <p className="text-sm text-muted-foreground">
            You can now log in with your new password.
          </p>
          <Button
            onClick={() => {
              setStep("email");
              close();
            }}
            className="w-full"
          >
            Close
          </Button>
        </div>
      )}
    </ResponsiveModal>
  );
}
