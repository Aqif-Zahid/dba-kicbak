import { Chat } from "@/components/messages/chat";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages",
};

export default function MessagesPage() {
  return <Chat />;
}
