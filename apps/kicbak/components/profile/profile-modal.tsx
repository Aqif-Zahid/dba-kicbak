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
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { Input } from "../ui/input";
import { AlertTriangle, ImageIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { profileSchema } from "@/schemas/schemas";
import { toast } from "sonner";
import { useManageProfile } from "@/services/profiles/use-manage-profile";
import Image from "next/image";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { uploadImage } from "@/hooks/upload-image";
import { useRouter } from "next/navigation";

interface ProfileModalProps {
  isOpen: boolean;
  close: () => void;
  data?: {
    id: number;
    username: string;
    displayName: string;
    bio?: string | null;
    profilePicture?: string | null;
  };
  from?: string;
}

export const ProfileModal = ({
  isOpen,
  close,
  data,
  from,
}: ProfileModalProps) => {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const { mutateAsync, isPending } = useManageProfile();
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: data?.username || "",
      displayName: data?.displayName || "",
      bio: data?.bio || "",
      profilePicture: data?.profilePicture ?? "",
    },
  });

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    try {
      setError(null);
      let imageUrl = values.profilePicture || "";
      if (values.profilePicture instanceof File) {
        setUploading(true);
        const uploaded = await uploadImage(values.profilePicture);
        imageUrl = uploaded.secure_url;
        setUploading(false);
      }
      const finalValues = data
        ? {
            ...values,
            id: data.id,
            username: values.username.trim().toLowerCase(),
            profilePicture: imageUrl,
          }
        : {
            ...values,
            username: values.username.trim().toLowerCase(),
            profilePicture: imageUrl,
          };
      const res = await mutateAsync(finalValues);
      if (res.status === 1) {
        toast.success("Profile created successfully.");
        if (from === "username") {
          router.refresh();
        }
        close();
      } else {
        setError(res.message);
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        setError(getErrorMessage(error.response.data));
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={close} size="md">
      <div className="text-center mb-0">
        <h2 className="font-bold text-gray-700 text-lg mb-1">
          {data ? "Update Your Profile" : " Create New Profile at Kicbak"}
        </h2>
      </div>

      {/* --- Email/Password Form --- */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-2">
          <FormField
            name="username"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Username <span className="text-red-900">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} type="text" placeholder="Enter username" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="displayName"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Display Name <span className="text-red-900">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Enter display name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="bio"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Enter bio" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          {error && (
            <div className="flex items-center">
              <AlertTriangle className="text-red-700 mr-2" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isPending || uploading}
          >
            {isPending || uploading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
            ) : (
              "Create"
            )}
          </Button>
        </form>
      </Form>
    </ResponsiveModal>
  );
};
