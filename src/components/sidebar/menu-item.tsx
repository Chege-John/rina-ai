import { cn } from "@/lib/utils";
import Link from "next/link";
import React, { JSX } from "react";

type Props = {
  size: "max" | "min";
  label: string;
  icon: JSX.Element;
  path?: string;
  current?: string;
  onSignOut?(): void;
};

const MenuItem = ({ size, path, icon, label, current, onSignOut }: Props) => {
  const isActive = current === path;

  switch (size) {
    case "max":
      return (
        <Link
          onClick={onSignOut}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg my-1 transition-all duration-200 group",
            isActive
              ? "bg-[#256ff1] text-white font-medium shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
          href={path ? `/${path}` : "#"}
        >
          {React.cloneElement(icon, {
            className: cn(
              "h-5 w-5",
              isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
            ),
          })}
          <span className="text-sm">{label}</span>
        </Link>
      );

    case "min":
      return (
        <Link
          onClick={onSignOut}
          className={cn(
            "flex items-center justify-center rounded-lg py-2 my-1 transition-all duration-200 group",
            isActive
              ? "bg-[#256ff1] text-white shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
          href={path ? `/${path}` : "#"}
        >
          {React.cloneElement(icon, {
            className: cn(
              "h-5 w-5",
              isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
            ),
          })}
        </Link>
      );

    default:
      return null;
  }
};

export default MenuItem;
