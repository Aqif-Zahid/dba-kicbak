"use client";

import { motion } from "framer-motion";
import { UseFormReturn, FieldValues, Path } from "react-hook-form";

import { FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Badge } from "../ui/badge";
import { Star, Tag } from "lucide-react";

export type Topic = {
  id: number;
  title: string;
  description?: string;
};

export type TopicGroup = {
  id: number;
  name: string;
  description?: string;
  topics: Topic[];
};

// Generic with FieldValues, require topics
type FirstStepProps<FormValues extends FieldValues & { topics: string[] }> = {
  form: UseFormReturn<FormValues>;
  communityGroups: TopicGroup[];
};

export const FirstStep = <
  FormValues extends FieldValues & { topics: string[] }
>({
  form,
  communityGroups,
}: FirstStepProps<FormValues>) => {
  return (
    <motion.div
      key="step-1"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="grid gap-6"
    >
      <h1 className="text-3xl font-extrabold">Add topics</h1>
      <p className="text-muted-foreground text-sm">
        Add up to 3 topics to help interested users find your community.
      </p>

      <FormField
        control={form.control}
        // Cast name to Path<FormValues> so TS knows this exists
        name={"topics" as Path<FormValues>}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-semibold text-lg">
              Select Topics
            </FormLabel>

            <div className="space-y-6 mt-3">
              {communityGroups.map((group) => (
                <div
                  key={group.id}
                  className="border p-4 rounded-xl bg-gray-50"
                >
                  <p className="font-semi text-base mb-3 flex items-center gap-2">
                    <Star className="size-4" />
                    {group.name}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {group.topics.map((topic) => {
                      const selected = field.value.includes(String(topic.id));

                      return (
                        <motion.div
                          key={topic.id}
                          animate={{ scale: selected ? 1.1 : 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                        >
                          <Badge
                            variant={selected ? "default" : "outline"}
                            onClick={() => {
                              if (selected) {
                                field.onChange(
                                  field.value.filter(
                                    (v: any) => v !== String(topic.id)
                                  )
                                );
                              } else {
                                field.onChange([
                                  ...field.value,
                                  String(topic.id),
                                ]);
                              }
                            }}
                            className={`
                              cursor-pointer px-4 py-2 text-sm rounded-full transition flex items-center gap-2
                              ${
                                selected
                                  ? "bg-primary text-white"
                                  : "bg-gray-200 hover:bg-gray-400"
                              }
                            `}
                          >
                            <Tag size={16} />
                            {topic.title}
                          </Badge>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <FormMessage />
          </FormItem>
        )}
      />
    </motion.div>
  );
};
