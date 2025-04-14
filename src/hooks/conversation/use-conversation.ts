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
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

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
      console.log("Domain ID being sent to backend:", value.domain);
      setLoading(true);
      try {
        const rooms = await onGetDomainChatRooms(value.domain);
        console.log("Response from onGetDomainChatRooms:", rooms);

        setLoading(false);
        if (rooms && rooms.customer) {
          setChatRooms(rooms.customer);
        } else {
          setChatRooms([]); // Set to empty array if no rooms found
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
      if (messages && messages.length > 0) {
        setChatRoom(id);
        setChats(messages[0].message || []);
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

  const onSetMessageReceivedDate = () => {
    const dt = new Date(createdAt);
    const current = new Date();
    const currentDate = current.getDate();
    const hr = dt.getHours();
    const min = dt.getMinutes();
    const date = dt.getDate();
    const month = dt.getMonth();
    const difference = currentDate - date;

    if (difference <= 0) {
      setMessageSentAt(`${hr}:${min}${hr > 12 ? "PM" : "AM"}`);
      if (current.getHours() - dt.getHours() > 2) {
        setUrgent(true);
      }
    } else {
      setMessageSentAt(`${date} ${getMonthName(month)}`);
    }
  };

  const onSeenChat = async () => {
    if (chatRoom == roomId && urgent) {
      await onViewUnReadMessages(roomId);
      setUrgent(false);
    }
  };

  useEffect(() => {
    onSeenChat();
  }, [chatRoom]);

  useEffect(() => {
    onSetMessageReceivedDate();
  }, []);

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
      pusherClient.bind("realtime-mode", (data: any) => {
        setChats((prev) => [...prev, data.chat]);
      });
      return () => pusherClient.unsubscribe("realtime-mode");
    }
  }, [chatRoom]);

  const onHandleSentMessage = handleSubmit(async (values) => {
    try {
      const message = await onOwnerSendMessage(
        chatRoom!,
        values.content,
        "assistant"
      );
      if (message) {
        setChats((prev) => [...prev, message.message[0]]);
        await onRealTimeChat(
          chatRoom!,
          message.message[0].message,
          message.message[0].id,
          "assistant"
        );
      }
    } catch (error) {
      console.log(error);
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
