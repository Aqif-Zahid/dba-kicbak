"use client";

import { motion } from "framer-motion";
import { UseFormReturn, FieldValues, Path } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

type ThirdStepProps<
  FormValues extends FieldValues & {
    name: string;
    slug: string;
    description: string;
  }
> = {
  form: UseFormReturn<FormValues>;
};

export const ThirdStep = <
  FormValues extends FieldValues & {
    name: string;
    slug: string;
    description: string;
  }
>({
  form,
}: ThirdStepProps<FormValues>) => {
  // Auto-generate slug from name
  const handleNameChange = (value: string, onChange: (v: any) => void) => {
    onChange(value);

    const slug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    form.setValue("slug" as Path<FormValues>, slug as any, {
      shouldValidate: true,
    });
  };

  return (
    <motion.div
      key="step-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="grid gap-6"
    >
      <div>
        <p className="text-3xl font-extrabold mb-2">
          Tell us about your community
        </p>
        <p className="mb-4 text-sm text-muted-foreground">
          A name and description help people understand what your community is
          all about.
        </p>
      </div>

      {/* NAME & SLUG */}
      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          name={"name" as Path<FormValues>}
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Name<span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Community Name"
                  value={field.value || ""}
                  onChange={(e) =>
                    handleNameChange(e.target.value, field.onChange)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name={"slug" as Path<FormValues>}
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug (Auto-generated)</FormLabel>
              <FormControl>
                <Input disabled placeholder="Slug" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* DESCRIPTION */}
      <FormField
        name={"description" as Path<FormValues>}
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Description<span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Write a short description..."
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </motion.div>
  );
};
