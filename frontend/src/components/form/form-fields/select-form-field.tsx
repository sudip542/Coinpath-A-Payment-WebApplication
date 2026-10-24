import type { FieldPath, FieldValues } from "react-hook-form";

import { SelectField, type SelectFieldProps } from "../../fields";
import type { FormFieldBaseProps } from "../types";
import { useFormField } from "../use-form-field";

type SelectFormFieldProps<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
> = FormFieldBaseProps<TValues, TName> &
  Pick<SelectFieldProps, "options" | "placeholder" | "icon">;

/** Form-bound {@link SelectField}. */
export function SelectFormField<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
>({ name, control, ...props }: SelectFormFieldProps<TValues, TName>) {
  const { field, error } = useFormField({ name, control });

  return (
    <SelectField
      {...props}
      name={field.name}
      error={error}
      value={field.value}
      onValueChange={field.onChange}
      onBlur={field.onBlur}
    />
  );
}
