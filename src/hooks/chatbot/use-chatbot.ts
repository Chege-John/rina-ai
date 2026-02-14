/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  onAiChatBotAssistant,
  onGetCurrentChatBot,
  onRealTimeChatMessage,
} from "@/actions/bot";
import { onRealTimeChat } from "@/actions/conversation";
import { postToParent, pusherClient } from "@/lib/utils";
import {
  ChatBotMessageProps,
  ChatBotMessageSchema,
} from "@/schemas/conversation.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { UploadClient } from "@uploadcare/upload-client";

const upload = new UploadClient({
  publicKey: process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY as string,
});

// Define types
type ChatRole = "assistant" | "user" | "owner";

interface ChatMessage {
  id?: string;
  clientId?: string;
  role: ChatRole;
  content: string;
  link?: string;
}

interface AiChatBotMessage {
  id?: string;
  role: "assistant" | "user";
  content: string;
  link?: string;
}

interface AiChatBotResponse {
  response?: ChatMessage;
  live?: boolean;
  chatRoom?: string;
}

export const useChatBot = () => {
  const { register, handleSubmit, reset } = useForm<ChatBotMessageProps>({
    resolver: zodResolver(ChatBotMessageSchema),
  });

  const [currentBot, setCurrentBot] = useState<
    | {
        name: string;
        chatbot: {
          id: string;
          icon: string | null;
          welcomeMessage: string | null;
          background?: string;
          textColor?: string;
          helpdesk?: string;
        } | null;
        helpdesk: {
          id: string;
          question: string;
          answer: string;
          domainId: string | null;
        }[];
      }
    | undefined
  >();

  const messageWindowRef = useRef<HTMLDivElement | null>(null);
  const [botOpened, setBotOpened] = useState<boolean>(false);
  const onOpenChatBot = () => setBotOpened((prev) => !prev);
  const [loading, setLoading] = useState<boolean>(true);

  const [onChats, setOnChats] = useState<ChatMessage[]>([]);
  const [onAiTyping, setOnAiTyping] = useState<boolean>(false);
  const [currentBotId, setCurrentBotId] = useState<string>();
  const [onRealTime, setOnRealTime] = useState<
    { chatroom: string; mode: string } | undefined
  >(undefined);

  const onScrollToBottom = () => {
    messageWindowRef.current?.scroll({
      top: messageWindowRef.current.scrollHeight,
      left: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    onScrollToBottom();
  }, [onChats, messageWindowRef]);

  useEffect(() => {
    postToParent(
      JSON.stringify({
        width: botOpened ? 550 : 80,
        height: botOpened ? 720 : 720,
      })
    );
  }, [botOpened]);

  useEffect(() => {
    let requestMade = false;
    const messageHandler = (e: MessageEvent) => {
      if (typeof e.data === "string" && e.data.match(/^[a-zA-Z0-9-]+$/)) {
        const botid = e.data;
        if (!requestMade) {
          onGetDomainChatBot(botid);
          requestMade = true;
        }
      }
    };
    window.addEventListener("message", messageHandler);
    return () => window.removeEventListener("message", messageHandler);
  }, []);

  const onGetDomainChatBot = async (id: string) => {
    try {
      setCurrentBotId(id);
      const chatbot = await onGetCurrentChatBot(id);
      console.log("🌐 Chatbot data returned from server:", chatbot);
      console.log("🔍 Chatbot details:", chatbot?.chatbot);

      if (chatbot && chatbot.chatbot) {
        setOnChats((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              chatbot?.chatbot?.welcomeMessage ??
              "Welcome! How can I help you today?",
          },
        ]);
        setCurrentBot(chatbot);
      } else {
        console.warn(
          "⚠️ No chatbot data returned - using default configuration"
        );
        const defaultBot = {
          name: "Assistant",
          chatbot: {
            id: "default",
            icon: null,
            welcomeMessage: "Welcome! How can I help you today?",
          },
          helpdesk: [],
        };
        setOnChats((prev) => [
          ...prev,
          { role: "assistant", content: defaultBot.chatbot.welcomeMessage },
        ]);
        setCurrentBot(defaultBot);
      }
    } catch (error) {
      console.error("❌ Error in onGetDomainChatBot:", error);
      const defaultBot = {
        name: "Assistant",
        chatbot: {
          id: "default",
          icon: null,
          welcomeMessage: "Sorry, I encountered an error. How can I help you?",
        },
        helpdesk: [],
      };
      setOnChats((prev) => [
        ...prev,
        { role: "assistant", content: defaultBot.chatbot.welcomeMessage },
      ]);
      setCurrentBot(defaultBot);
    } finally {
      setLoading(false);
    }
  };

  const onStartChatting = async (values: ChatBotMessageProps) => {
    console.log("DEBUG: onStartChatting triggered with values:", values);

    if (values.content) {
      console.log("DEBUG: Processing content:", values.content);

      const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Optimistic update with a clientId for instant feedback
      const userMessage: ChatMessage = {
        clientId,
        role: "user",
        content: values.content,
      };
      setOnChats((prev) => [...prev, userMessage]);

      setOnAiTyping(true);
      console.log("DEBUG: Before calling onAiChatBotAssistant");
      try {
        if (onRealTime?.mode === "true") {
          console.log("DEBUG: Already in realtime mode, sending via onRealTimeChatMessage");
          const response = await onRealTimeChatMessage(
            onRealTime.chatroom,
            values.content,
            "user",
            clientId
          );
          console.log("DEBUG: Realtime message response:", response);
          setOnAiTyping(false);
          reset();
          return;
        }

        if (currentBotId) {
          const filteredChats = onChats.filter(
            (msg) => msg.role === "assistant" || msg.role === "user"
          ) as { role: "assistant" | "user"; content: string; link?: string }[];

          const response = await Promise.race([
            onAiChatBotAssistant(
              currentBotId,
              filteredChats,
              "user",
              values.content
            ),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Request timed out")), 30000)
            ),
          ]);

          console.log("DEBUG: Response from onAiChatBotAssistant:", response);
          setOnAiTyping(false);

          const safeResponse: AiChatBotResponse = response ?? {
            response: {
              role: "assistant",
              content: "Sorry, I couldn't process your request.",
            },
          };

          if (safeResponse.live) {
            console.log("DEBUG: Switching to realtime mode", safeResponse.chatRoom);
            const chatRoomId = safeResponse.chatRoom || "default-chatroom";
            if (safeResponse.response) {
              setOnChats((prev) => [
                ...prev,
                safeResponse.response as ChatMessage,
              ]);
              
              // Also trigger real-time event for the AI's hand-off message
              await onRealTimeChat(
                chatRoomId,
                safeResponse.response.content,
                "ai-handoff",
                "assistant"
              );
            }
            setOnRealTime({
              chatroom: chatRoomId,
              mode: "true",
            });
          } else if (safeResponse.response) {
            setOnChats((prev) => [
              ...prev,
              safeResponse.response as ChatMessage,
            ]);
          }
        } else {
          console.error("❌ currentBotId is null, cannot call assistant");
          setOnAiTyping(false);
          setOnChats((prev) => [
            ...prev,
            { role: "assistant", content: "Sorry, something went wrong! (Missing Bot ID)" },
          ]);
        }
        reset();
      } catch (error: any) {
        console.error("❌ Error in onStartChatting:", error);
        setOnAiTyping(false);
        setOnChats((prev) => [
          ...prev,
          { role: "assistant", content: `Sorry, something went wrong! ${error.message || ""}` },
        ]);
      }
    }
  };

  return {
    onStartChatting,
    onOpenChatBot,
    botOpened,
    loading,
    onChats,
    messageWindowRef,
    onAiTyping,
    currentBot,
    onRealTime,
    setOnRealTime,
    setOnChats,
    register,
    reset,
  };
};

