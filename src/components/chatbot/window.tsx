/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatBotMessageProps } from "@/schemas/conversation.schema";
import React, { forwardRef } from "react";
import { UseFormRegister } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import RealTimeMode from "./real-time";
import Image from "next/image";
import TabsMenu from "../tabs";
import { BOT_TABS_MENU } from "@/constants/menu";
import { Send } from "lucide-react";
import { TabsContent } from "@radix-ui/react-tabs";
import { Separator } from "../ui/separator";
import Bubble from "./bubble";
import { Responding } from "./responding";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { CardDescription, CardTitle } from "../ui/card";
import Accordion from "../accordian";

type Props = {
  register: UseFormRegister<ChatBotMessageProps>;
  chats: {
    role: "assistant" | "user" | "owner";
    content: string;
    link?: string;
  }[];
  onChat(): void;
  onResponding: boolean;
  domainName: string;
  theme?: string;
  textColor?: string | null;
  help?: string;
  realtimeMode:
    | {
        chatroom: string;
        mode: string;
      }
    | undefined;
  helpdesk: {
    id: string;
    question: string;
    answer: string;
    domainId: string | null;
  }[];
  setChat: React.Dispatch<
    React.SetStateAction<
      {
        role: "assistant" | "user" | "owner";
        content: string;
        link?: string | undefined;
      }[]
    >
  >;
};

const BotWindow = forwardRef<HTMLDivElement, Props>(
  (
    {
      register,
      chats,
      onChat,
      onResponding,
      domainName,
      theme,
      textColor,
      help,
      realtimeMode,
      helpdesk,
      setChat,
    },
    ref
  ) => {
    return (
      <div
        className="h-[670px] w-[450px] flex flex-col bg-white 
    rounded-xl mr-[80px] border-[1px] overflow-hidden z-[9999]"
      >
        <div className="flex justify-between px-4 pt-4">
          <div className="flex gap-2">
            <Avatar className="w-20 h-20">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-bold leading-none">
                Sales Rep - Rina AI
              </h3>
              <p className="text-sm">
                {domainName ? domainName.split(".com")[0] : "unknown Domain"}
              </p>
              {realtimeMode?.mode && (
                <RealTimeMode
                  setChats={setChat}
                  chatRoomId={realtimeMode.chatroom}
                />
              )}
            </div>
          </div>
          <div className="relative w-16 h-16">
            <Image
              src="/images/prop-user.png"
              fill
              alt="prop-user"
              objectFit="contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
        <TabsMenu
          className="bg-transparent border-border m-2 "
          triggers={BOT_TABS_MENU}
        >
          <TabsContent value="chat">
            <Separator orientation="horizontal" className="bg-gray-200" />
            <div className="flex flex-col h-full">
              <div
                style={{ background: theme || "", color: textColor || "" }}
                className="px-3 flex h-[400px] flex-col py-5 gap-3 chat-window overflow-y-auto"
                ref={ref}
              >
                {chats.map((chat, key) => (
                  <Bubble key={key} message={chat} />
                ))}
                {onResponding && <Responding />}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  console.log("DEBUG: Form submitted manually");
                  const content = (e.target as any).content.value; // Get input value directly
                  console.log("DEBUG: Form content:", content);
                  onChat({ content }); // Pass values manually
                }}
                className="flex px-3 py-1 flex-col flex-1 bg-gray-200"
              >
                <div className="flex justify-between">
                  <Input
                    {...register("content")}
                    placeholder="Type your message here..."
                    className="focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 p-0 bg-slate-200 rounded-none outline-none border-none"
                  />
                  <Button type="submit" className="mt-3 bg-black text-white">
                    <Send />
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>
          <TabsContent value="helpdesk">
            <div className="h-[485px] overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4">
              <div>
                <CardTitle>Help Desk</CardTitle>
                <CardDescription>
                  Browse from a list of questions people usually ask.
                </CardDescription>
              </div>
              <Separator orientation="horizontal" className="bg-gray-200" />

              {helpdesk.map((desk) => {
                return (
                  <Accordion
                    key={desk.id}
                    trigger={desk.question}
                    content={desk.answer}
                  />
                );
              })}
            </div>
          </TabsContent>
        </TabsMenu>
        <div className="flex justify-center py-1">
          <p className="text-gray-500 text-xs">Powered by Rina-Ai</p>
        </div>
      </div>
    );
  }
);

export default BotWindow;
BotWindow.displayName = "BotWindow";
