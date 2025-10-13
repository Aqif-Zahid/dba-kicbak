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

export const SigninModal = () => {
  const { isOpen, close } = useSigninModal();
  const { open: openInviteCodeModal } = useRequestInviteModal();
  const { data: session } = useSession();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  // 🔹 Close modal if session becomes available (e.g. Google login)
  useEffect(() => {
    if (session && isOpen) {
      close();
    }
  }, [session, close]);

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

  return (
    <ResponsiveModal open={isOpen} onOpenChange={close} size="md">
      <div className="text-center mb-0">
        <h2 className="font-bold text-gray-700 text-lg mb-1">
          Sign in to Kicbak
        </h2>
        <p className="text-muted-foreground text-sm">
          Welcome back! Please sign in to continue
        </p>
      </div>

      {/* --- Google Login Button --- */}
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

      {/* --- Email/Password Form --- */}
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
              onClick={() => {}}
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
    </ResponsiveModal>
  );
};
