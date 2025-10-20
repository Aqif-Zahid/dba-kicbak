"use client";
import { useSigninModal } from "@/hooks/use-signin-modal";
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
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import { Input } from "../ui/input";
import { AlertTriangle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
interface CompleteProfileMainProps {
  userData: {
    id: string;
    displayName: string;
    email: string;
  };
}

export const CompleteProfileMain = ({ userData }: CompleteProfileMainProps) => {
  const { open: openSignin } = useSigninModal();
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
    referralCode: z
      .string()
      .min(4, "Referral Code must be at least 4 characters"),
  });

  const form = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: userData.displayName.split("_")[0],
      lastName: userData.displayName.split("_")[1],
      email: userData.email,
      usernameDesired: "",
      referralCode: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof registrationSchema>) => {
    try {
      setError(null);
      setLoading(true);
      const data = {
        ...values,
        email: userData.email,
      };
      const res = await axios.post("/api/auth/complete-profile", data);
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

  return (
    <div className="bg-white shadow-md p-4 md:px-10 rounded-2xl">
      {submitted ? (
        <section className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-10 bg-gradient-to-br   mx-auto">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-200 to-emerald-100 shadow-lg mb-6">
            <CheckCircle className="w-14 h-14 text-emerald-600 animate-bounce" />
          </div>

          {/* Headline */}
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Your profile has been completed!
          </h2>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-gray-700 mb-1">
            Thank you for joining{" "}
            <span className="font-semibold text-primary">Kicbak</span>.
          </p>
          <p className="text-sm sm:text-base text-gray-500 mb-6">
            Your profile has been successfully completed.
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
            onClick={openSignin}
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
              Complete Your Profile
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
              <div className="grid md:grid-cols-2 gap-6">
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
                        <Input {...field} placeholder="Enter username" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="referralCode"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Referral Code <span className="text-red-900">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter Referral Code" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {error && (
                <div className="flex items-center">
                  <AlertTriangle className="size-5 text-red-700 mr-2" />
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="grid md:grid-cols-12">
                <div className="col-start-4 col-span-6">
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
                </div>
              </div>
            </form>
          </Form>
        </>
      )}
    </div>
  );
};
