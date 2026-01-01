"use client";

import { MiniChatTrigger } from "./mini-chat-trigger";
import { MiniChatWindow } from "./mini-chat-window";
import { useSession } from "@/lib/auth-client";

export function MiniChat() {
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <>
      <MiniChatTrigger />
      <MiniChatWindow />
    </>
  );
}
