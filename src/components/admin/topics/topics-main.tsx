"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Loader from "@/components/common/loader";
import { useConfirm } from "@/hooks/use-confirm";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Topic } from "@/types/types";
import { TopicModal } from "./topic-modal";
import { useGetTopics } from "@/services/admin/topics/use-get-topics";
import { useDeleteTopic } from "@/services/admin/topics/use-delete-topic";

export const TopicsMain = () => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const { data: result, isFetching } = useGetTopics();
  const [selected, setSelected] = useState<Topic | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);

  const handleUpdate = (item: Topic) => {
    setSelected(item);
    setShowUpdateModal(true);
  };

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete Topic",
    "This action can not be undone",
    "destructive"
  );

  const { mutate, isPending } = useDeleteTopic();
  const onDelete = async (item: Topic) => {
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

  const allTopics = result.data.flatMap((group) =>
    group.topics.map((topic) => ({
      ...topic,
      groupName: group.name,
      groupId: group.id,
    }))
  );

  const allGroups = result.data.map((group) => {
    return {
      id: group.id.toString(),
      name: group.name,
    };
  });

  return (
    <div className="p-4">
      <ConfirmDialog />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Topics</h1>
        <Button onClick={() => setShowAddModal(true)}>Create Topic</Button>
      </div>

      <div className="grid gap-4">
        {allTopics.length === 0 ? (
          <Card className="mx-auto mt-10 max-w-md text-center shadow-sm md:min-w-xl">
            <CardContent className="py-10 flex flex-col items-center gap-3">
              <Info className="h-10 w-10 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                No Topic Found!
              </h3>
              <p className="text-sm text-muted-foreground">
                Be the first to create one!
              </p>
              <Button className="mt-2" onClick={() => setShowAddModal(true)}>
                Create Topic
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allTopics.map((topic) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-white rounded-xl shadow-md flex flex-col justify-between gap-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col gap-2">
                  <h2 className="font-bold text-lg text-gray-800">
                    {topic.title}
                  </h2>

                  {topic.description && (
                    <p className="text-sm text-gray-500">{topic.description}</p>
                  )}

                  {/* Group name badge */}
                  <span className="inline-block  text-xs font-medium ">
                    Group : {topic.groupName}
                  </span>

                  <p className="text-xs text-gray-400 mt-1">
                    Created by: {topic.createdBy.displayName} (
                    {topic.createdBy.username})
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdate(topic)}
                    disabled={isPending}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(topic)}
                    disabled={isPending}
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
        <TopicModal
          show={showAddModal}
          setShow={setShowAddModal}
          allGroups={allGroups}
        />
      )}

      {showUpdateModal && selected && (
        <TopicModal
          show={showUpdateModal}
          setShow={setShowUpdateModal}
          data={selected}
          allGroups={allGroups}
        />
      )}
    </div>
  );
};
