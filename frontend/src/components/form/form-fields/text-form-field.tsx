import type { FieldPath, FieldValues } from "react-hook-form";

import { TextField, type TextFieldProps } from "../../fields";
import type { FormFieldBaseProps } from "../types";
import { useFormField } from "../use-form-field";

type TextFormFieldProps<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
> = FormFieldBaseProps<TValues, TName> &
  Pick<
    TextFieldProps,
    | "type"
    | "placeholder"
    | "autoComplete"
    | "inputMode"
    | "readOnly"
    | "startIcon"
    | "endIcon"
  >;

/** Form-bound {@link TextField}. */
export function TextFormField<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
>({ name, control, ...props }: TextFormFieldProps<TValues, TName>) {
  const { field, error } = useFormField({ name, control });

  return (
    <TextField
      {...props}
      name={field.name}
      error={error}
      value={field.value}
      onValueChange={field.onChange}
      onBlur={field.onBlur}
      inputRef={field.ref}
    />
  );
}
