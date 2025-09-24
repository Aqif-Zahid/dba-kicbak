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
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import { Input } from "../ui/input";
import { AlertTriangle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
interface SignupModalProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  username?: string;
}

export const SignupModal = ({ show, setShow, username }: SignupModalProps) => {
  const close = () => {
    setShow(false);
  };

  const { open: openSignin } = useSigninModal();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const registrationSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    usernameDesired: z
      .string()
      .min(4, "Username must be at least 4 characters"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(256, "Password must be at most 256 characters")
      .regex(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
        "Password must include uppercase, lowercase, number, and special character"
      ),
  });

  const form = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      usernameDesired: username ?? "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof registrationSchema>) => {
    try {
      setError(null);
      setLoading(true);
      const data = {
        ...values,
        usernameDesired: username || values.usernameDesired,
      };
      const res = await axios.post("api/signup", data);
      if (res.data.status === 1) {
        setSubmitted(true);
      } else {
        setError(res.data.message);
      }
      setLoading(false);
    } catch (error: unknown) {
      setLoading(false);
      if (error instanceof AxiosError && error.response) {
        setError(getErrorMessage(error.response.data));
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  const handleSignin = () => {
    openSignin();
    close();
  };

  // Password strength logic
  const passwordValue = form.watch("password");
  const passwordStrength = useMemo(() => {
    let score = 0;
    if (!passwordValue) return { label: "", color: "bg-gray-200", score };

    if (passwordValue.length >= 8) score++;
    if (/[A-Z]/.test(passwordValue)) score++;
    if (/[a-z]/.test(passwordValue)) score++;
    if (/\d/.test(passwordValue)) score++;
    if (/[!@#$%^&*]/.test(passwordValue)) score++;

    if (score <= 2) return { label: "Weak", color: "bg-red-500", score };
    if (score === 3) return { label: "Medium", color: "bg-yellow-500", score };
    if (score === 4) return { label: "Strong", color: "bg-blue-500", score };
    return { label: "Very Strong", color: "bg-green-500", score: 5 };
  }, [passwordValue]);

  return (
    <ResponsiveModal open={show} onOpenChange={close} fullScreen={true}>
      {submitted ? (
        <section className="border border-slate-100">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-md">
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">
              Registration to Kicbak.
            </h2>

            <p className="text-sm sm:text-base text-slate-600 max-w-xl">
              Your request for registration received successfully. We'll review
              it and get back to you soon.
            </p>

            <motion.button
              type="button"
              whileHover={{
                scale: 1.05,
                backgroundColor: "#ff135e",
                color: "#ffffff",
                boxShadow: "0px 4px 15px rgba(236, 72, 153, 0.5)",
              }}
              onClick={() => setShow(false)}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-primary cursor-pointer transition-colors duration-300 border border-primary px-10 py-2 rounded-xl"
            >
              Continue
            </motion.button>

            <p className="mt-3 text-xs text-slate-400">
              Need help?{" "}
              <a href="#" className="underline">
                Contact support
              </a>
            </p>
          </div>
        </section>
      ) : (
        <>
          <div className="text-center mb-4">
            <h2 className="font-bold text-gray-700 text-lg mb-1">
              Create your account
            </h2>
            <p className="text-muted-foreground text-sm">
              Welcome! Please fill in the details to get started.
            </p>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-2"
            >
              {/* First Name & Last Name */}
              <div className="flex gap-4">
                <FormField
                  name="firstName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>
                        First Name <span className="text-red-700">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="First Name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="lastName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>
                        Last Name <span className="text-red-700">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Last Name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email address <span className="text-red-900">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter email address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="usernameDesired"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Username <span className="text-red-900">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={username ? true : false}
                        {...field}
                        placeholder="Enter username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
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
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />

                    {/* Password Strength */}
                    {passwordValue && (
                      <div className="mt-1">
                        <div className="w-full h-2 rounded bg-gray-200">
                          <div
                            className={`${passwordStrength.color} h-2 rounded`}
                            style={{
                              width: `${(passwordStrength.score / 5) * 100}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs mt-1 text-gray-700">
                          Strength: {passwordStrength.label}
                        </p>
                      </div>
                    )}
                  </FormItem>
                )}
              />

              {error && (
                <div className="flex items-center">
                  <AlertTriangle className="size-5 text-red-700 mr-2" />
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          </Form>

          <div className="text-sm text-muted-foreground mt-4 text-center">
            Already have an account?
            <button
              className="text-primary hover:underline ms-1"
              onClick={handleSignin}
            >
              Sign in
            </button>
          </div>
        </>
      )}
    </ResponsiveModal>
  );
};
