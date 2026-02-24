"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Form } from "@/components/ui/form";
import {
  Loader2,
  CheckCircle2,
  ChevronLeft,
  AlertTriangle,
} from "lucide-react";

import axios from "axios";
import { useRouter } from "next/navigation";
import { FirstStep } from "./first-step";
import { useGetTopicGroups } from "@/services/admin/topic-groups/use-get-topic-groups";
import { SecondStep } from "./second-step";
import { ThirdStep } from "./third-step";
import { FinalStep } from "./final-step";
import { uploadImage } from "@/hooks/upload-image";

export const CreateCommunityMain = () => {
  const { data: communityGroups, isLoading } = useGetTopicGroups();
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // FIX: New state to control when the final button becomes type="submit"
  const [isFinalStepActive, setIsFinalStepActive] = useState<boolean>(false);

  // ------------------------
  // Form schema
  // ------------------------
  const topicsSchema = z.object({
    topics: z.array(z.string()).min(1, "Please select at least 1 topic"),
  });

  const serviceSchema = z.object({
    type: z.string().min(1, "Community Type is required"),
  });

  const thirdSchema = z.object({
    name: z.string().min(1, "Community Name is required"),
    slug: z.string(),
    description: z.string().min(1, "Community Description is required"),
  });

  const finalSchema = z.object({
    icon: z.any().optional(),
  });

  const formSchema = topicsSchema
    .merge(serviceSchema)
    .merge(thirdSchema)
    .merge(finalSchema);

  type FormData = z.infer<typeof formSchema>;

  // ------------------------
  // Form
  // ------------------------
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topics: [],
      type: "PUBLIC",
      name: "",
      slug: "",
      description: "",
      icon: "",
    },
  });

  const steps = useMemo(
    () => [
      { key: "first", label: "Topics" },
      { key: "second", label: "Community Type" },
      { key: "third", label: "Details" },
      { key: "final", label: "Icon" },
    ],
    []
  );

  const currentProgress = ((step + 1) / steps.length) * 100;

  // Fields per step for partial validation
  const stepFields: Record<number, (keyof FormData)[]> = {
    1: ["topics"],
    2: ["type"],
    3: ["name", "slug", "description"],
    4: ["icon"],
  };

  // ------------------------
  // Navigation functions
  // ------------------------
  const next = async () => {
    const fields = stepFields[step];
    if (!fields) return;

    const valid = await form.trigger(fields);
    if (!valid) return;

    // Only move to next step if not last
    if (step < steps.length) {
      const nextStep = step + 1;
      setStep(nextStep);

      // FIX: Activate the submit button state if we are moving to the final step (4)
      if (nextStep === steps.length) {
        // Use a short delay to ensure the re-render completes before setting the button type
        setTimeout(() => {
          setIsFinalStepActive(true);
        }, 100);
      } else {
        // Reset the state for safety if somehow moving back/forward from other steps
        setIsFinalStepActive(false);
      }
    }
  };

  const prev = () => {
    setStep((s) => Math.max(s - 1, 1));
    // Reset the active state immediately when moving back from the final step
    if (step === steps.length) {
      setIsFinalStepActive(false);
    }
  };

  // ------------------------
  // Submit
  // ------------------------
  const onSubmit = async (values: FormData) => {
    setLoading(true);
    setError(null);
    try {
      let imageUrl = "";
      if (values.icon instanceof File) {
        const uploaded = await uploadImage(values.icon);
        imageUrl = uploaded.secure_url;
      }

      const res = await axios.post("/api/communities", {
        ...values,
        icon: imageUrl,
        topicIds: values.topics.map((t) => Number(t)),
      });

      if (res.data.status === 1) {
        router.push("/communities");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create community");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // Prevent Enter from submitting prematurely
  // ------------------------
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && step < steps.length) {
      e.preventDefault();
      next();
    }
  };

  return (
    <div className="w-full p-4 grid">
      <p className="text-3xl font-extrabold mb-3">Create Community</p>

      <div className="space-y-2 mb-10 w-full">
        <div className="flex items-center text-sm text-muted-foreground">
          <Progress value={currentProgress} />
          <span className="ms-3 text-lg text-gray-900 font-bold">
            {Math.round(currentProgress)}%
          </span>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onKeyDown={handleKeyDown}
          className="space-y-6"
        >
          <AnimatePresence mode="wait" initial={false}>
            {step === 1 && (
              <>
                {isLoading ? (
                  <p>Loading...</p>
                ) : (
                  <FirstStep
                    form={form}
                    communityGroups={communityGroups?.data || []}
                  />
                )}
              </>
            )}
            {step === 2 && <SecondStep form={form} />}
            {step === 3 && <ThirdStep form={form} />}
            {step === 4 && <FinalStep form={form} />}
          </AnimatePresence>

          {error && (
            <div className="flex items-center">
              <AlertTriangle className="size-5 text-red-700 mr-2" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={prev}
              disabled={step === 1 || form.formState.isSubmitting}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            {step < steps.length ? (
              <Button type="button" onClick={next} disabled={loading}>
                Next
              </Button>
            ) : (
              // FIX APPLIED HERE: Control the button type to prevent immediate submission
              <Button
                // Use type="submit" only after the state flag is set
                type={isFinalStepActive ? "submit" : "button"}
                size="lg"
                disabled={loading}
                // If it's not active yet (during the 100ms delay), manually trigger submit on click
                onClick={
                  isFinalStepActive ? undefined : form.handleSubmit(onSubmit)
                }
              >
                {loading ? (
                  <span className="inline-flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Submitting…
                  </span>
                ) : (
                  <span className="inline-flex items-center">
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Submit
                  </span>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};
