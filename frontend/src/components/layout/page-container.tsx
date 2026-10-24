import type { ReactNode } from "react";

import { cn } from "@/shadcn/lib/utils";

export type PageContainerProps = {
  title: ReactNode;
  /** Sub-heading under the title. Omit it and no space is reserved. */
  description?: ReactNode;
  /** Actions aligned to the end of the header row — buttons, filters, a menu. */
  rightContent?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * The page frame every page shares: padding, a title block, an actions slot and
 * the divider under them. The workflow designer is the one page that does not
 * use it — it owns its full height and has its own toolbar instead of a header.
 */
export function PageContainer({
  title,
  description,
  rightContent,
  children,
  className,
}: PageContainerProps) {
  return (
    <div className={cn("p-6", className)}>
      <header className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {/* Wraps rather than overflows: a page passing a filter or two
            alongside its primary button runs past the edge of a phone on one
            line. Nothing moves until it would have. */}
        {rightContent && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {rightContent}
          </div>
        )}
      </header>

      <div className="mt-6">{children}</div>
    </div>
  );
}
