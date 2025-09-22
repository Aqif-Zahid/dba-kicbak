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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { Input } from "../ui/input";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { useSignupModal } from "@/hooks/use-signup-modal";

export const SigninModal = () => {
  const { isOpen, close } = useSigninModal();
  const { open: openSignup } = useSignupModal();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showForgetPassword, setShowForgetPassword] = useState<boolean>(false);
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
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setError(null);
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        setError(getErrorMessage(error.response.data));
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  const handleSignup = () => {
    openSignup();
    close();
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={close} size={"sm"}>
      <div className="text-center mb-4">
        <h2 className="font-bold text-gray-700 text-lg mb-1">
          Sign in to Kicbak{" "}
        </h2>
        <p className="text-muted-foreground text-sm">
          Welcome back! Please sign in to continue
        </p>
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
                  <span className="text-red-900">*</span>{" "}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Enter email address  or username"
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
            <Checkbox label={"Remember me"} defaultChecked />
            <Button
              type="button"
              variant="ghost"
              className="text-sm text-gray-500 font-normal"
              onClick={() => setShowForgetPassword(true)}
            >
              Forgot password?
            </Button>
          </div>

          {error && (
            <div className="flex items-center">
              <AlertTriangle className="size-5 text-red-700 mr-2" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full "
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
        Don't have an account?
        <button
          className="text-primary hover:underline ms-1"
          onClick={handleSignup}
        >
          Sign up
        </button>
      </div>
    </ResponsiveModal>
  );
};
