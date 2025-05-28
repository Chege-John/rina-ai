/* eslint-disable @typescript-eslint/no-unused-vars */
import { onAiChatBotAssistant, onGetCurrentChatBot } from "@/actions/bot";
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
  role: ChatRole;
  content: string;
  link?: string;
}

interface AiChatBotMessage {
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
        height: botOpened ? 730 : 730,
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

      const userMessage: AiChatBotMessage = {
        role: "user",
        content: values.content ?? "User sent an empty message",
      };

      setOnChats((prev) => [...prev, userMessage]);

      setOnAiTyping(true);
      console.log("DEBUG: Before calling onAiChatBotAssistant");
      console.log(
        "DEBUG: currentBotId before calling onAiChatBotAssistant:",
        currentBotId
      );
      console.log(
        "DEBUG: onChats before calling onAiChatBotAssistant:",
        onChats
      );
      console.log(
        "DEBUG: values.content before calling onAiChatBotAssistant:",
        values.content
      );
      try {
        if (currentBotId) {
          const filteredChats = onChats.filter(
            (msg) => msg.role === "assistant" || msg.role === "user"
          ) as { role: "assistant" | "user"; content: string; link?: string }[];

          const response = await Promise.race([
            onAiChatBotAssistant(
              currentBotId,
              filteredChats as unknown as {
                role: "assistant" | "user";
                content: string;
                link?: string;
              },
              "user",
              values.content
            ),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Request timed out")), 15000)
            ),
          ]);

          console.log("DEBUG: Response:", response);
          setOnAiTyping(false);

          const safeResponse: AiChatBotResponse = response ?? {
            response: {
              role: "assistant",
              content: "Sorry, I couldn't process your request.",
            },
          };

          if (safeResponse.live) {
            setOnRealTime({
              chatroom: safeResponse.chatRoom ?? "default-chatroom",
              mode: safeResponse.live.toString(),
            });
          } else if (safeResponse.response) {
            setOnChats((prev) => [
              ...prev,
              safeResponse.response as ChatMessage,
            ]);
          } else {
            setOnChats((prev) => [
              ...prev,
              { role: "assistant", content: "No response received" },
            ]);
          }
        } else {
          console.log(
            "DEBUG: currentBotId is null, onAiChatBotAssistant not called."
          );
          setOnAiTyping(false);
          setOnChats((prev) => [
            ...prev,
            { role: "assistant", content: "Sorry, something went wrong!" },
          ]);
        }
        reset();
      } catch (error) {
        console.error("DEBUG: Error in onAiChatBotAssistant:", error);
        setOnAiTyping(false);
        setOnChats((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, something went wrong!" },
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
    setOnChats,
    register,
  };
};

export const useRealTime = (
  chatRoom: string,
  setChats: React.Dispatch<React.SetStateAction<ChatMessage[]>>
) => {
  useEffect(() => {
    pusherClient.subscribe(chatRoom);
    pusherClient.bind("realtime-mode", (data: { chat: ChatMessage }) => {
      setChats((prev) => [
        ...prev,
        {
          role: data.chat.role,
          content: data.chat.content,
        },
      ]);
    });

    return () => pusherClient.unsubscribe("realtime-mode");
  }, [chatRoom, setChats]);
};
