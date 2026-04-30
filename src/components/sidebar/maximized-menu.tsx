import { SIDE_BAR_MENU } from "@/constants/menu";
import { LogOut, Menu } from "lucide-react";
import Image from "next/image";
import React from "react";
import DomainMenu from "./domain-menu";
import MenuItem from "./menu-item";

type Props = {
  onExpand(): void;
  current: string;
  onSignOut(): void;
  domains:
    | {
        id: string;
        name: string;
        icon: string | null;
      }[]
    | null
    | undefined;
};

const MaxMenu = ({ current, domains, onExpand, onSignOut }: Props) => {
  return (
    <div className="py-4 px-4 flex flex-col h-full bg-background">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt="Rina AI Logo"
            className="rounded-lg"
            width={32}
            height={32}
          />
          <span className="font-bold text-lg">Rina AI</span>
        </div>
        <Menu
          className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
          onClick={onExpand}
        />
      </div>
      
      <div className="flex flex-col flex-1 overflow-y-auto">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-muted-foreground mb-2 px-2 uppercase tracking-wider">Menu</p>
          {SIDE_BAR_MENU.map((menu, key) => (
            <MenuItem size="max" {...menu} key={key} current={current} />
          ))}
          
          <div className="mt-6">
             <p className="text-xs font-medium text-muted-foreground mb-2 px-2 uppercase tracking-wider">Domains</p>
             <DomainMenu domains={domains} />
          </div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2 px-2 uppercase tracking-wider">Options</p>
          <MenuItem
            size="max"
            label="Sign out"
            icon={<LogOut />}
            onSignOut={onSignOut}
          />
        </div>
      </div>
    </div>
  );
};

export default MaxMenu;
