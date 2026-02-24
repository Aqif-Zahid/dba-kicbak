import { Button } from "@/components/ui/button";
import { MailPlus, XIcon } from "lucide-react";
import { useState } from "react";
import { NewChatModal } from "./new-chat-modal";

interface ChatMenuHeaderProps {
  onClose: () => void;
}

export const ChatMenuHeader = ({ onClose }: ChatMenuHeaderProps) => {
  const [showNewChat, setShowNewChat] = useState(false);
  return (
    <>
      <div className="flex items-center gap-3 p-2">
        <div className="h-full md:hidden">
          <Button size="icon" variant="ghost" onClick={onClose}>
            <XIcon className="size-5" />
          </Button>
        </div>
        <h1 className="me-auto text-2xl font-bold md:ms-2">Messages</h1>
        <Button
          size="icon"
          variant="ghost"
          title="Start new chat"
          onClick={() => setShowNewChat(true)}
        >
          <MailPlus className="size-5" />
        </Button>
      </div>
      {showNewChat && (
        <NewChatModal
          onOpenChange={setShowNewChat}
          onChatCreated={() => {
            setShowNewChat(false);
            onClose();
          }}
        />
      )}
    </>
  );
};
