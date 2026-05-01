import { cn, extractUUIDFromString, getMonthName } from "@/lib/utils";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  message: {
    role: string;
    content: string;
    link?: string;
  };
  createdAt?: Date;
  ghost?: boolean;
  isOwnerView?: boolean;
};

const Bubble = ({ message, createdAt, ghost, isOwnerView }: Props) => {
  const d = new Date();
  const image = extractUUIDFromString(message.content);

  // Determine if the message is from the "current user" (appearing on the right)
  let isUser = false;

  if (isOwnerView) {
    // In Dashboard (Owner View):
    // The "User" side is the Business (Owner + Assistant).
    // The "Other" side is the Customer.
    isUser = 
      message.role === "owner" || 
      message.role === "OWNER" || 
      message.role === "assistant" || 
      message.role === "ASSISTANT" ||
      message.role === "support" ||
      message.role === "SUPPORT";
  } else {
    // In Chat Widget (Customer View):
    // The Customer (User) should be on the right.
    // The Owner (Agent) and Assistant should be on the left.
    // Note: Original logic included (!ghost && message.role === "owner") as User? 
    // Keeping original logic for non-dashboard to ensure backward compatibility.
    isUser =
      message.role === "user" ||
      message.role === "CUSTOMER" ||
      (!ghost && message.role === "owner");
  }

  const alignmentClass = isUser
    ? "self-end flex-row-reverse" // Right aligned (Me)
    : "self-start"; // Left aligned (Them)

  // Define avatar based on the role, independent of alignment
  let avatarImageSrc = "";
  let avatarFallback = <User />;

  if (message.role === "assistant") {
     avatarImageSrc = `https://api.dicebear.com/7.x/avataaars/svg?seed=bot`;
     avatarFallback = <>AI</>;
  } else if (message.role === "owner" || message.role === "OWNER" || message.role === "support") {
     avatarImageSrc = `https://api.dicebear.com/7.x/avataaars/svg?seed=owner`;
     avatarFallback = <>CN</>;
  } else {
     // User / Customer
     avatarImageSrc = `https://api.dicebear.com/7.x/avataaars/svg?seed=customer`;
     avatarFallback = <User />;
  }

  const avatarContent = (
    <Avatar className="w-8 h-8 ring-2 ring-white shadow-sm">
      <AvatarImage src={avatarImageSrc} alt="avatar" />
      <AvatarFallback>{avatarFallback}</AvatarFallback>
    </Avatar>
  );

  return (
    <div className={cn("flex gap-3 items-end mb-2", alignmentClass)}>
      {avatarContent}
      <div
        className={cn(
          "flex flex-col gap-2 min-w-[200px] max-w-[70%] p-4 shadow-sm text-[13px] relative",
          !isUser
            ? "bg-white border border-gray-100 rounded-2xl rounded-bl-none text-black font-medium" // Them (Left): White Bubble, Black Text
            : ghost
            ? "bg-[#F97316] rounded-2xl rounded-br-none text-black font-medium "
            : "bg-[#F97316] text-white font-medium rounded-2xl rounded-br-none border-none" // Me (Right): Orange Bubble (Hex enforced), White Text
        )}
      >
        {createdAt ? (
          <div className={cn("flex gap-2 text-[10px] mb-1 opacity-80", !isUser ? "text-gray-500" : "text-orange-50")}>
            <span>
              {createdAt.getDate()} {getMonthName(createdAt.getMonth())}
            </span>
            <span>
              {createdAt.getHours()}:{createdAt.getMinutes() < 10 ? '0' + createdAt.getMinutes() : createdAt.getMinutes()}
              {createdAt.getHours() >= 12 ? " PM" : " AM"}
            </span>
          </div>
        ) : (
          <p className={cn("text-[10px] mb-1 opacity-80", !isUser ? "text-gray-500" : "text-orange-50")}>
            {`${d.getHours()}:${d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()} ${
              d.getHours() >= 12 ? "PM" : "AM"
            }`}
          </p>
        )}
        {image ? (
          <div className="relative aspect-square w-full rounded-lg overflow-hidden mt-1">
            <Image src={`https://ucarecdn.com/${image[0]}/`} alt="image" fill className="object-cover" />
          </div>
        ) : (
          <div className={cn("leading-relaxed", !isUser ? "text-black" : "text-white")}>
            {message.content.replace("(complete)", "")}
            {message.link && (
              <Link
                className={cn("block font-bold mt-2 underline", !isUser ? "text-orange-600" : "text-white")}
                href={message.link}
                target="_blank"
              >
                View Link
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bubble;
