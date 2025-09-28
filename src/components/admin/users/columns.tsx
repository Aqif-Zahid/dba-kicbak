import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreVertical, UserIcon } from "lucide-react";
import { format } from "date-fns";
import { User } from "@/types/types";
import { ActionButtons } from "./action-buttons";
import { useUpdateUserStatus } from "@/services/users/use-update-user-status";

export const usersColumns: ColumnDef<User>[] = [
  {
    accessorKey: "displayName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0"
        >
          Name
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = `${row.original.displayName}`;
      return <p className="line-champ-1">{name}</p>;
    },
  },

  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0"
        >
          Email
        </Button>
      );
    },
  },
  {
    accessorKey: "mobile",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0"
        >
          Phone Number
        </Button>
      );
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0"
        >
          Role
        </Button>
      );
    },
    cell: ({ row }) => {
      const role = row.original.role;
      return (
        <div className="flex items-center">
          <UserIcon size={16} className="mr-2" />
        </div>
      );
    },
  },

  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0"
        >
          Status
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original;
      // Conditional status options
      const statusOptions = (() => {
        switch (user.status) {
          case "PENDING":
            return ["PENDING", "BLOCKED"];
          case "ACTIVE":
            return ["ACTIVE", "BLOCKED"];
          case "BLOCKED":
            return ["BLOCKED", "ACTIVE"];
          default:
            return [];
        }
      })();

      const { mutateAsync, isPending } = useUpdateUserStatus();

      const handleChange = async (newStatus: string) => {
        const data = {
          userId: user.id,
          status: newStatus,
        };
        await mutateAsync(data);
      };

      return (
        <div className="flex items-center space-x-2">
          {statusOptions.length > 0 && (
            <select
              value={user.status}
              onChange={(e) => handleChange(e.target.value)}
              disabled={isPending}
              className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0"
        >
          Created At
        </Button>
      );
    },
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;
      return (
        <div>
          <p className="line-champ-1">
            {format(new Date(createdAt), "dd/MM/yyyy")}
          </p>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <ActionButtons data={row.original}>
          <Button variant="ghost" className="size-8 p-0">
            <MoreVertical className="size-4" />
          </Button>
        </ActionButtons>
      );
    },
  },
];
