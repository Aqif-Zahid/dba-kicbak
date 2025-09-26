"use client";
import "react-phone-input-2/lib/style.css";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { AlertTriangle, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import PhoneInput from "react-phone-input-2";
import { Input } from "@/components/ui/input";
import { uploadImage } from "@/hooks/upload-image";
import { useRouter } from "next/navigation";
import { User } from "@/types/types";
import { toast } from "sonner";
import { DatePicker } from "@/components/date-picker";

interface ProfileMainProps {
  user: User;
}
export const ProfileMain = ({ user }: ProfileMainProps) => {
  const router = useRouter();
  const updateUserSchema = z.object({
    displayName: z
      .string()
      .min(3, "Name must be at least 3 characters long")
      .max(100, "Name must not be 100 characters long"),
    dateOfBirth: z.coerce.date(),
    email: z.string().email(),
    phoneNumber: z
      .string()
      .min(1, "Phone number is required")
      .refine((val) => /^(\+)?\d{7,15}$/.test(val), {
        message: "Please enter a valid phone number with country code",
      }),
    profilePicture: z
      .union([
        z.instanceof(File),
        z.string().transform((value) => (value === "" ? undefined : value)),
      ])
      .optional(),
  });

  type UpdateUserValues = z.infer<typeof updateUserSchema>;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<UpdateUserValues>({
    resolver: zodResolver(updateUserSchema) as Resolver<UpdateUserValues>,
    defaultValues: {
      displayName: user.displayName ?? "",
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : new Date(),
      email: user.email ?? "",
      phoneNumber: user.phoneNumber ?? undefined,
      profilePicture: user.profilePicture ?? "",
    },
  });

  const onSubmit = async (values: UpdateUserValues) => {
    try {
      setLoading(true);
      setError(null);

      let imageUrl = values.profilePicture || "";
      if (values.profilePicture instanceof File) {
        const uploaded = await uploadImage(values.profilePicture);
        imageUrl = uploaded.secure_url;
      }
      const res = await fetch(`/api/profile/update-profile?id=${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, profilePicture: imageUrl }),
      });

      const data = await res.json();
      if (data.status === 1) {
        toast.success("Profile Updated Successfully!");
        router.refresh();
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex justify-center w-full md:px-20 px-5 py-10 rounded-2xl bg-card shadow-sm">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 w-full"
        >
          {/* Grid: 2 fields per row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <FormField
              name="displayName"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Full Name <span className="text-red-900">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter full name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="dateOfBirth"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Date of Birth
                    <span className="text-red-700">*</span>{" "}
                  </FormLabel>
                  <FormControl>
                    <DatePicker {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email <span className="text-red-900">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Mobile */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Phone Number <span className="text-red-700">*</span>
                  </FormLabel>
                  <FormControl>
                    <PhoneInput
                      country="ca"
                      value={field.value ?? ""}
                      onChange={(value: string) => field.onChange(value)}
                      enableSearch
                      countryCodeEditable={false}
                      inputProps={{
                        name: "mobile",
                        required: true,
                      }}
                      inputStyle={{
                        width: "100%",
                        height: 45,
                        borderRadius: 8,
                        paddingLeft: 55,
                      }}
                      buttonStyle={{
                        borderRadius: "8px 0 0 8x",
                        border: "1px solid #d1d5db",
                        width: 50,
                      }}
                      containerStyle={{ width: "100%", height: 45 }}
                      dropdownStyle={{ zIndex: 9999 }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="profilePicture"
            render={({ field }) => {
              const [preview, setPreview] = useState<string | undefined>(
                field.value instanceof File
                  ? URL.createObjectURL(field.value)
                  : field.value
              );

              // Cleanup object URL
              useEffect(() => {
                if (field.value instanceof File) {
                  const objectUrl = URL.createObjectURL(field.value);
                  setPreview(objectUrl);
                  return () => URL.revokeObjectURL(objectUrl);
                } else {
                  setPreview(field.value ?? "");
                }
              }, [field.value]);

              const handleFileChange = (
                e: React.ChangeEvent<HTMLInputElement>
              ) => {
                if (e.target.files?.[0]) {
                  field.onChange(e.target.files[0]);
                }
              };

              return (
                <FormItem>
                  <FormLabel>Profile Picture</FormLabel>
                  <div className="flex items-center gap-4">
                    {preview ? (
                      <div className="relative w-20 h-20 rounded overflow-hidden">
                        <Image
                          src={preview}
                          alt="Profile"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <Avatar className="w-20 h-20">
                        <AvatarFallback>
                          <ImageIcon className="w-8 h-8 text-neutral-400" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex flex-col">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.svg"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <Button
                        type="button"
                        onClick={() =>
                          document
                            .querySelector<HTMLInputElement>(
                              'input[type="file"]'
                            )
                            ?.click()
                        }
                        className="mb-2"
                      >
                        Change
                      </Button>
                      {preview && (
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => field.onChange(null)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {/* Error & Submit */}
          {error && (
            <div className="flex items-center text-red-600 text-sm gap-2">
              <AlertTriangle size={16} /> {error}
            </div>
          )}
          <div className="flex items-center justify-center">
            {" "}
            <Button type="submit" disabled={loading} className="py-5 px-10">
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
