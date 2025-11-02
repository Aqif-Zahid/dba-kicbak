"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TopicGroupsModal } from "@/components/admin/topic-groups/topic-groups-modal";
import Loader from "@/components/common/loader";
import { useConfirm } from "@/hooks/use-confirm";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import { useGetTopicGroups } from "@/services/admin/topic-groups/use-get-topic-groups";
import { useDeleteTopicGroup } from "@/services/admin/topic-groups/use-delete-topic-group";
import { Topic, TopicGroup } from "@/types/types";

export const TopicGroupsMain = () => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const { data: result, isFetching } = useGetTopicGroups();
  const [selected, setSelected] = useState<TopicGroup | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);

  const handleUpdate = (item: TopicGroup) => {
    setSelected(item);
    setShowUpdateModal(true);
  };

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete Topic Group",
    "This action can not be undone",
    "destructive"
  );

  const { mutate, isPending } = useDeleteTopicGroup();
  const onDelete = async (item: TopicGroup) => {
    const ok = await confirm();
    if (!ok) {
      return;
    }
    mutate({
      id: item.id,
    });
  };

  if (isFetching || !result) {
    return <Loader />;
  }

  return (
    <div className="p-4">
      <ConfirmDialog />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Topic Groups</h1>
        <Button onClick={() => setShowAddModal(true)}>
          Create Topic Group
        </Button>
      </div>

      <div className="grid gap-4">
        {result.data.length === 0 ? (
          <Card className="mx-auto mt-10 max-w-md text-center shadow-sm">
            <CardContent className="py-10 flex flex-col items-center gap-3">
              <Info className="h-10 w-10 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                No Topic Group Found!
              </h3>
              <p className="text-sm text-muted-foreground">
                Be the first to create one!
              </p>
              <Button className="mt-2" onClick={() => setShowAddModal(true)}>
                Create Group Topic
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.data.map((group) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-white rounded-xl shadow-md flex flex-col justify-between gap-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col gap-2">
                  <h2 className="font-bold text-lg text-gray-800">
                    {group.name}
                  </h2>
                  {group.description && (
                    <p className="text-sm text-gray-500">{group.description}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    Created by: {group.createdBy.displayName} (
                    {group.createdBy.username})
                  </p>

                  {/* Topics as tags */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {group.topics.length > 0 ? (
                      group.topics.map((topic: Topic) => (
                        <span
                          key={topic.id}
                          className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800"
                        >
                          {topic.title}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        No topics yet
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdate(group)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(group)}
                  >
                    Delete
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <TopicGroupsModal show={showAddModal} setShow={setShowAddModal} />
      )}

      {showUpdateModal && selected && (
        <TopicGroupsModal
          show={showUpdateModal}
          setShow={setShowUpdateModal}
          data={selected}
        />
      )}
    </div>
  );
};
