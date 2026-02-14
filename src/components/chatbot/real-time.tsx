import React from "react";
import { Card } from "../ui/card";
import { useRealTime } from "@/hooks/chatbot/use-chatbot";

type Props = {
  chatRoomId: string;
  setChats: React.Dispatch<
    React.SetStateAction<
      {
        role: "assistant" | "user" | "owner";
        content: string;
        link?: string | undefined;
      }[]
    >
  >;
  setRealTime: React.Dispatch<
    React.SetStateAction<
      | {
          chatroom: string;
          mode: string;
        }
      | undefined
    >
  >;
};

const RealTimeMode = ({ chatRoomId, setChats, setRealTime }: Props) => {
  useRealTime(chatRoomId, setChats, setRealTime);
  return (
    <Card className="px-3 rounded-full py-1 bg-orange-300 text-black text-sm">
      Real Time
    </Card>
  );
};

export default RealTimeMode;
