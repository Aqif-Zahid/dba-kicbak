"use client";

import { motion } from "framer-motion";
import { UseFormReturn, FieldValues, Path } from "react-hook-form";
import { useEffect, useState } from "react";
import Image from "next/image";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { ImageIcon } from "lucide-react";
import { Button } from "../ui/button";

type FinalStepProps<FormValues extends FieldValues & { icon?: any }> = {
  form: UseFormReturn<FormValues>;
};

// Type guard for File
const isFile = (value: unknown): value is File => value instanceof File;

export const FinalStep = <FormValues extends FieldValues & { icon?: any }>({
  form,
}: FinalStepProps<FormValues>) => {
  return (
    <motion.div
      key="step-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="grid gap-6"
    >
      <div>
        <p className="text-3xl font-extrabold mb-2">Style your community</p>
        <p className="mb-4 text-sm text-muted-foreground">
          Adding visual flair will catch new members attention and help
          establish your community’s culture! You can update this at any time.
        </p>
      </div>

      <FormField
        control={form.control}
        name={"icon" as Path<FormValues>}
        render={({ field }) => {
          const [preview, setPreview] = useState<string | undefined>(
            isFile(field.value) ? URL.createObjectURL(field.value) : field.value
          );

          useEffect(() => {
            if (isFile(field.value)) {
              const objectUrl = URL.createObjectURL(field.value);
              setPreview(objectUrl);
              return () => URL.revokeObjectURL(objectUrl);
            } else {
              setPreview(field.value ?? "");
            }
          }, [field.value]);

          const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files?.[0]) {
              field.onChange(e.target.files[0]);
            }
          };

          return (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <div className="flex items-center gap-4">
                {preview ? (
                  <div className="relative w-20 h-20 rounded overflow-hidden">
                    <Image
                      src={preview}
                      alt="Icon"
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
                        .querySelector<HTMLInputElement>('input[type="file"]')
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
    </motion.div>
  );
};
