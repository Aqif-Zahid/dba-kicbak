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
import { useRouter } from "next/navigation";
interface SignupModalProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  username?: string;
  referralCode: string;
  email: string;
}

export const SignupModal = ({
  show,
  setShow,
  username,
  referralCode,
  email,
}: SignupModalProps) => {
  const router = useRouter();
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
      email: email,
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
        referralCode: referralCode,
        email: email,
      };
      const res = await axios.post("/api/signup", data);
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

  const handleContinue = () => {
    router.push("/");
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
        <section className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-10 bg-gradient-to-br   mx-auto">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-200 to-emerald-100 shadow-lg mb-6">
            <CheckCircle className="w-14 h-14 text-emerald-600 animate-bounce" />
          </div>

          {/* Headline */}
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Registration Complete!
          </h2>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-gray-700 mb-1">
            Thank you for joining{" "}
            <span className="font-semibold text-primary">Kicbak</span>.
          </p>
          <p className="text-sm sm:text-base text-gray-500 mb-6">
            Your registration has been successfully completed.
          </p>

          {/* Continue Button */}
          <motion.button
            type="button"
            whileHover={{
              scale: 1.05,
              backgroundColor: "#ff135e", // emerald
              color: "#ffffff",
              boxShadow: "0px 6px 20px rgba(16, 185, 129, 0.4)",
            }}
            onClick={handleContinue}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white border border-primary text-primary font-semibold px-12 py-3 rounded-xl shadow-md transition-colors duration-300"
          >
            Continue
          </motion.button>

          {/* Support Link */}
          <p className="mt-4 text-sm text-gray-400">
            Need help?{" "}
            <a
              href="#"
              className="underline hover:text-primary transition-colors"
            >
              Contact support
            </a>
          </p>
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
                        disabled
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
