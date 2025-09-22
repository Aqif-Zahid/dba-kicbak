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
import { AxiosError } from "axios";
import { Input } from "../ui/input";
import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";

interface RequestInviteCodeModalProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

export const RequestInviteCodeModal = ({
  show,
  setShow,
}: RequestInviteCodeModalProps) => {
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

      // TODO: API request to submit the email goes here
      await new Promise((res) => setTimeout(res, 1000)); // simulate API delay

      setShow(false);
      form.reset();
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
    <ResponsiveModal open={show} onOpenChange={() => setShow(false)} size="sm">
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
              "Continue"
            )}
          </Button>
        </form>
      </Form>
    </ResponsiveModal>
  );
};
