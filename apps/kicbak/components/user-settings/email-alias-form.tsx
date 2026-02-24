"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const aliasSchema = z.object({
  handle: z
    .string()
    .min(5, "Alias must be at least 5 characters")
    .max(15, "Alias cannot exceed 15 characters")
    .regex(
      /^[a-z0-9._-]+$/,
      "Only lowercase letters, numbers, dots, underscores and hyphens allowed"
    ),
});

export const EmailAliasForm = () => {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const existingAlias = session?.user?.emailAlias ?? null;
  const aliasDomain = process.env.NEXT_PUBLIC_ALIAS_DOMAIN || "kicbak.co";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof aliasSchema>>({
    resolver: zodResolver(aliasSchema),
    defaultValues: { handle: "" },
  });

  const onSubmit = async (values: z.infer<typeof aliasSchema>) => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post("/api/email-alias", {
        requestedHandle: values.handle,
      });

      if (res.status === 200) {
        /**
         * Refresh session data
         */
        await update();
        router.refresh();

        alert(
          `Email alias created successfully: ${values.handle}@${aliasDomain}\nThis alias is permanent and cannot be changed or removed.`
        );
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response) {
        setError(err.response.data?.message || "Failed to create alias");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center pb-16 w-full">
      <Card className="w-full md:w-[487px] border shadow-none">
        {/* ===== Header (matches ChangePasswordMain) ===== */}
        <CardHeader className="flex items-center justify-center text-center px-7">
          <CardTitle className="text-2xl font-bold text-primary">
            Email Alias
          </CardTitle>
        </CardHeader>

        <CardContent className="px-7">
          {/* WAIT for session to load */}
          {status === "loading" && (
            <p className="text-sm text-muted-foreground">Loading…</p>
          )}

          {/* LOCKED MODE — alias exists in session */}
          {status === "authenticated" && existingAlias && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                You already have an email alias. This alias is permanent and
                cannot be changed or removed.
              </p>

              <div className="space-y-1">
                <label className="text-sm font-medium">Email Alias</label>
                <Input value={existingAlias} disabled />
              </div>
            </div>
          )}

          {/* CREATE MODE — no alias in session */}
          {status === "authenticated" && !existingAlias && (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Create a permanent email alias for your account. Once created,
                it cannot be changed or removed.
              </p>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="handle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Alias Handle</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <Input
                              {...field}
                              placeholder="e.g. john"
                              autoCapitalize="none"
                              autoCorrect="off"
                              disabled={loading}
                              className="rounded-r-none"
                            />
                            <div className="flex items-center px-3 border border-l-0 rounded-r-md bg-muted text-sm text-muted-foreground">
                              @{aliasDomain}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {error && (
                    <p className="text-sm text-red-600 font-medium">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Email Alias"}
                  </Button>
                </form>
              </Form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
