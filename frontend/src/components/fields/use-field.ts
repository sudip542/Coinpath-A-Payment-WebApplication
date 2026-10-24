import { useId } from "react";

import type { FieldBaseProps } from "../form/types";

/**
 * Derives the ids and aria wiring shared by every control: label points at the control,
 * and the control points at its description and error message.
 *
 * `required` becomes `aria-required` rather than the native `required` attribute so the
 * browser does not run its own validation ahead of whatever is validating the value.
 */
export function useField({
  id,
  label,
  description,
  error,
  required,
  disabled,
  className,
}: FieldBaseProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;

  const descriptionId = description ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return {
    /** Spread onto `<FieldShell>`. */
    shell: {
      controlId,
      descriptionId,
      errorId,
      label,
      description,
      required,
      error,
      className,
    },
    /** Spread onto the rendered control. */
    controlProps: {
      id: controlId,
      disabled,
      "aria-required": required || undefined,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": describedBy,
    },
  };
}
