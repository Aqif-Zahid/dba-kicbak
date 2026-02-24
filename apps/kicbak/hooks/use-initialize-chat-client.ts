"use client";
import { useUser } from "@/providers/auth-provider";
import axios from "axios";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";

export const useInitializeChatClient = () => {
  const { user } = useUser();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);

  useEffect(() => {
    if (!user?.defaultProfileId) return;

    const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY!);

    let isMounted = true;

    const connect = async () => {
      try {
        const { data } = await axios.get("/api/get-token");
        const token = data?.token;

        await client.connectUser(
          {
            id: String(user.defaultProfileId),
            username: user.username,
            name: user.displayName,
            image: user.image,
          },
          token
        );

        if (isMounted) setChatClient(client);
      } catch (error) {
        console.error("Failed to connect to StreamChat:", error);
      }
    };

    connect();

    return () => {
      isMounted = false;
      setChatClient(null);

      client
        .disconnectUser()
        .then(() => console.log("StreamChat disconnected"))
        .catch((error) =>
          console.error("Failed to disconnect StreamChat:", error)
        );
    };
  }, [user]);

  return chatClient;
};
