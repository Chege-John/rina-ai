import React from "react";
import BreadCrumb from "./bread-crumb";
import { Headphones, Star, Trash, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

type Props = object;

const InfoBar = (props: Props) => {
  return (
    <div className="sticky top-0 z-30 flex w-full items-center justify-between border-b bg-[#f9fbfc]/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-[#f9fbfc]/60">
      <div className="flex items-center gap-4">
        <BreadCrumb />
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
        </Button>
        
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Headphones className="h-5 w-5" />
        </Button>
        
        <Avatar className="h-9 w-9 border border-border cursor-pointer hover:opacity-80 transition-opacity">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback className="bg-orange text-white">CN</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default InfoBar;
