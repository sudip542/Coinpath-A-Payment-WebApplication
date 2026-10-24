import type { ReactNode } from "react";

import { cn } from "@/shadcn/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/ui/dialog";

/**
 * The dialog's own `sm:max-w-sm` has to be beaten at the same breakpoint or a
 * wide modal stays narrow above 640px — which is the trap this map exists to
 * take off every caller.
 */
const SIZES = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
  "2xl": "sm:max-w-6xl",
} as const;

export type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  /** Sub-heading under the title. Omit it and no space is reserved. */
  description?: ReactNode;
  /** Buttons for the fixed footer bar. Omit it and no bar is drawn. */
  footer?: ReactNode;
  /** The scrolling region between the two. */
  children: ReactNode;
  size?: keyof typeof SIZES;
  showCloseButton?: boolean;
  /** Escape hatch on the popup — a fixed height, mostly. */
  className?: string;
  /**
   * Escape hatch on the scroll region, for a body that fills instead of
   * scrolling: pass `flex flex-col overflow-hidden` and let a child flex.
   */
  bodyClassName?: string;
};

/**
 * The modal frame every dialog shares: the title block and the footer stay put
 * while the content between them scrolls.
 *
 * Without this the popup itself is the scroller, so a long form takes its own
 * heading and its Save button out of view — and each dialog that noticed fixed
 * it a slightly different way.
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  footer,
  children,
  size = "md",
  showCloseButton = true,
  className,
  bodyClassName,
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={showCloseButton}
        className={cn(
          // A column rather than the dialog's own scrolling grid: that is what
          // lets the middle be the only part that scrolls.
          "flex flex-col gap-0 overflow-hidden p-0",
          SIZES[size],
          className
        )}
      >
        {/* `pr-12` keeps a long title clear of the close button, which floats
            over the top-right corner. */}
        <DialogHeader className="shrink-0 border-b p-4 pr-12">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {/* `min-h-0` is what lets this shrink below its content instead of
            pushing the footer past the bottom of the popup. */}
        <div className={cn("min-h-0 flex-1 overflow-y-auto p-4", bodyClassName)}>
          {children}
        </div>

        {footer && (
          // The footer's own negative margins assume the popup pads its
          // children; here the sections pad themselves, so they are undone.
          <DialogFooter className="mx-0 mb-0 shrink-0">{footer}</DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
