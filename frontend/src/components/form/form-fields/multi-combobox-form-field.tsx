import type { FieldPath, FieldValues } from "react-hook-form";

import {
  MultiComboboxField,
  type MultiComboboxFieldProps,
} from "../../fields";
import type { FormFieldBaseProps } from "../types";
import { useFormField } from "../use-form-field";

type MultiComboboxFormFieldProps<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
> = FormFieldBaseProps<TValues, TName> &
  Pick<
    MultiComboboxFieldProps,
    "options" | "placeholder" | "emptyMessage" | "icon"
  >;

/** Form-bound {@link MultiComboboxField}. The form value is a `string[]`. */
export function MultiComboboxFormField<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
>({ name, control, ...props }: MultiComboboxFormFieldProps<TValues, TName>) {
  const { field, error } = useFormField({ name, control });

  return (
    <MultiComboboxField
      {...props}
      name={field.name}
      error={error}
      value={field.value}
      onValueChange={field.onChange}
      onBlur={field.onBlur}
    />
  );
}
