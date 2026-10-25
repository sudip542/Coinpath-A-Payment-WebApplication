import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubmitButtonProps extends React.ComponentProps<typeof Button> {
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  children,
  isLoading = false,
  loadingText = "Processing...",
  icon,
  disabled,
  className,
  ...props
}) => {
  return (
    <Button
      type="submit"
      disabled={isLoading || disabled}
      className={cn("w-full gap-2 font-semibold shadow-xs transition-all", className)}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          {icon}
          <span>{children}</span>
        </>
      )}
    </Button>
  );
};

export default SubmitButton;
