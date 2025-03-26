import React from "react";
import { Card } from "../ui/card";

type Props = {
  chatRoomId: string;
  setChats: React.Dispatch<
    React.SetStateAction<
      {
        role: "assistant" | "user";
        content: string;
        link?: string | undefined;
      }[]
    >
  >;
};

const RealTimeMode = ({ chatRoomId, setChats }: Props) => {
  //WIP: Setup Real time mode
  // useRealTime(chatRoomId, setChats);
  return (
    <Card className="px-3 rounded-full py-1 bg-orange-300 text-white text-sm">
      Real Time
    </Card>
  );
};

export default RealTimeMode;
