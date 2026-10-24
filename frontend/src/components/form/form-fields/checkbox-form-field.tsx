import type { FieldPath, FieldValues } from "react-hook-form";

import { CheckboxField } from "../../fields";
import type { FormFieldBaseProps } from "../types";
import { useFormField } from "../use-form-field";

/** Form-bound {@link CheckboxField}. */
export function CheckboxFormField<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
>({ name, control, ...props }: FormFieldBaseProps<TValues, TName>) {
  const { field, error } = useFormField({ name, control });

  return (
    <CheckboxField
      {...props}
      name={field.name}
      error={error}
      checked={field.value}
      onCheckedChange={field.onChange}
      onBlur={field.onBlur}
      inputRef={field.ref}
    />
  );
}
