"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteUser } from "@/services/users/use-delete-user";
import { User } from "@/types/types";
import { PencilIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface ActionButtonsProps {
  data: User;
  children: React.ReactNode;
}
export const ActionButtons = ({ data, children }: ActionButtonsProps) => {
  const router = useRouter();
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
      userId: data.id,
    });
  };

  return (
    <div className="flex justify-end">
      <ConfirmDialog />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            className="font-medium p-[10px]"
            onClick={() =>
              router.push(`/admin/update-member?userId=${data.id}`)
            }
          >
            <PencilIcon className="size-4 mr-2 stroke-2" />
            Update User
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-amber-500 focus:text-amber-700 font-medium p-[10px]"
            onClick={onDelete}
            disabled={isPending}
          >
            <TrashIcon className="size-4 mr-2 stroke-2" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
