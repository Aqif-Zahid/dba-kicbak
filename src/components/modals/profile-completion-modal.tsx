"use client";
import ResponsiveModal from "./responsive-modal";
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
import { Input } from "../ui/input";
import { AlertTriangle, UserCheck } from "lucide-react";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/utils"; // Assuming this utility exists

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void; // Provided by page.tsx, prevents closing if PENDING
}

// Zod schema for profile details
const profileSchema = z.object({
  firstName: z.string().min(2, "Required: First name must be at least 2 characters"),
  lastName: z.string().min(2, "Required: Last name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
});

export const ProfileCompletionModal = ({
  isOpen,
  onClose,
}: ProfileCompletionModalProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!session?.user.id) {
        setError("User session is missing. Please sign in again.");
        // Force log out to re-authenticate
        await signOut({ redirect: false });
        router.push("/auth/signin");
        return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call the new API route to create the profile and activate the user
      const response = await axios.post("/api/profile/complete", values);

      if (response.data.status === 1) {
        // Success: Profile created and user status set to ACTIVE
        
        // Force session refresh to update the user's status in the client
        // NextAuth will read the updated status from the DB on the refresh
        router.refresh(); 

        onClose(); // This should now pass the check in page.tsx and close
      } else {
        // Handle API error messages (e.g., username taken)
        setError(response.data.message || "An unknown error occurred.");
      }
    } catch (err) {
      // Check if it's an Axios error and extract the message, or use a default fallback.
      let errorMessage = "Failed to complete profile. Please try again.";
      
      if (axios.isAxiosError(err)) {
        // Attempt to use the utility function, passing only the error object.
        // Assuming getErrorMessage can handle AxiosError and extract API messages.
        const utilityMessage = getErrorMessage(err);
        errorMessage = utilityMessage || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isPending = session?.user.status === 'PENDING';

  return (
    <ResponsiveModal
      isOpen={isOpen && isPending} // Only show if PENDING
      onClose={onClose} // Passed from page.tsx, only closes if status is ACTIVE
      className="md:max-w-md"
    >
      {/* Title and Description moved into the children of ResponsiveModal to resolve the type error */}
      <h2 className="text-2xl font-bold mb-2">
        Complete Your Profile
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        You are currently waitlisted or signed in via a third-party and need to create your public profile to activate your account.
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="John" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Doe" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="YourUniqueHandle_1" />
                </FormControl>
                  <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center bg-red-50 p-3 rounded-lg border border-red-200"
            >
              <AlertTriangle className="h-5 w-5 text-red-700 mr-2 flex-shrink-0" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </motion.div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full transition-transform hover:scale-[1.005] duration-200 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
            ) : (
              <>
                <UserCheck className="w-5 h-5" />
                Activate My Account
              </>
            )}
          </Button>
        </form>
      </Form>
    </ResponsiveModal>
  );
};