export const useRealTime = (
  chatRoom: string,
  setChats: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setRealTime: React.Dispatch<
    React.SetStateAction<{ chatroom: string; mode: string } | undefined>
  >
) => {
  useEffect(() => {
    const channel = pusherClient.subscribe(chatRoom);

    channel.bind("realtime-toggle", (data: { live: boolean }) => {
      console.log("DEBUG: Mode toggle received:", data.live);
      if (data.live) {
        setRealTime({ chatroom: chatRoom, mode: "true" });
      } else {
        setRealTime(undefined);
      }
    });

    channel.bind("realtime-mode", (data: { chat: any }) => {
      console.log("DEBUG: Received realtime message via Pusher:", data.chat);
      setChats((prev) => {
        // 1. Check if this specific message (by real database ID) already exists
        if (data.chat.id && prev.some((msg) => msg.id === data.chat.id)) {
          return prev;
        }

        // 2. Check for optimistic match using clientId (the most robust way)
        if (data.chat.clientId) {
          const optimisticIndex = prev.findIndex(
            (msg) => msg.clientId === data.chat.clientId
          );
          if (optimisticIndex !== -1) {
            const updatedChats = [...prev];
            updatedChats[optimisticIndex] = {
              id: data.chat.id,
              role: data.chat.role === "OWNER" 
                ? "owner" 
                : data.chat.role === "assistant" 
                ? "assistant"
                : "user",
              content: data.chat.message,
            };
            return updatedChats;
          }
        }

        // 3. Fallback: Check if we have an optimistic message by content/role (if clientId somehow missing)
        const incomingContent = data.chat.message.trim();
        const incomingRole = data.chat.role === "OWNER" 
          ? "owner" 
          : data.chat.role === "assistant" 
          ? "assistant" 
          : "user";

        const contentMatchIndex = prev.findIndex(
          (msg) =>
            msg.clientId && // Only match against optimistic messages
            msg.content.trim() === incomingContent &&
            msg.role === incomingRole
        );

        const newMessage: ChatMessage = {
          id: data.chat.id,
          role: incomingRole as ChatRole,
          content: data.chat.message,
        };

        if (contentMatchIndex !== -1) {
          const updatedChats = [...prev];
          updatedChats[contentMatchIndex] = newMessage;
          return updatedChats;
        }

        // 4. If no duplicate and no match, add as new
        return [...prev, newMessage];
      });
    });

    return () => {
      channel.unbind("realtime-mode");
      pusherClient.unsubscribe(chatRoom);
    };
  }, [chatRoom, setChats]);
};
