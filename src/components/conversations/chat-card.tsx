"use client";

import { useChatTime } from "@/hooks/conversation/use-conversation";
import React from "react";
import { Card, CardContent, CardDescription } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { MessageSquareWarning, User } from "lucide-react";

type Props = {
  seen?: boolean;
  id: string;
  onChat(): void;
  createdAt: Date;
  title: string;
  description?: string;
};

const ChatCard = ({
  seen,
  id,
  onChat,
  createdAt,
  title,
  description,
}: Props) => {
  const { messageSentAt, urgent } = useChatTime(createdAt, id);
  return (
    <Card
      onClick={onChat}
      className="rounded-xl border-none shadow-none hover:bg-orange-50 cursor-pointer
      transition-all duration-200 ease-in-out group my-1 mx-2"
    >
      <CardContent className="p-3 flex gap-3 items-center">
        <div className="relative">
          <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-orange-200 transition-all">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${title}`} />
            <AvatarFallback className="bg-orange-100 text-orange-600">
              <User />
            </AvatarFallback>
          </Avatar>
           {!seen && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white"></span>}
        </div>
        
        <div className="flex-1 overflow-hidden">
          <div className="flex justify-between items-center mb-1">
            <h4 className="font-semibold text-sm text-gray-800 truncate max-w-[140px]">
              {title}
            </h4>
             <span className="text-[10px] text-gray-400 whitespace-nowrap">
              {createdAt ? messageSentAt : ""}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
             <p className="text-xs text-gray-500 truncate max-w-[160px] opacity-80 group-hover:opacity-100 transition-opacity">
              {description || "Start a conversation..."}
            </p>
             {urgent && !seen && <MessageSquareWarning className="h-3 w-3 text-orange-500 animate-pulse" />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatCard;
