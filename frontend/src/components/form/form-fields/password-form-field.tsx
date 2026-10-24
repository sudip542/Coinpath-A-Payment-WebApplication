import type { FieldPath, FieldValues } from "react-hook-form";

import { PasswordField, type PasswordFieldProps } from "../../fields";
import type { FormFieldBaseProps } from "../types";
import { useFormField } from "../use-form-field";

type PasswordFormFieldProps<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
> = FormFieldBaseProps<TValues, TName> &
  Pick<PasswordFieldProps, "placeholder" | "autoComplete">;

/** Form-bound {@link PasswordField}. */
export function PasswordFormField<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
>({ name, control, ...props }: PasswordFormFieldProps<TValues, TName>) {
  const { field, error } = useFormField({ name, control });

  return (
    <PasswordField
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
