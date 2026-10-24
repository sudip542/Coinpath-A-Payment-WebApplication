import type { FieldPath, FieldValues } from "react-hook-form";

import { ComboboxField, type ComboboxFieldProps } from "../../fields";
import type { FormFieldBaseProps } from "../types";
import { useFormField } from "../use-form-field";

type ComboboxFormFieldProps<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
> = FormFieldBaseProps<TValues, TName> &
  Pick<ComboboxFieldProps, "options" | "placeholder" | "emptyMessage" | "icon">;

/** Form-bound {@link ComboboxField}. */
export function ComboboxFormField<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
>({ name, control, ...props }: ComboboxFormFieldProps<TValues, TName>) {
  const { field, error } = useFormField({ name, control });

  return (
    <ComboboxField
      {...props}
      name={field.name}
      error={error}
      value={field.value}
      onValueChange={field.onChange}
      onBlur={field.onBlur}
    />
  );
}
