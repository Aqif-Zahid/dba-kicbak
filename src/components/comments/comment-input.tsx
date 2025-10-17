import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, SendHorizonal, Smile } from "lucide-react";
import { Post } from "@/types/types";
import { useCreateComment } from "@/services/comments/use-create-comment";

// Dynamically import emoji picker
const Picker = dynamic(() => import("emoji-picker-react"), { ssr: false });

interface CommentInputProps {
  post: Post;
}

export const CommentInput = ({ post }: CommentInputProps) => {
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState<"top" | "bottom">(
    "bottom"
  );
  const pickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const mutation = useCreateComment(post.id);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;

    mutation.mutate(
      { post, content: input },
      {
        onSuccess: () => setInput(""),
      }
    );
  };

  const handleEmojiClick = (emojiData: any) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Adjust picker position
  useEffect(() => {
    if (showEmojiPicker && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      setPickerPosition(
        spaceBelow < 350 && spaceAbove > spaceBelow ? "top" : "bottom"
      );
    }
  }, [showEmojiPicker]);

  return (
    <div className="relative w-full" ref={inputRef}>
      <form
        className="flex w-full items-center gap-2 mb-2"
        onSubmit={handleSubmit}
      >
        <Input
          placeholder="Write a comment..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
        >
          <Smile />
        </Button>
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          disabled={!input.trim() || mutation.isPending}
        >
          {!mutation.isPending ? (
            <SendHorizonal />
          ) : (
            <Loader2 className="animate-spin" />
          )}
        </Button>
      </form>

      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            ref={pickerRef}
            initial={{ opacity: 0, y: pickerPosition === "top" ? 10 : -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: pickerPosition === "top" ? 10 : -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute right-0 z-50 ${
              pickerPosition === "top" ? "bottom-full mb-2" : "bottom-12"
            }`}
          >
            <Picker onEmojiClick={handleEmojiClick} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
