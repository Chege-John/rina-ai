"use client";

import { useChatWindow } from "@/hooks/conversation/use-conversation";
import React from "react";
import { Loader } from "../loader";
import Bubble from "../chatbot/bubble";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { PaperclipIcon, Send, MoreHorizontal, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

// type Props = {};

const Messenger = () => {
  const {
    messageWindowRef,
    chats,
    loading,
    chatRoom,
    onHandleSentMessage,
    register,
  } = useChatWindow();

  console.log("DEBUG: Messenger chatRoom:", chatRoom);

  return (
    <div className="flex-1 flex flex-col h-full relative bg-gray-50/50">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-white flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          {chatRoom ? (
            <>
               <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-orange-100">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chatRoom}`} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                  Customer Support
                  <span className="bg-green-100 text-green-600 text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Online
                  </span>
                </h3>
                <p className="text-xs text-gray-500">Replying to {chatRoom}</p>
              </div>
            </>
          ) : (
             <div className="flex flex-col">
                <h3 className="font-bold text-sm text-gray-800">Select a conversation</h3>
             </div>
          )}
        </div>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 w-full flex flex-col overflow-y-auto bg-[#fdfdfd]">
        <Loader loading={loading}>
          <div
            ref={messageWindowRef}
            className="w-full flex-1 flex flex-col gap-4 p-6 chat-window"
          >
            {chats.length ? (
              chats.map((chat) => (
                <Bubble
                  key={chat.id}
                  message={{ role: chat.role!, content: chat.message }}
                  createdAt={chat.createdAt}
                  isOwnerView={true}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Send className="w-8 h-8 text-gray-300 ml-1" />
                </div>
                <p className="text-sm font-medium">No messages yet</p>
                <p className="text-xs mt-1">Start the conversation below</p>
              </div>
            )}
          </div>
        </Loader>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t sticky bottom-0 z-10">
        <form
          onSubmit={onHandleSentMessage}
          className="flex items-center gap-3 w-full bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-orange-100 focus-within:border-orange-300 transition-all shadow-sm"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-gray-600 hover:bg-transparent rounded-full h-10 w-10"
          >
            <PaperclipIcon className="h-5 w-5" />
          </Button>
          <Input
            {...register("content")}
            placeholder="Type your message..."
            className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 px-2 text-gray-700 placeholder:text-gray-400 h-10"
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white h-10 w-10 shadow-md transition-transform active:scale-95"
            disabled={!chatRoom}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <div className="text-[10px] text-center text-gray-300 mt-2 flex justify-center items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Encrypted & Secure
        </div>
      </div>
    </div>
  );
};

export default Messenger;
