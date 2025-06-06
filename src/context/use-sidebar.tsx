"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useChatContext } from "./user-chat-context";
import { toast } from "@/components/ui/toast";
import {
  onGetConversationMode,
  onToggleRealtime,
} from "@/actions/conversation";
import { useClerk } from "@clerk/nextjs";

const useSideBar = () => {
  const [expand, setExpand] = useState<boolean | undefined>(undefined);
  const router = useRouter();
  const pathname = usePathname();
  const [realtime, setRealtime] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const { chatRoom } = useChatContext();

  const onActivateRealtime = async (checked: boolean) => {
    try {
      setLoading(true);
      const result = await onToggleRealtime(chatRoom!, checked);
      if (result) {
        setRealtime(result.chatRoom.live);
        toast({
          title: "Success",
          description: result.message,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const onGetCurrentMode = useCallback(async () => {
    setLoading(true);
    const mode = await onGetConversationMode(chatRoom!);
    if (mode) {
      setRealtime(mode.live);
    }
    setLoading(false);
  }, [chatRoom]);

  useEffect(() => {
    if (chatRoom) {
      onGetCurrentMode();
    }
  }, [chatRoom, onGetCurrentMode]);

  const page = pathname.split("/").pop();
  const { signOut } = useClerk();

  const onSignOut = () => signOut(() => router.push("/"));

  const onExpand = () => setExpand((prev) => !prev);

  return {
    expand,
    onExpand,
    page,
    onSignOut,
    realtime,
    onActivateRealtime,
    chatRoom,
    loading,
  };
};

export default useSideBar;
