"use client";

import { motion } from "framer-motion";
import { UseFormReturn, FieldValues, Path } from "react-hook-form";
import { Globe, Lock, Shield } from "lucide-react";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { cn } from "@/lib/utils";

// Updated type to accept Lucide icons
type CommunityTypeOption = {
  value: string;
  icon: React.ForwardRefExoticComponent<
    React.SVGProps<SVGSVGElement> & React.RefAttributes<SVGSVGElement>
  >;
  label: string;
  description: string;
};

// Make generic and require `type` field
type SecondStepProps<FormValues extends FieldValues & { type: string }> = {
  form: UseFormReturn<FormValues>;
};

export const SecondStep = <FormValues extends FieldValues & { type: string }>({
  form,
}: SecondStepProps<FormValues>) => {
  const types: CommunityTypeOption[] = [
    {
      value: "PUBLIC",
      icon: Globe,
      label: "Public",
      description: "Anyone can view, post, and comment to this community",
    },
    {
      value: "RESTRICTED",
      icon: Lock,
      label: "Restricted",
      description: "Anyone can view, but only approved users can contribute",
    },
    {
      value: "PRIVATE",
      icon: Shield,
      label: "Private",
      description: "Only approved users can view and contribute",
    },
  ];

  return (
    <motion.div
      key="step-2"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="grid gap-6"
    >
      <FormField
        control={form.control}
        name={"type" as Path<FormValues>}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-3xl font-extrabold mb-4 block">
              What kind of community is this?
            </FormLabel>

            <p className="mb-4 text-sm text-muted-foreground">
              Decide who can view and contribute in your community. Only public
              communities show up in search. Important: Once set, you will need
              to submit a request to change your community type.
            </p>

            <div className="grid gap-3">
              {types.map((t) => {
                const Icon = t.icon;
                const selected = field.value === t.value;

                return (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => field.onChange(t.value)}
                    className={cn(
                      "group relative rounded-2xl border p-4 text-left transition-all flex items-start gap-4 cursor-pointer",
                      selected
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-muted hover:bg-muted/40"
                    )}
                  >
                    <div
                      className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                        selected
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="size-5" />
                    </div>

                    <div>
                      <p
                        className={cn(
                          "font-bold text-xl",
                          selected && "text-primary"
                        )}
                      >
                        {t.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t.description}
                      </p>
                    </div>

                    {/* Custom Radio Indicator */}
                    <div
                      className={cn(
                        "absolute right-4 top-8 h-4 w-4 rounded-full border-2 transition-all",
                        selected
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                      )}
                    />
                  </button>
                );
              })}
            </div>

            <FormMessage />
          </FormItem>
        )}
      />
    </motion.div>
  );
};
