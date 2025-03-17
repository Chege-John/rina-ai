import { Section } from "@/components/section-label";
import UploadButton from "@/components/upload-button";
import { BotIcon, MessageSquare } from "lucide-react";
import Image from "next/image";
import React from "react";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

type Props = {
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors<FieldValues>;
  chatbot: {
    icon: string | null;
    id: string;
    welcomeMessage: string | null;
  } | null;
};

const EditChatbotIcon = ({ register, errors, chatbot }: Props) => {
  return (
    <div className="py-5 flex flex-col gap-5 items-start">
      <Section
        label="Chatbot Icon"
        message="Change the icon for your chatbot"
      />
      <UploadButton register={register} errors={errors} label="Edit Image" />
      {chatbot?.icon ? (
        <div className="rounded-full overflow-hidden">
          <Image
            src={`https:ucarecdn.com/${chatbot.icon}`}
            alt="bot"
            width={80}
            height={80}
          />
        </div>
      ) : (
        <div
          className="rounded-full cursor-pointer shadow-md w-20 h-20
        flex items-center justify-center bg-orange-300"
        >
          <MessageSquare className="text-white" size={60} />
        </div>
      )}
    </div>
  );
};

export default EditChatbotIcon;
