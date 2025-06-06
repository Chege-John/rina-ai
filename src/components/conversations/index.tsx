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
    <div className="py-3 px-0">
      <TabsMenu triggers={TABS_MENU}>
        <TabsContent value="unread">
          <ConversationSearch domains={domains} register={register} />
          <div className="flex flex-col">
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
                <CardDescription className="font-semibold">
                  No chats for your domain
                </CardDescription>
              )}
            </Loader>
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
