"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Trash2, Edit, UserPlus, Search } from "lucide-react";
import { useGetCommunities } from "@/services/communities/use-get-communities";
import { useUser } from "@/providers/auth-provider";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteCommunity } from "@/services/communities/use-delete-community";
import { useJoinCommunity } from "@/services/communities/use-join-community";
import { Community } from "@/types/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const CommunityPage = () => {
  const { user: currentUser } = useUser();
  const [search, setSearch] = useState("");

  // Fetch communities
  const { data: communities, isLoading } = useGetCommunities();
  const filteredCommunities =
    communities?.data.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete Community",
    "This action cannot be undone",
    "destructive"
  );

  const { mutate: deleteCommunity, isPending: isDeleting } =
    useDeleteCommunity();
  const onDelete = async (community: Community) => {
    const ok = await confirm();
    if (!ok) return;
    deleteCommunity({ id: community.id });
  };

  const joinMutation = useJoinCommunity();

  const onJoin = (community: Community) => {
    joinMutation.mutate({ id: community.id });
  };

  return (
    <div className="p-4 space-y-4">
      <ConfirmDialog />

      {/* Search Bar */}
      <div className="flex items-center gap-2 mb-4">
        <Search className="text-muted-foreground w-5 h-5" />
        <Input
          placeholder="Search communities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredCommunities.map((community) => {
            const isMember = community.members.some(
              (m) => m.id === Number(currentUser?.defaultProfileId)
            );
            const isOwnerOrAdmin =
              currentUser?.role === "ADMIN" ||
              community.ownerId === currentUser?.defaultProfileId;

            return (
              <motion.div
                key={community.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="relative shadow hover:shadow-lg transition-all h-full">
                  <CardHeader className="flex items-center gap-4">
                    {/* Community Icon or Fallback */}
                    <Avatar className="w-12 h-12">
                      {community.icon ? (
                        <AvatarImage
                          src={community.icon}
                          alt={community.name}
                        />
                      ) : (
                        <AvatarFallback>{community.name[0]}</AvatarFallback>
                      )}
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl font-bold truncate overflow-hidden whitespace-nowrap">
                        {community.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground mb-2">
                        {community.description}
                      </CardDescription>

                      {/* Topics */}
                      <div className="flex flex-wrap gap-2 mt-1">
                        {community.topics?.map((topic) => (
                          <Badge
                            key={topic.id}
                            variant="outline"
                            className="text-sm"
                          >
                            {topic.title}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex justify-between items-center gap-4 mt-2">
                    {!isMember && (
                      <Button
                        size="sm"
                        variant="default"
                        className="flex items-center gap-2"
                        onClick={() => onJoin(community)}
                        disabled={joinMutation.isPending}
                      >
                        <UserPlus size={16} />{" "}
                        {joinMutation.isPending ? "Joining..." : "Join"}
                      </Button>
                    )}

                    {isOwnerOrAdmin && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex items-center gap-1"
                          onClick={() => onDelete(community)}
                          disabled={isDeleting}
                        >
                          <Trash2 size={16} /> Delete
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommunityPage;
