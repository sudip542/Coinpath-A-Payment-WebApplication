import type { ReactNode } from "react";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@/shadcn/ui/field";

export type FieldShellProps = {
  controlId: string;
  descriptionId?: string;
  errorId?: string;
  label?: ReactNode;
  description?: ReactNode;
  required?: boolean;
  error?: string;
  className?: string;
  /** Puts the control before the label on one row, for checkbox and switch fields. */
  inline?: boolean;
  /**
   * Radio groups have no single focusable control to point a `<label>` at, so they
   * render the label as a plain title and reference it with `aria-labelledby`.
   */
  labelAs?: "label" | "title";
  children: ReactNode;
};

/** Label, required marker, description and error message around a single control. */
export function FieldShell({
  controlId,
  descriptionId,
  errorId,
  label,
  description,
  required,
  error,
  className,
  inline,
  labelAs = "label",
  children,
}: FieldShellProps) {
  const labelId = `${controlId}-label`;
  const labelContent = (
    <>
      {label}
      {required && (
        <span aria-hidden="true" className="text-destructive">
          *
        </span>
      )}
    </>
  );

  const labelNode = !label ? null : labelAs === "title" ? (
    <FieldTitle id={labelId}>{labelContent}</FieldTitle>
  ) : (
    <FieldLabel id={labelId} htmlFor={controlId}>
      {labelContent}
    </FieldLabel>
  );

  const descriptionNode = description ? (
    <FieldDescription id={descriptionId}>{description}</FieldDescription>
  ) : null;

  const errorNode = error ? <FieldError id={errorId}>{error}</FieldError> : null;

  if (inline) {
    return (
      <Field
        orientation="horizontal"
        data-invalid={error ? true : undefined}
        className={className}
      >
        {children}
        <FieldContent>
          {labelNode}
          {descriptionNode}
          {errorNode}
        </FieldContent>
      </Field>
    );
  }

  return (
    <Field data-invalid={error ? true : undefined} className={className}>
      {labelNode}
      {children}
      {descriptionNode}
      {errorNode}
    </Field>
  );
}
