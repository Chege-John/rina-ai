/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/dashboard-client.tsx
"use client";

import SideBar from "@/components/sidebar";
import { ChatProvider } from "@/context/user-chat-context";
import React from "react";

type Props = {
  children: React.ReactNode;
  domains: any; // Replace with your actual domain type
};

const DashboardClient = ({ children, domains }: Props) => {
  return (
    <ChatProvider>
      <div className="flex h-screen w-full">
        <SideBar domains={domains} />
        <div className="w-full h-screen flex flex-col pl-20 md:pl-4">
          {children}
        </div>
      </div>
    </ChatProvider>
  );
};

export default DashboardClient;
