import type { ReactNode } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

/** Option shape shared by the select, radio group and combobox fields. */
export type FieldOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

/**
 * Props every standalone field accepts. Fields know nothing about react-hook-form —
 * you own the value and decide when to pass `error`. The matching `*FormField` supplies
 * both from form state instead.
 */
export type FieldBaseProps = {
  /** Generated when omitted. Pass one only if something outside has to reference it. */
  id?: string;
  name?: string;
  label?: ReactNode;
  /** Helper text under the control, wired to the control's `aria-describedby`. */
  description?: ReactNode;
  /** Message to show under the control. Rendered as an alert and marks the control invalid. */
  error?: string;
  /** Marks the label and sets `aria-required`. */
  required?: boolean;
  disabled?: boolean;
  /** Applied to the field wrapper, not to the control. */
  className?: string;
};

/** Props every form-bound field accepts. */
export type FormFieldBaseProps<
  TValues extends FieldValues = FieldValues,
  TName extends FieldPath<TValues> = FieldPath<TValues>,
> = {
  /** Path into the form values, e.g. "name" or "config.timeout". */
  name: TName;
  /** Only needed outside of `<Form>`; inside it the control comes from context. */
  control?: Control<TValues>;
  label?: ReactNode;
  description?: ReactNode;
  /** Marks the label and sets `aria-required`. Validation still comes from the schema. */
  required?: boolean;
  disabled?: boolean;
  className?: string;
};
