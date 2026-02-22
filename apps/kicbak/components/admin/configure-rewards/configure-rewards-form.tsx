"use client";

import { useState, useTransition } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

async function updateRewardSettings(values: { referrer_reward_points: number; referred_reward_points: number }) {
  try {
    const res = await fetch("/api/admin/configure-rewards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return { status: 0, message: data?.message || "Failed to update reward settings" } as const;
    }

    return {
      status: data?.status ?? 1,
      message: data?.message || "Reward settings updated successfully",
    } as const;
  } catch (e: any) {
    return { status: 0, message: e?.message || "Failed to update reward settings" } as const;
  }
}

const RewardsSchema = z.object({
  referrer_reward_points: z.number().min(0, "Referrer reward points cannot be negative"),
  referred_reward_points: z.number().min(0, "Referred user reward points cannot be negative"),
});

type RewardsFormValues = z.infer<typeof RewardsSchema>;

interface ConfigureRewardsFormProps {
  referrerPoints: number;
  referredPoints: number;
  lastUpdated: string | null;
}

export function ConfigureRewardsForm({
  referrerPoints,
  referredPoints,
  lastUpdated,
}: ConfigureRewardsFormProps) {
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<RewardsFormValues>({
    resolver: zodResolver(RewardsSchema),
    defaultValues: {
      referrer_reward_points: referrerPoints,
      referred_reward_points: referredPoints,
    },
  });

  const onSubmit = (values: RewardsFormValues) => {
    startTransition(async () => {
      const res = await updateRewardSettings(values);

      if (res.status === 1) {
        toast.success("Reward settings updated successfully");
        setSuccessMessage("Referral reward settings updated successfully.");
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          <FormField
            control={form.control}
            name="referrer_reward_points"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">
                  Referrer Reward Points
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="referred_reward_points"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">
                  Referred User Reward Points
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {successMessage && (
            <p className="text-green-600 text-sm font-medium">
              {successMessage}
            </p>
          )}

          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last updated on: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            Save Changes
          </Button>
        </form>
      </Form>
    </div>
  );
}
