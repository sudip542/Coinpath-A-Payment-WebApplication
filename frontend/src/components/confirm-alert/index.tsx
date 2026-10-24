import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/shadcn/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/shadcn/ui/alert-dialog";

/**
 * How the icon tile and the confirm button are coloured.
 *
 * `destructive` is the only tone the theme has a token for, so the other two
 * name their palette outright — each with a `dark:` counterpart, since a bare
 * `emerald-600` is a light-mode value that would sit on a dark card unchanged.
 */
const TONES = {
  default: {
    media: "bg-muted text-foreground",
    action: "",
  },
  success: {
    media: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    action:
      "bg-emerald-600 text-white hover:bg-emerald-600/90 focus-visible:ring-emerald-600/30 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-500/90",
  },
  warning: {
    media: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    action:
      "bg-amber-500 text-amber-950 hover:bg-amber-500/90 focus-visible:ring-amber-500/30 dark:bg-amber-400 dark:hover:bg-amber-400/90",
  },
  destructive: {
    media: "bg-destructive/10 text-destructive",
    action: "",
  },
} as const;

export type ConfirmAlertProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  /** The sentence under the title — what the confirm button is about to do. */
  description?: ReactNode;
  /** Shown in the tile beside the title. Omit it and no tile is drawn. */
  icon?: ReactNode;
  tone?: keyof typeof TONES;
  confirmLabel?: string;
  cancelLabel?: string;
  /**
   * The action is in flight: both buttons lock and the confirm one spins.
   * The dialog stays open until the caller closes it, so a failure can leave
   * it up rather than dismissing over the top of the error.
   */
  isPending?: boolean;
  onConfirm: () => void;
};

/**
 * The confirmation every "are you sure" shares.
 *
 * A caller assembling the eight `AlertDialog` parts by hand also picks its own
 * button colour each time, so what an undoable change looks like versus a
 * permanent one drifts from page to page. Here the tone decides it.
 */
export function ConfirmAlert({
  open,
  onOpenChange,
  title,
  description,
  icon,
  tone = "default",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isPending = false,
  onConfirm,
}: ConfirmAlertProps) {
  const { media, action } = TONES[tone];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {icon && <AlertDialogMedia className={media}>{icon}</AlertDialogMedia>}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            // The tone's own colours, except for `destructive` — that one has a
            // button variant already, and duplicating it here would drift.
            variant={tone === "destructive" ? "destructive" : "default"}
            className={cn(action)}
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending && <Loader2 className="animate-spin" />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
