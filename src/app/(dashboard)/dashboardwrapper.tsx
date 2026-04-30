/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/dashboard-client.tsx
"use client";

import SideBar from "@/components/sidebar";
import { ChatProvider } from "@/context/user-chat-context";
import useSideBar from "@/context/use-sidebar";
import { cn } from "@/lib/utils";
import React from "react";

type Props = {
  children: React.ReactNode;
  domains: any; // Replace with your actual domain type
};

const DashboardClient = ({ children, domains }: Props) => {
  const { expand } = useSideBar();

  return (
    <ChatProvider>
      <div className="flex h-screen w-full">
        <SideBar domains={domains} />
        <div
          className={cn(
            "w-full h-screen flex flex-col transition-all duration-300 ease-in-out bg-[#f9fbfc]",
            expand ? "md:pl-4" : "md:pl-4" // Keeping padding consistent or adjust if needed
          )}
        >
          {children}
        </div>
      </div>
    </ChatProvider>
  );
};

export default DashboardClient;
