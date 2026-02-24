"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { getErrorMessage } from "@/lib/utils";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { Input } from "../../ui/input";
import { AlertTriangle } from "lucide-react";
import { Button } from "../../ui/button";
import ResponsiveModal from "@/components/modals/responsive-modal";
import { Textarea } from "@/components/ui/textarea";
import { useManageTopicGroup } from "@/services/admin/topic-groups/use-manage-topic-group";
import { toast } from "sonner";
import { TopicGroup } from "@/types/types";
interface TopicGroupsModalProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  data?: TopicGroup;
}

export const TopicGroupsModal = ({
  show,
  setShow,
  data,
}: TopicGroupsModalProps) => {
  const close = () => {
    setShow(false);
  };
  const [error, setError] = useState<string | null>(null);
  const topicGroupSchema = z.object({
    name: z.string().min(2, "Topic Group name must be at least 2 characters"),
    description: z.string().optional(),
  });

  const { mutateAsync, isPending } = useManageTopicGroup();
  const form = useForm<z.infer<typeof topicGroupSchema>>({
    resolver: zodResolver(topicGroupSchema),
    defaultValues: {
      name: data ? data.name : "",
      description: data ? data.description : "",
    },
  });

  const onSubmit = async (values: z.infer<typeof topicGroupSchema>) => {
    try {
      setError(null);
      const finalValues = data ? { ...values, id: data.id } : values;
      const res = await mutateAsync(finalValues);
      if (res.status === 1) {
        toast.success("Topic group created successfully.");
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
    <ResponsiveModal open={show} onOpenChange={close} fullScreen={true}>
      <div className="text-center mb-4">
        <h2 className="font-bold text-gray-700 text-lg mb-1">
          {data ? "Update" : "Create"} Topic Group
        </h2>
        <p className="text-muted-foreground text-sm">
          Please fill the information to {data ? "update the" : "create a"}{" "}
          topic group
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-2">
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>
                  Name <span className="text-red-700">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter Name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="description"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Description <span className="text-red-900">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Description..."
                    className="min-h-[80px] border-gray-300"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <div className="flex items-center">
              <AlertTriangle className="size-5 text-red-700 mr-2" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? (
              <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
            ) : (
              `${data ? "Update" : "Create"}`
            )}
          </Button>
        </form>
      </Form>
    </ResponsiveModal>
  );
};
