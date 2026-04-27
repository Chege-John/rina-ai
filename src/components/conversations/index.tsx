"use client";

import { useConversation } from "@/hooks/conversation/use-conversation";
import React from "react";
import TabsMenu from "../tabs";
import { TABS_MENU } from "@/constants/menu";
import { TabsContent } from "../ui/tabs";
import ConversationSearch from "./search";
import { Loader } from "../loader";
import { CardDescription } from "../ui/card";
import ChatCard from "./chat-card";
import { Separator } from "../ui/separator";

type Props = {
  domains?:
    | {
        id: string;
        name: string;
        icon: string | null;
      }[]
    | undefined;
};

const ConversationMenu = ({ domains }: Props) => {
  const { onGetActiveChatMessages, register, chatRooms, loading } =
    useConversation();
  return (
    <div className="py-3 px-0 h-full flex flex-col">
      <div className="px-4 pb-4 border-b">
        <h2 className="text-xl font-bold">Inbox</h2>
        <p className="text-sm text-muted-foreground">Manage your conversations</p>
      </div>
      <TabsMenu triggers={TABS_MENU}>
        <TabsContent value="unread" className="flex-1 overflow-hidden flex flex-col mt-0">
          <div className="flex flex-col h-full">
            <ConversationSearch domains={domains} register={register} />
            <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-hide">
              <Loader loading={loading}>
                {chatRooms.length ? (
                  chatRooms.map((room) => (
                    <ChatCard
                      seen={room.chatRoom[0].message[0]?.seen}
                      id={room.chatRoom[0].id}
                      onChat={() => onGetActiveChatMessages(room.chatRoom[0].id)}
                      createdAt={room.chatRoom[0].message[0]?.createdAt}
                      key={room.chatRoom[0].id}
                      title={room.email!}
                      description={room.chatRoom[0].message[0]?.message}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <CardDescription className="font-semibold mb-2">
                      No chats for your domain
                    </CardDescription>
                    <p className="text-xs text-muted-foreground">
                      New conversations will appear here
                    </p>
                  </div>
                )}
              </Loader>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="all">
          <Separator orientation="horizontal" className="mt-5 bg-gray-200" />
          all
        </TabsContent>
        <TabsContent value="expired">
          <Separator orientation="horizontal" className="mt-5 bg-gray-200" />
          expired
        </TabsContent>
        <TabsContent value="starred">
          <Separator orientation="horizontal" className="mt-5 bg-gray-200" />
          starred
        </TabsContent>
      </TabsMenu>
    </div>
  );
};

export default ConversationMenu;
