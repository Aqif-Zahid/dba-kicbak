"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useUser } from "@/providers/auth-provider";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { AlertTriangle } from "lucide-react";

// Validation schema
const postSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  content: z.string().min(10, "Post content must be at least 10 characters"),
  category: z.string().optional(),
});

export default function CreatePostPage() {
  const router = useRouter();
  const { user } = useUser();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof postSchema>) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post("/api/posts", {
        ...values,
        userId: user?.id,
      });

      if (res.status === 200) {
        router.push("/"); // redirect to homepage after creating post
      }
    } catch (err: any) {
      console.error(err);
      setError("Something went wrong while creating the post.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <p className="text-gray-600 text-lg">
          You must be signed in to create a post.
        </p>
        <Button
          onClick={() => router.push("/")}
          className="mt-4 bg-primary text-white"
        >
          Go back
        </Button>
      </div>
    );
  }

return (
  <div className="flex flex-col items-center w-full py-8">
    <Card className="w-full max-w-2xl shadow-sm border border-gray-200">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-2xl font-semibold text-primary">
          Create a New Post
        </CardTitle>

        {/* 🡸 Back button */}
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="text-sm"
        >
          ← Back
        </Button>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your post title"
                      {...field}
                      className="border-gray-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your post here..."
                      rows={6}
                      {...field}
                      className="border-gray-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Travel, Food, Experience..."
                      {...field}
                      className="border-gray-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="flex items-center text-red-700 text-sm">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white hover:bg-primary/90"
            >
              {loading ? "Publishing..." : "Publish Post"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  </div>
);

}
