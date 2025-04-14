"use server";

import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/utils";

export const onToggleRealtime = async (id: string, state: boolean) => {
  try {
    const chatRoom = await prisma.chatRoom.update({
      where: {
        id,
      },
      data: {
        live: state,
      },
      select: {
        id: true,
        live: true,
      },
    });

    if (chatRoom) {
      return {
        status: 200,
        message: chatRoom.live
          ? "Realtime mode enabled"
          : "Realtime mode disabled",
        chatRoom,
      };
    }
  } catch (error) {
    console.log(error);
  }
};

export const onGetConversationMode = async (id: string) => {
  try {
    const mode = await prisma.chatRoom.findUnique({
      where: {
        id,
      },
      select: {
        live: true,
      },
    });
    console.log(mode);
    return mode;
  } catch (error) {
    console.log(error);
  }
};

export const onGetDomainChatRooms = async (id: string) => {
  console.log("Domain ID received by onGetDomainChatRooms:", id);

  try {
    const domain = await prisma.domain.findUnique({
      where: {
        id,
      },
      include: {
        customer: {
          include: {
            chatRoom: {
              include: {
                message: {
                  orderBy: {
                    createdAt: "desc",
                  },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (domain) {
      return domain;
    } else {
      console.log("No domain found with ID:", id);
      return { customer: [] };
    }
  } catch (error) {
    console.error("Error in onGetDomainChatRooms:", error);
    // Return a safe default instead of throwing the error
    return { customer: [] };
  }
};

export const onGetChatMessages = async (id: string) => {
  try {
    const messages = await prisma.chatRoom.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        live: true,
        message: {
          select: {
            id: true,
            role: true,
            message: true,
            createdAt: true,
            //  seen: true, // This is the problem!
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    console.log("Messages retrieved:", messages ? messages.message.length : 0);

    if (messages) {
      return messages ? [messages] : [];
    }
  } catch (error) {
    console.error("Error getting chat messages:", error);
    return { messages: [] };
  }
};

export const onViewUnReadMessages = async (id: string) => {
  try {
    await prisma.chatMessage.updateMany({
      where: {
        chatRoomId: id,
      },
      data: {
        seen: true,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const onRealTimeChat = async (
  id: string,
  chatroomId: string,
  message: string,
  role: "assistant" | "user"
) => {
  pusherServer.trigger(chatroomId, "realtime-mode", {
    chat: { message, role, id },
  });
};

export const onOwnerSendMessage = async (
  message: string,
  chatroom: string,
  role: "user" | "assistant"
) => {
  try {
    const chat = await prisma.chatRoom.update({
      where: {
        id: chatroom,
      },
      data: {
        message: {
          create: {
            message,
            role,
          },
        },
      },
      select: {
        message: {
          select: {
            id: true,
            role: true,
            message: true,
            createdAt: true,
            //  seen: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });
    if (chat) {
      return chat;
    }
  } catch (error) {
    console.log(error);
  }
};
