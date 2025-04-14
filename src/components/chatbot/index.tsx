/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useChatBot } from "@/hooks/chatbot/use-chatbot";
import React, { useEffect } from "react";
import BotWindow from "./window";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { BotIcon } from "lucide-react";

type Props = {};

const AiChatBot = (props: Props) => {
  const {
    onOpenChatBot,
    botOpened,
    onChats,
    register,
    onStartChatting,
    onAiTyping,
    messageWindowRef,
    currentBot,
    loading,
    onRealTime,
    setOnChats,
  } = useChatBot();

  // Log key state for debugging
  useEffect(() => {
    console.log("DEBUG: Register in AiChatBot:", register);
    console.log("DEBUG: onStartChatting in AiChatBot:", onStartChatting);
    console.log("Component re-rendered with:");
    console.log("currentBot:", currentBot);
    console.log("Bot icon URL:", currentBot?.chatbot?.icon);
  }, [currentBot, loading, botOpened, register, onStartChatting]);

  return (
    <div className="h-screen flex flex-col justify-end items-end gap-4 ">
      <BotWindow
        register={register}
        chats={onChats}
        onChat={onStartChatting}
        onResponding={onAiTyping}
        domainName={currentBot?.name || "Chat Assistant"}
        theme={currentBot?.chatbot?.background || "#ffffff"} // Fixed to lowercase
        textColor={currentBot?.chatbot?.textColor || "#000000"} // Fixed to lowercase
        help={currentBot?.chatbot?.helpdesk || ""} // Fixed to lowercase
        realtimeMode={onRealTime}
        helpdesk={currentBot?.helpdesk || []}
        setChat={setOnChats}
        ref={messageWindowRef}
      />
      <div
        className={cn(
          "rounded-full relative cursor-pointer w-20 h-20 flex items-center justify-center transition-all duration-300 ease-in-out",
          loading ? "bg-gray-200" : "",
          !loading && currentBot?.chatbot?.icon
            ? "bg-transparent shadow-none"
            : "shadow-md bg-orange-300"
        )}
        onClick={loading ? undefined : onOpenChatBot}
      >
        {loading ? (
          // Show loading spinner when loading
          <div className="animate-spin h-8 w-8 border-4 border-orange-300 border-t-transparent rounded-full"></div>
        ) : currentBot?.chatbot?.icon ? ( // Fixed to lowercase
          // Using error boundary for Image component
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <Image
              src={`https://ucarecdn.com/${
                currentBot.chatbot.icon || "default-icon" // Fixed to lowercase
              }/`}
              alt="bot"
              fill
              className="object-cover p-2" //
              onError={(e) => {
                console.error("Failed to load bot icon");
                e.currentTarget.style.display = "none";
                // Show fallback icon when image fails to load
                const fallback = document.createElement("div");
                fallback.className =
                  "w-full h-full flex items-center justify-center";
                fallback.innerHTML =
                  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>';
                e.currentTarget.parentNode?.appendChild(fallback);
              }}
            />
          </div>
        ) : (
          <BotIcon
            size={70}
            className="bg-orange-400 rounded-full"
            color={currentBot?.chatbot?.textColor || "#e07e16"} // Fixed to lowercase
          />
        )}
      </div>
    </div>
  );
};

export default AiChatBot;
