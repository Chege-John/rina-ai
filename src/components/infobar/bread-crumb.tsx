/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import useSideBar from "@/context/use-sidebar";
import React from "react";
import { Switch } from "../ui/switch";

import { Loader2 } from "lucide-react";

type Props = {};

const BreadCrumb = (props: Props) => {
  //WIP:Set up Use side bar hook for real time chat and chat bot stuff
  //WIP: Set up the description and the switch

  const {
    chatRoom,
    onExpand,
    loading,
    onActivateRealtime,
    page,
    onSignOut,
    realtime,
  } = useSideBar();
  return (
    <div className="flex flex-col">
      <div className="flex gap-5 items-center">
        <h2 className="text-3xl font-bold capitalize">{page}</h2>
        {page === "conversation" && chatRoom && (
          <div className="flex items-center gap-2">
            <Switch
              defaultChecked={realtime}
              onCheckedChange={(checked) => onActivateRealtime(checked)}
              className="data-[state=checked]:bg-orange-500 data-[state=unchecked]:bg-gray-300"
            />
            {loading && (
              <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
            )}
          </div>
        )}
      </div>

      <p className="text-gray-500 text-sm">
        {page == "settings"
          ? "Manage your account settings, preferences and  integrations"
          : page == "dashboard"
            ? "A detailed overview of your metrics, usage, customers and more"
            : page == "appointment"
              ? "View and edit all your appointments"
              : page == "email-marketing"
                ? "Send personalized emails to your customers"
                : page == "integration"
                  ? "Connect third-party applications into Rina-Ai"
                  : "Modify domain settings, change chatbot options, enter sales questions and train your bot to do what you want it to."}
      </p>
    </div>
  );
};

export default BreadCrumb;
