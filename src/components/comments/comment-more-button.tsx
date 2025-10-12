import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2Icon } from "lucide-react";
import { CommentData } from "@/types/types";
import { DeleteCommentModal } from "./delete-comment-modal";

interface CommentMoreButtonProps {
  comment: CommentData;
  className?: string;
}

export const CommentMoreButton = ({
  comment,
  className,
}: CommentMoreButtonProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className={className}>
            <MoreHorizontal className="size-5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
            <span className="flex items-center gap-3 text-destructive">
              <Trash2Icon className="size-4" />
              Delete
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteCommentModal
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        comment={comment}
      />
    </>
  );
};
