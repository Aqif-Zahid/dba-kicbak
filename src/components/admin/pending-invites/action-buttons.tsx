"use client";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteUser } from "@/services/users/use-delete-user";
import { User } from "@/types/types";
import axios from "axios";
import { Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
interface ActionButtonsProps {
  user: User;
}

export const ActionButtons = ({ user }: ActionButtonsProps) => {
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete User",
    "This action can not be undone",
    "destructive"
  );
  const { mutate, isPending } = useDeleteUser();
  const onDelete = async () => {
    const ok = await confirm();
    if (!ok) {
      return;
    }
    mutate({
      userId: user.id,
    });
  };

  const [ConfirmSendDialog, confirmSend] = useConfirm(
    `Send Invitation Code to ${user.email}`,
    "This action can not be undone",
    "primary"
  );
  const onSend = async () => {
    const ok = await confirmSend();
    if (!ok) {
      return;
    }
    try {
      const res = await axios.post("/api/approve-invite", {
        email: user.email,
      });
      if (res.data.status === 1) {
        toast.success("Invitation send successfully");
      }
    } catch (e) {
      console.log(e);
      toast.error("Failed to send invitation");
    }
  };
  return (
    <div className="flex items-center gap-2">
      <ConfirmDialog />
      <ConfirmSendDialog />
      {/* 🔹 Send Invite */}
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        disabled={isPending}
        onClick={onSend}
      >
        <Send className="size-4" />
        Send
      </Button>

      {/* 🔹 Delete */}
      <Button
        variant="destructive"
        size="sm"
        className="flex items-center gap-1"
        onClick={onDelete}
        disabled={isPending}
      >
        <Trash2 className="size-4" />
        Delete
      </Button>
    </div>
  );
};
