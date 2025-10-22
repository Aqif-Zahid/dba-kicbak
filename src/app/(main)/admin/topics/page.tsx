"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";
import { Topic } from "@/types/types";

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [groupId, setGroupId] = useState<number | undefined>();
  const [communityId, setCommunityId] = useState<number | undefined>();

  // Fetch topics
  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/topics");
      setTopics(res.data.data.flatMap((g: any) => g.topics)); // assuming grouped API
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch topics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  // Open modal for create or update
  const openModal = (topic?: Topic) => {
    if (topic) {
      setEditingTopic(topic);
      setTitle(topic.title);
      setDescription(topic.description || "");
      setGroupId(topic.groupId);
      setCommunityId(topic.communityId);
    } else {
      setEditingTopic(null);
      setTitle("");
      setDescription("");
      setGroupId(undefined);
      setCommunityId(undefined);
    }
    setModalOpen(true);
  };

  // Handle create/update
  const handleSubmit = async () => {
    if (!title || !groupId) {
      toast.error("Title and Group are required");
      return;
    }
    try {
      if (editingTopic) {
        // Update
        await axios.put("/api/topics", {
          id: editingTopic.id,
          title,
          description,
          groupId,
          communityId,
        });
        toast.success("Topic updated");
      } else {
        // Create
        await axios.post("/api/topics", {
          title,
          description,
          groupId,
          communityId,
        });
        toast.success("Topic created");
      }
      setModalOpen(false);
      fetchTopics();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to save topic");
    }
  };

  // Handle delete
  const handleDelete = async (topic: Topic) => {
    if (!confirm(`Are you sure you want to delete "${topic.title}"?`)) return;
    try {
      await axios.delete(`/api/topics?id=${topic.id}`);
      toast.success("Topic deleted");
      fetchTopics();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete topic");
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Topics</h1>
        <Button onClick={() => openModal()}>Create Topic</Button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <p>Loading...</p>
        ) : topics.length === 0 ? (
          <p>No topics found.</p>
        ) : (
          topics.map((topic) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-white rounded-lg shadow flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold">{topic.title}</h2>
                {topic.description && (
                  <p className="text-sm text-gray-500">{topic.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openModal(topic)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(topic)}
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg sm:p-6">
          <DialogHeader>
            <DialogTitle>
              {editingTopic ? "Update Topic" : "Create Topic"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Group ID"
              value={groupId ?? ""}
              onChange={(e) => setGroupId(Number(e.target.value))}
            />
            <Input
              type="number"
              placeholder="Community ID (optional)"
              value={communityId ?? ""}
              onChange={(e) => setCommunityId(Number(e.target.value))}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit}>
              {editingTopic ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
