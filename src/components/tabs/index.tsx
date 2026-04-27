import React, { JSX } from "react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { cn } from "@/lib/utils";

type Props = {
  triggers: {
    label: string;
    icon?: JSX.Element;
  }[];
  children: React.ReactNode;
  className?: string;
  button?: JSX.Element;
};

const TabsMenu = ({ triggers, children, className, button }: Props) => {
  return (
    <Tabs className="w-full h-full flex flex-col" defaultValue={triggers[0].label}>
      <TabsList className={cn("pr-5 justify-start w-full bg-transparent border-b h-auto p-0 rounded-none overflow-x-auto scrollbar-hide flex-nowrap", className)}>
        {triggers.map((trigger, key) => (
          <TabsTrigger
            key={key}
            value={trigger.label}
            className="capitalize flex gap-2 font-semibold data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 rounded-none py-3 px-4 bg-transparent shrink-0"
          >
            {trigger.icon && trigger.icon}
            {trigger.label}
          </TabsTrigger>
        ))}
        {button}
      </TabsList>
      {children}
    </Tabs>
  );
};

export default TabsMenu;
