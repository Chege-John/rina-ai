"use client";

import { useAuthContextHook } from "@/context/use-auth-context";
import { cn } from "@/lib/utils";
import React from "react";

// type Props = {};

const HighlightBar = () => {
  const { currentStep } = useAuthContextHook();

  return (
    <div className="grid grid-cols-3 gap-3">
      <div
        className={cn(
          "rounded-full h-2 col-span-1",
          currentStep === 1 ? "bg-orange-400" : "bg-gray-200"
        )}
      ></div>
      <div
        className={cn(
          "rounded-full h-2 col-span-1",
          currentStep === 2 ? "bg-orange-400" : "bg-gray-200"
        )}
      ></div>
      <div
        className={cn(
          "rounded-full h-2 col-span-1",
          currentStep === 3 ? "bg-orange-400" : "bg-gray-200"
        )}
      ></div>
    </div>
  );
};

export default HighlightBar;
