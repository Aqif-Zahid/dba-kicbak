"use client";

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
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import { getErrorMessage } from "@/lib/utils";
import { Input } from "../ui/input";
import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";

type AuthStep = "signin" | "resetEmail" | "resetOtp" | "resetPassword";

interface RequestOtpFormProps {
  setAuthStep: (step: AuthStep) => void;
  setResetEmail: (step: string) => void;
}

export const RequestOtpForm = ({
  setAuthStep,
  setResetEmail,
}: RequestOtpFormProps) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inviteCodeSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
  });

  const form = useForm<z.infer<typeof inviteCodeSchema>>({
    resolver: zodResolver(inviteCodeSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof inviteCodeSchema>) => {
    try {
      setLoading(true);
      setError(null);
      const email = values.email.toLowerCase();
      const data = {
        email,
      };
      const res = await axios.post(
        "/api/auth/reset-password/request-otp",
        data
      );
      if (res.data.status === 1) {
        setAuthStep("resetOtp");
        setResetEmail(email);
        form.reset();
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
      <h2 className="text-lg font-semibold text-center">Forgot Password</h2>
      <p className="text-sm text-muted-foreground text-center">
        Enter your email to receive a one-time code
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 px-2 md:px-6"
        >
          <FormField
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Email Address <span className="text-red-600">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="you@example.com"
                    className="focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <div className="flex items-center bg-red-50 p-2 rounded-md">
              <AlertTriangle className="h-5 w-5 text-red-700 mr-2" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="w-1/2 h-12"
              onClick={() => setAuthStep("signin")}
            >
              Back
            </Button>

            <Button
              type="submit"
              size="lg"
              className="w-1/2 transition-transform hover:scale-[1.02] duration-200"
              disabled={loading}
            >
              {loading ? (
                <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mx-auto"></span>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
