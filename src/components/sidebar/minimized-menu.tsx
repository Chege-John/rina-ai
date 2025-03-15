import { SIDE_BAR_MENU } from "@/constants/menu";
import { LogOut, MenuIcon, MonitorSmartphone } from "lucide-react";
import React from "react";
import MenuItem from "./menu-item";
import DomainMenu from "./domain-menu";

type MinMenuProps = {
  onShrink(): void;
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

export const MinMenu = ({
  onShrink,
  current,
  onSignOut,
  domains,
}: MinMenuProps) => {
  return (
    <div className="py-3 flex flex-col items-center h-full">
      <span className="animate-fade-in  delay-300 fill-mode-forwards cursor-pointer">
        <MenuIcon onClick={onShrink} />
      </span>
      <div
        className="animate-fade-in  delay-300 fill-mode-forwards
      flex flex-col justify-between h-full pt-10"
      >
        <div className="flex flex-col">
          {SIDE_BAR_MENU.map((menu, key) => (
            <MenuItem size="min" {...menu} key={key} current={current} />
          ))}
          <DomainMenu domains={domains} min />
        </div>
        <div className="flex flex-col">
          <MenuItem
            size="min"
            label="Sign Out"
            icon={<LogOut />}
            onSignOut={onSignOut}
          />
          <MenuItem size="min" label="Sign Out" icon={<MonitorSmartphone />} />
        </div>
      </div>
    </div>
  );
};
