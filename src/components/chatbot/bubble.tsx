import { cn, extractUUIDFromString, getMonthName } from "@/lib/utils";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  message: {
    //role: "user" | "assistant";
    role: string;
    content: string;
    link?: string;
  };
  createdAt?: Date;
};

const Bubble = ({ message, createdAt }: Props) => {
  const d = new Date();
  const image = extractUUIDFromString(message.content);

  // Set alignment based on the role.
  const alignmentClass =
    message.role === "user"
      ? "self-end flex-row-reverse" // Align user messages to the left
      : "self-start"; // Align assistant and owner messages to the right

  // Define avatar based on the role
  const avatarContent =
    message.role === "assistant" || message.role === "OWNER" ? (
      <Avatar className="w-5 h-5">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    ) : (
      <Avatar className="w-5 h-5">
        <AvatarFallback>
          <User />
        </AvatarFallback>
      </Avatar>
    );

  return (
    <div className={cn("flex gap-2 items-end", alignmentClass)}>
      {avatarContent}
      <div
        className={cn(
          "flex flex-col gap-3 min-w-[200px] max-w-[300px] p-4 rounded-t-md",
          message.role === "OWNER" || message.role === "assistant"
            ? "bg-gray-200 rounded-r-md" // Gray bubble for assistant and owner
            : "bg-orange-200 rounded-l-md" // Orange bubble for user
        )}
      >
        {createdAt ? (
          <div className="flex gap-2 text-xs text-gray-800">
            <p>
              {createdAt.getDate()} {getMonthName(createdAt.getMonth())}
            </p>
            <p>
              {createdAt.getHours()}:{createdAt.getMinutes()}
              {createdAt.getHours() > 12 ? "PM" : "AM"}
            </p>
          </div>
        ) : (
          <p className="text-xs">
            {`${d.getHours()}:${d.getMinutes()} ${
              d.getHours() > 12 ? "PM" : "AM"
            }`}
          </p>
        )}
        {image ? (
          <div className="relative aspect-square">
            <Image src={`https:/ucarecdn.com/${image[0]}/`} alt="image" fill />
          </div>
        ) : (
          <p className="text-sm">
            {message.content.replace("(complete)", "")}
            {message.link && (
              <Link
                className="underline font-bold pl-2"
                href={message.link}
                target="_blank"
              >
                Your Link
              </Link>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default Bubble;
