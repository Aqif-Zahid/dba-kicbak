import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { User } from "@/types/types";
import { ActionButtons } from "./action-buttons";

export const inviteColumns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0"
        >
          SL
        </Button>
      );
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
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0"
        >
          Requested At
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
    header: () => (
      <Button variant="ghost" className="px-0">
        Actions
      </Button>
    ),
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return <ActionButtons user={user} />;
    },
  },
];
