import { ColumnDef } from "@tanstack/react-table";
import { ProfileAdmin } from "@/types/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const profileColumns: ColumnDef<ProfileAdmin>[] = [
  {
    accessorKey: "profilePicture",
    header: "Profile Picture",
    cell: ({ row }) => {
      const pic = row.original.profilePicture;
      const displayName = row.original.displayName;
      return (
        <Avatar className="w-10 h-10">
          <AvatarImage src={pic || ""} />
          <AvatarFallback>
            {displayName?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      );
    },
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "displayName",
    header: "Display Name",
  },
  {
    accessorKey: "user.email",
    header: "Email",
  },
  {
    accessorKey: "user.phoneNumber",
    header: "Phone Number",
  },
  {
    accessorKey: "user.status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.user?.status;
      const colorClass =
        status === "ACTIVE"
          ? "bg-green-100 text-green-800"
          : status === "BLOCKED"
          ? "bg-red-100 text-red-800"
          : status === "PENDING"
          ? "bg-yellow-100 text-yellow-800"
          : "bg-gray-100 text-gray-800";

      return (
        <span
          className={`px-2 py-1 text-xs rounded-full font-semibold ${colorClass}`}
        >
          {status || "N/A"}
        </span>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
  accessorKey: "createdAt",
  header: "Created At",
  cell: ({ row }) => {
    const createdAt = row.original.createdAt;
    if (!createdAt) return <span>N/A</span>;

    const date = new Date(createdAt);
    return (
      <span>
        {date.toLocaleDateString("en-GB", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </span>
    );
  },
},

];
