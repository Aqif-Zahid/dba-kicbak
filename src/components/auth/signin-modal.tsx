"use client";

import { useSigninModal } from "@/hooks/use-signin-modal";
import ResponsiveModal from "../modals/responsive-modal";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { getErrorMessage } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { Input } from "../ui/input";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { signIn, useSession } from "next-auth/react";
import { useRequestInviteModal } from "@/hooks/use-request-invite-modal";
import axios from "axios";

export const SigninModal = () => {
  const { isOpen, close } = useSigninModal();
  const { open: openInviteCodeModal } = useRequestInviteModal();
  const { data: session } = useSession();

  // STEP state for sign in and password reset flow
  const [authStep, setAuthStep] = useState<
    "signin" | "resetEmail" | "resetOtp" | "resetPassword" | "resetSuccess"
  >("signin");

  // Signin state
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset Password states
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [emailError, setEmailError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Zod validation for sign in
  const loginSchema = z.object({
    email: z.string().min(4, "Invalid user name"),
    password: z
      .string()
      .min(1, "Password is required")
      .max(256, "Password must be at best 256 characters"),
  });

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (session && isOpen) {
      close();
    }
  }, [session, close]);

  // ✅ Sign In Submit
  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setLoading(true);
      setError(null);
      const res = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (res?.error) {
        setError("Invalid credentials");
      } else {
        window.location.reload();
        close();
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        setError(getErrorMessage(error.response.data));
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInviteCode = () => {
    openInviteCodeModal();
    close();
  };

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: "/profile" });
  };

  // ✅ Forgot Password → Switch step
  const handleForgotPassword = () => {
    setAuthStep("resetEmail");
  };

  // --- Password Reset Functions ---
  const handleSendOtp = async () => {
    setEmailError(null);
    if (!resetEmail.trim()) {
      setEmailError("Email is required");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        "/api/auth/reset-password/request-otp",
        { email: resetEmail },
        { validateStatus: (status) => (status >= 200 && status < 300) || status === 404 }
      );

      if (res.status === 404) {
        setEmailError(res.data?.message || "No account found with this email address.");
        return;
      }

      if (res.data.status === 1) {
        setAuthStep("resetOtp");
      } else {
        setEmailError(res.data.message || "Failed to send OTP");
      }
    } catch {
      setEmailError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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
        { email: resetEmail, otp },
        { validateStatus: (status) => (status >= 200 && status < 300) || status === 400 }
      );

      if (res.status === 400) {
        setOtpError(res.data?.message || "Incorrect OTP");
        return;
      }

      if (res.data.status === 1) {
        setAuthStep("resetPassword");
      } else {
        setOtpError(res.data.message || "Invalid OTP");
      }
    } catch {
      setOtpError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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
        { email: resetEmail, otp, newPassword, confirmPassword },
        { validateStatus: (status) => (status >= 200 && status < 300) || status === 400 }
      );

      if (res.data.status === 1) {
        // ✅ show success screen
        setResetEmail("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordErrors([]);
        setAuthStep("resetSuccess");
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

  const handleBackToLogin = () => {
    setAuthStep("signin");
    setResetEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordErrors([]);
    setEmailError(null);
    setOtpError(null);
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={close} size="md">
      {/* STEP 1 — SIGN IN */}
      {authStep === "signin" && (
        <>
          <div className="text-center mb-0">
            <h2 className="font-bold text-gray-700 text-lg mb-1">
              Sign in to Kicbak
            </h2>
            <p className="text-muted-foreground text-sm">
              Welcome back! Please sign in to continue
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleGoogleLogin}
              size="sm"
              variant="outline"
              className="w-15 flex justify-center items-center py-4"
            >
              <img
                src="https://img.clerk.com/static/google.svg?width=160"
                alt="Google Logo"
                className="h-5 w-5"
              />
              <span className="sr-only">Sign in with Google</span>
            </Button>
          </div>

          <div className="flex items-center mb-2">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-2 text-gray-400 text-sm">or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-2">
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email address or username{" "}
                      <span className="text-red-900">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter email address or username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Password <span className="text-red-700">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between items-center mb-6">
                <Checkbox label="Remember me" defaultChecked />
                <Button
                  type="button"
                  variant="ghost"
                  className="text-sm text-gray-500 font-normal"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </Button>
              </div>

              {error && (
                <div className="flex items-center">
                  <AlertTriangle className="text-red-700 mr-2" />
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          </Form>

          <div className="text-sm text-muted-foreground mt-4 text-center">
            Don't have an account?
            <button
              className="text-primary hover:underline ms-1"
              onClick={handleInviteCode}
            >
              Request an invite
            </button>
          </div>
        </>
      )}

      {/* STEP 2 — RESET EMAIL */}
      {authStep === "resetEmail" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-center">Forgot Password</h2>
          <p className="text-sm text-muted-foreground text-center">
            Enter your email to receive a one-time code
          </p>
          <Input
            type="email"
            placeholder="you@example.com"
            value={resetEmail}
            onChange={(e) => {
              setResetEmail(e.target.value);
              if (emailError) setEmailError(null);
            }}
          />
          {emailError && <p className="text-xs text-red-600 mt-1">{emailError}</p>}
          <div className="flex gap-2">
            <Button variant="outline" className="w-1/2" onClick={handleBackToLogin}>
              Back
            </Button>
            <Button onClick={handleSendOtp} disabled={loading} className="w-1/2">
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3 — OTP */}
      {authStep === "resetOtp" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-center">Enter OTP</h2>
          <p className="text-sm text-muted-foreground text-center">
            We sent a 6-digit code to <strong>{resetEmail}</strong>
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
          <div className="flex gap-2">
            <Button variant="outline" className="w-1/2" onClick={() => setAuthStep("resetEmail")}>
              Back
            </Button>
            <Button onClick={handleVerifyOtp} disabled={loading} className="w-1/2">
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4 — RESET PASSWORD */}
      {authStep === "resetPassword" && (
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

          <div className="flex gap-2">
            <Button variant="outline" className="w-1/2" onClick={() => setAuthStep("resetOtp")}>
              Back
            </Button>
            <Button onClick={handleResetPassword} disabled={loading} className="w-1/2">
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 5 — SUCCESS MESSAGE */}
      {authStep === "resetSuccess" && (
        <div className="space-y-4 text-center">
          <h2 className="text-lg font-semibold text-green-600">
            Password Changed Successfully
          </h2>
          <p className="text-sm text-muted-foreground">
            You can now log in with your new password.
          </p>
          <Button onClick={handleBackToLogin} className="w-full">
            Back to Login
          </Button>
        </div>
      )}
    </ResponsiveModal>
  );
};
