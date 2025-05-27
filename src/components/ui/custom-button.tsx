// components/ui/custom-button.tsx
import { Button as ShadcnButton, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface CustomButtonProps extends Omit<ButtonProps, "variant"> {
  variant?: ButtonProps["variant"] | "glow";
}

const CustomButton = forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, variant, ...props }, ref) => {
    if (variant === "glow") {
      return (
        <ShadcnButton
          ref={ref}
          variant="default"
          className={cn(
            "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200",
            className
          )}
          {...props}
        />
      );
    }

    return (
      <ShadcnButton
        ref={ref}
        variant={variant}
        className={className}
        {...props}
      />
    );
  }
);

CustomButton.displayName = "CustomButton";

export { CustomButton as Button };
