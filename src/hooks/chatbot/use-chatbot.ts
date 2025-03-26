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
interface ChatMessage {
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
  //WIP: Setup Realtime with Pusher
  const { register, handleSubmit, reset } = useForm<ChatBotMessageProps>({
    resolver: zodResolver(ChatBotMessageSchema),
  });

  const [currentBot, setCurrentBot] = useState<
    | {
        name: string;
        chatBot: {
          id: string;
          icon: string | null;
          welcomeMessage: string | null;
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

  /*const [onChats, setOnChats] = useState<
    { role: "assistant" | "user"; content: string; link?: string }[]
  >([]);*/

  const [onChats, setOnChats] = useState<
    { role: "assistant" | "user"; content: string; link?: string }[]
  >([]);
  const [onAiTyping, setOnAiTyping] = useState<boolean>(false);
  const [currentBotId, setCurrentBotId] = useState<string>();
  const [onRealTime, setOnRealTime] = useState<
    { chatroom: string; mode: boolean } | undefined
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
        height: botOpened ? 800 : 80,
      })
    );
  }, [botOpened]);

  // let limitRequest = 0;

  useEffect(() => {
    let requestMade = false;
    const messageHandler = (e: MessageEvent) => {
      // ... existing message handler logic ...
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

  {
    /*const onGetDomainChatBot = async (id: string) => {
    console.log("👾 Debug: Function onGetCurrentChatBot is being called.", id);

    try {
      setCurrentBotId(id);
      const chatbot = await onGetCurrentChatBot(id);

      console.log("🌐 Chatbot data returned from server:", chatbot);

      if (chatbot) {
        setOnChats((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              chatbot.chatBot?.welcomeMessage ||
              "Welcome! How can I help you today?",
          },
        ]);
        setCurrentBot(chatbot);
      } else {
        console.warn(
          "⚠️ No chatbot data returned - using default configuration"
        );
        // Set a default bot if the API returned null
        const defaultBot = {
          name: "Assistant",
          chatBot: {
            id: "default",
            icon: null,
            welcomeMessage: "Welcome! How can I help you today?",
            background: "#ffffff", // orange-500
            textColor: "#000000",
            helpdesk: null,
          },
          helpdesk: [],
        };

        setCurrentBot(defaultBot);
        setOnChats((prev) => [
          ...prev,
          { role: "assistant", content: "Welcome! How can I help you today?" },
        ]);
      }
    } catch (error) {
      console.error("❌ Error in onGetDomainChatBot:", error);
      // Same default bot on error
      const defaultBot = {
        name: "Assistant",
        chatBot: {
          id: "default",
          icon: null,
          welcomeMessage: "Sorry, I encountered an error. How can I help you?",
          background: "#f97316",
          textColor: "#ffffff",
          helpdesk: null,
        },
        helpdesk: [],
      };

      setCurrentBot(defaultBot);
      setOnChats((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. How can I help you?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };*/
  }

  const onGetDomainChatBot = async (id: string) => {
    try {
      setCurrentBotId(id);
      const chatbot = await onGetCurrentChatBot(id);
      console.log("🌐 Chatbot data returned from server:", chatbot);
      console.log("🔍 Chatbot details:", chatbot?.chatbot); // Corrected to lowercase

      if (chatbot && chatbot.chatbot) {
        setOnChats((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              chatbot.chatbot.welcomeMessage ||
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
            // Changed to lowercase
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
          // Changed to lowercase
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

  {
    /*const onStartChatting = handleSubmit(async (values) => {
    console.log("onStartChatting called with:", values);
    reset();
    if (values.image.length) {
      const uploaded = await upload.uploadFile(values.image[0]);
      setOnChats((prev: any) => [
        ...prev,
        { role: "user", content: uploaded.uuid },
      ]);
      setOnAiTyping(true);
      const response = await onAiChatBotAssistant(
        currentBotId!,
        onChats,
        "user",
        uploaded.uuid
      );
      console.log("Response:", response);
      if (response) {
        setOnAiTyping(false);
        if (response.live) {
          setOnRealTime((prev) => ({
            ...prev,
            chatroom: response.chatRoom,
            mode: response.live,
          }));
        } else {
          setOnChats((prev: any) => [...prev, response.response]);
        }
      }
    }

    if (values.content) {
      setOnChats((prev: any) => [
        ...prev,
        { role: "user", content: values.content },
      ]);
      setOnAiTyping(true);

      console.log("Calling onAiChatBotAssistant with:", {
        currentBotId,
        onChats,
        role: "user",
        content: values.content,
      });

      const response = await onAiChatBotAssistant(
        currentBotId!,
        onChats,
        "user",
        values.content
      );
      console.log("Response from onAiChatBotAssistant:", response);

      if (response) {
        setOnAiTyping(false);
        if (response.live) {
          setOnRealTime((prev) => ({
            ...prev,
            chatroom: response.chatRoom,
            mode: response.live,
          }));
        } else {
          setOnChats((prev: any) => [...prev, response.response]);
        }
      } else {
        console.log("No response received from onAiChatBotAssistant");
        setOnAiTyping(false); // Reset typing state even if no response
      }
    }
  });*/
  }

  const onStartChatting = async (values: ChatBotMessageProps) => {
    console.log("DEBUG: onStartChatting triggered with values:", values);
    reset();
    if (values.content) {
      console.log("DEBUG: Processing content:", values.content);
      setOnChats((prev) => [
        ...prev,
        {
          role: "user",
          content: values.content ?? "User sent an empty message",
        },
      ]);
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
          const response = await Promise.race([
            onAiChatBotAssistant(currentBotId, onChats, "user", values.content),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Request timed out")), 10000)
            ),
          ]);
          console.log("DEBUG: Response:", response);
          setOnAiTyping(false);
          if (response) {
            if (response.live) {
              setOnRealTime({
                chatroom: response.chatRoom,
                mode: response.live,
              });
            } else if (response.response) {
              setOnChats((prev) => [...prev, response.response]);
            } else {
              console.log("DEBUG: Response has no valid content");
            }
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
      } catch (error) {
        console.error("DEBUG: Error in onAiChatBotAssistant:", error); // Log the error object
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

{
  /*
  export const useRealTime = (
  chatRoom: string,
  setChats: React.Dispatch<
    React.SetStateAction<
      {
        role: "assistant" | "user";
        content: string;
        link?: string | undefined;
      }[]
    >
  >
) => {
  useEffect(() => {
    pusherClient.subscribe(chatRoom);
    pusherClient.bind("realtime-mode", (data: any) => {
      setChats((prev) => [
        ...prev,
        { role: data.chat.role, content: data.chat.message },
      ]);
    });
    return () => pusherClient.unsubscribe("realtime-mode");
  }, []);
};*/
}
