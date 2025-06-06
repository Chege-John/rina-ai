import {
  onGetChatMessages,
  onGetDomainChatRooms,
  onOwnerSendMessage,
  onRealTimeChat,
  onViewUnReadMessages,
} from "@/actions/conversation";
import { useChatContext } from "@/context/user-chat-context";
import { getMonthName, pusherClient } from "@/lib/utils";
import {
  ChatBotMessageSchema,
  ConversationSearchSchema,
  ConversationSearchProps,
} from "@/schemas/conversation.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

interface RealtimeData {
  chat: {
    id: string;
    message: string;
    createdAt: Date;
    role: "assistant" | "user" | null;
    seen: boolean;
  };
}

export const useConversation = () => {
  const { register, watch } = useForm<ConversationSearchProps>({
    resolver: zodResolver(ConversationSearchSchema),
    mode: "onChange",
  });
  const { setLoading: loadMessages, setChats, setChatRoom } = useChatContext();
  const [chatRooms, setChatRooms] = useState<
    {
      chatRoom: {
        id: string;
        createdAt: Date;
        message: {
          message: string;
          createdAt: Date;
          seen: boolean;
        }[];
      }[];
      email: string | null;
    }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const search = watch(async (value) => {
      // Fix 1: Add null/undefined check for domain
      if (!value.domain) {
        console.log("No domain provided");
        setChatRooms([]);
        return;
      }

      setLoading(true);
      try {
        const rooms = await onGetDomainChatRooms(value.domain);

        setLoading(false);
        if (rooms && rooms.customer) {
          setChatRooms(rooms.customer);
        } else {
          setChatRooms([]);
          console.log("No chat rooms found for domain:");
        }
      } catch (error) {
        setLoading(false);
        console.error("Error fetching chat rooms:", error);
        setChatRooms([]);
      }
    });
    return () => search.unsubscribe();
  }, [watch]);

  const onGetActiveChatMessages = async (id: string) => {
    try {
      loadMessages(true);
      const messages = await onGetChatMessages(id);

      if (messages && Array.isArray(messages) && messages.length > 0) {
        setChatRoom(id);
        const firstMessage = messages[0];
        if (
          firstMessage &&
          "message" in firstMessage &&
          Array.isArray(firstMessage.message)
        ) {
          const transformedMessages = firstMessage.message.map((msg) => ({
            message: msg.message,
            id: msg.id,
            createdAt: msg.createdAt,
            role: msg.role as "assistant" | "user" | null,
            seen: false,
          }));
          setChats(transformedMessages);
        } else {
          setChats([]);
        }
      } else {
        setChatRoom(id);
        setChats([]);
      }
      loadMessages(false);
    } catch (error) {
      console.log("Error in onGetActiveChatMessages:", error);
      loadMessages(false);
      setChats([]);
    }
  };

  return {
    register,
    loading,
    chatRooms,
    onGetActiveChatMessages,
  };
};

export const useChatTime = (createdAt: Date, roomId: string) => {
  const { chatRoom } = useChatContext();
  const [messageSentAt, setMessageSentAt] = useState<string>();
  const [urgent, setUrgent] = useState<boolean>(false);

  const onSetMessageReceivedDate = useCallback(() => {
    const dt = new Date(createdAt);
    const current = new Date();
    const currentDate = current.getDate();
    const hr = dt.getHours();
    const min = dt.getMinutes();
    const date = dt.getDate();
    const month = dt.getMonth();
    const difference = currentDate - date;

    if (difference <= 0) {
      const formattedHr = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
      const formattedMin = min.toString().padStart(2, "0");
      const period = hr >= 12 ? "PM" : "AM";
      setMessageSentAt(`${formattedHr}:${formattedMin} ${period}`);

      if (current.getHours() - dt.getHours() > 2) {
        setUrgent(true);
      }
    } else {
      setMessageSentAt(`${date} ${getMonthName(month)}`);
    }
  }, [createdAt]);

  const onSeenChat = useCallback(async () => {
    if (chatRoom === roomId && urgent) {
      await onViewUnReadMessages(roomId);
      setUrgent(false);
    }
  }, [chatRoom, roomId, urgent]);

  useEffect(() => {
    onSeenChat();
  }, [chatRoom, onSeenChat]);

  useEffect(() => {
    onSetMessageReceivedDate();
  }, [createdAt, onSetMessageReceivedDate, roomId]);

  return {
    messageSentAt,
    urgent,
    onSeenChat,
  };
};

export const useChatWindow = () => {
  const { chats, loading, chatRoom, setChats } = useChatContext();
  const messageWindowRef = useRef<HTMLDivElement | null>(null);
  const { register, handleSubmit, reset } = useForm({
    resolver: zodResolver(ChatBotMessageSchema),
    mode: "onChange",
  });

  const onScrollToBottom = () => {
    messageWindowRef.current?.scroll({
      top: messageWindowRef.current.scrollHeight,
      left: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    onScrollToBottom();
  }, [chats, messageWindowRef]);

  useEffect(() => {
    if (chatRoom) {
      pusherClient.subscribe(chatRoom);
      pusherClient.bind("realtime-mode", (data: RealtimeData) => {
        setChats((prev) => [...prev, data.chat]);
      });
      return () => {
        pusherClient.unbind("realtime-mode");
        pusherClient.unsubscribe(chatRoom);
      };
    }
  }, [chatRoom, setChats]);

  const onHandleSentMessage = handleSubmit(async (values) => {
    if (!chatRoom) {
      console.error("No active chat room");
      return;
    }

    if (!values.content || values.content.trim() === "") {
      console.error("Message content is required");
      return;
    }

    try {
      const message = await onOwnerSendMessage(
        chatRoom,
        values.content,
        "assistant"
      );

      if (
        message &&
        message.message &&
        Array.isArray(message.message) &&
        message.message.length > 0
      ) {
        const transformedMessage = {
          message: message.message[0].message,
          id: message.message[0].id,
          createdAt: message.message[0].createdAt,
          role: message.message[0].role as "assistant" | "user" | null,
          seen: false,
        };

        setChats((prev) => [...prev, transformedMessage]);
        await onRealTimeChat(
          chatRoom,
          message.message[0].message,
          message.message[0].id,
          "assistant"
        );
        reset();
      }
    } catch (error) {
      console.log("Error sending message:", error);
    }
  });

  return {
    messageWindowRef,
    chats,
    loading,
    chatRoom,
    onHandleSentMessage,
    register,
  };
};
