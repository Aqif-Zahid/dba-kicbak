"use client";

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
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import { Input } from "../ui/input";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { useRequestInviteModal } from "@/hooks/use-request-invite-modal";

export const RequestInviteCodeModal = () => {
  const { isOpen, close } = useRequestInviteModal();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
      const data = {
        email: values.email.toLowerCase(),
      };
      const res = await axios.post("/api/invite", data);
      if (res.data.status === 1) {
        setSubmitted(true);
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
    <ResponsiveModal open={isOpen} onOpenChange={close} size="sm">
      {submitted ? (
        <section>
          <div className="flex flex-col items-center text-center gap-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-md">
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">
              Invitation to Kicbak.
            </h2>

            <p className="text-sm sm:text-base text-slate-600 max-w-xl">
              Your request for invitation code received successfully. We'll
              review it and get back to you soon.
            </p>

            <motion.button
              type="button"
              whileHover={{
                scale: 1.05,
                backgroundColor: "#ff135e",
                color: "#ffffff",
                boxShadow: "0px 4px 15px rgba(236, 72, 153, 0.5)",
              }}
              onClick={close}
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
            <h2 className="font-bold text-gray-700 mb-2">
              Get an Invitation to Kicbak
            </h2>
            <p className="text-muted-foreground text-sm ">
              Welcome! Enter your email to receive an invitation.
            </p>
          </div>
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

              <Button
                type="submit"
                size="lg"
                className="w-full transition-transform hover:scale-[1.02] duration-200"
                disabled={loading}
              >
                {loading ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mx-auto"></span>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </Form>
        </>
      )}
    </ResponsiveModal>
  );
};
