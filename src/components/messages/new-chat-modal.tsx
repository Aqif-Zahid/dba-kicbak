"use client";
import { LoadingButton } from "@/components/loading-button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useUser } from "@/providers/auth-provider";

import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckIcon, Loader2, SearchIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState, forwardRef } from "react";
import { toast } from "sonner";
import { useChatContext } from "stream-chat-react";
import type { UserResponse } from "stream-chat";
import { UserAvatar } from "../common/user-avatar";

interface NewChatModalProps {
  onOpenChange: (open: boolean) => void;
  onChatCreated: () => void;
  preselectedUser?: UserResponse;
}

export const NewChatModal = ({
  onOpenChange,
  onChatCreated,
  preselectedUser,
}: NewChatModalProps) => {
  const { client, setActiveChannel } = useChatContext();
  const { user: loggedInUser } = useUser();

  const [selectedUsers, setSelectedUsers] = useState<UserResponse[]>(() =>
    preselectedUser ? [preselectedUser] : []
  );

  const [searchInput, setSearchInput] = useState("");
  const searchInputDebounce = useDebouncedValue(searchInput);

  // Ref to hold user elements for scrolling
  const userRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const headerText =
    selectedUsers.length === 0
      ? "New Chat"
      : selectedUsers.length === 1
      ? `Direct Message: ${selectedUsers[0].name}`
      : `Group Chat (${selectedUsers.length + 1} members)`;

  const { data, isFetching, isError, isSuccess } = useQuery({
    queryKey: ["stream-users", searchInputDebounce],
    queryFn: async () => {
      const filters: any = {
        id: { $nin: [loggedInUser?.defaultProfileId] },
        role: { $ne: "admin" }, // role filter is allowed
      };

      if (searchInputDebounce) {
        // Combine name and username search
        filters.$or = [
          { name: { $autocomplete: searchInputDebounce } },
          { username: { $autocomplete: searchInputDebounce } },
        ];
      }

      return client.queryUsers(
        filters,
        { name: 1, username: 1 },
        { limit: 15 }
      );
    },
    enabled: !!client && !!loggedInUser,
  });

  // Scroll to preselected user on first load
  useEffect(() => {
    if (preselectedUser && userRefs.current[preselectedUser.id]) {
      userRefs.current[preselectedUser.id]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [data, preselectedUser]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!loggedInUser) throw new Error("User not logged in");

      const memberIds = [
        loggedInUser.defaultProfileId,
        ...selectedUsers.map((u) => u.id),
      ];

      const isGroup = memberIds.length > 2;

      const channel = client.channel("messaging", undefined, {
        members: memberIds.map(String),
        name: isGroup
          ? memberIds
              .map((id) =>
                id === loggedInUser.defaultProfileId
                  ? loggedInUser.displayName
                  : selectedUsers.find((u) => u.id === id)?.name
              )
              .filter(Boolean)
              .join(", ")
          : undefined,
      } as any);

      await channel.create();
      return channel;
    },
    onSuccess: (channel) => {
      setActiveChannel(channel);
      onChatCreated();
      toast.success("Channel created successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create channel. Please try again.");
    },
  });

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="bg-card p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{headerText}</DialogTitle>
        </DialogHeader>

        <div>
          {/* Search input */}
          <div className="group relative">
            <SearchIcon className="absolute left-5 top-1/2 size-5 -translate-y-1/2 transform text-muted-foreground group-focus-within:text-primary" />
            <input
              type="text"
              className="h-12 w-full pe-4 ps-14 focus:outline-none"
              placeholder="Search users..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          {/* Selected users */}
          {!!selectedUsers.length && (
            <div className="mt-4 flex flex-wrap gap-2 p-2">
              {selectedUsers.map((user) => (
                <SelectedUserTag
                  key={user.id}
                  user={user}
                  onRemove={() =>
                    setSelectedUsers((prevUsers) =>
                      prevUsers.filter((u) => u.id !== user.id)
                    )
                  }
                />
              ))}
            </div>
          )}

          <hr />

          {/* User search results */}
          <div className="h-96 overflow-y-auto">
            {isSuccess &&
              data.users.map((user) => (
                <UserResult
                  key={user.id}
                  user={user}
                  selected={selectedUsers.some(
                    (selectedUser) => selectedUser.id === user.id
                  )}
                  onClick={() =>
                    setSelectedUsers((prevUsers) =>
                      prevUsers.some((u) => u.id === user.id)
                        ? prevUsers.filter((u) => u.id !== user.id)
                        : [...prevUsers, user]
                    )
                  }
                  ref={(el) => {
                    userRefs.current[user.id] = el;
                  }}
                />
              ))}

            {isSuccess && !data.users.length && (
              <p className="my-3 text-center text-muted">
                No users found. Try a different name
              </p>
            )}

            {isFetching && <Loader2 className="mx-auto my-3 animate-spin" />}

            {isError && (
              <p className="my-3 text-center text-destructive">
                An error occurred while fetching users
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 pb-6">
          <LoadingButton
            disabled={!selectedUsers.length}
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Start Chat
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ---------------- User result button ----------------
interface UserResultProps {
  user: UserResponse;
  selected: boolean;
  onClick: () => void;
}

const UserResult = forwardRef<HTMLButtonElement, UserResultProps>(
  ({ user, selected, onClick }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={`flex w-full items-center justify-between px-4 py-2.5 transition-colors hover:bg-muted/50 ${
          selected ? "bg-primary/10" : ""
        }`}
      >
        <div className="flex items-center gap-2">
          <UserAvatar
            avatarUrl={user.image}
            avatarFallback={user?.username?.charAt(0) || "U"}
          />
          <div className="flex flex-col text-start">
            <p className="font-bold">{user.name}</p>
            <p className="text-muted-foreground">{user.username}</p>
          </div>
        </div>
        {selected && <CheckIcon className="size-5 text-green-500" />}
      </button>
    );
  }
);

UserResult.displayName = "UserResult";

// ---------------- Selected user tag ----------------
interface SelectedUserTagProps {
  user: UserResponse;
  onRemove: () => void;
}

const SelectedUserTag = ({ user, onRemove }: SelectedUserTagProps) => {
  return (
    <button
      onClick={onRemove}
      className="flex items-center gap-2 rounded-full border p-1 hover:bg-muted/50"
    >
      <UserAvatar
        avatarUrl={user.image}
        size={24}
        avatarFallback={user?.username?.charAt(0) || "U"}
      />
      <p className="font-bold">{user.name}</p>
      <XIcon className="mx-2 size-5 text-muted-foreground" />
    </button>
  );
};
