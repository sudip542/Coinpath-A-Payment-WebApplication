import type { FieldPath, FieldValues } from "react-hook-form";

import { SwitchField } from "../../fields";
import type { FormFieldBaseProps } from "../types";
import { useFormField } from "../use-form-field";

/** Form-bound {@link SwitchField}. */
export function SwitchFormField<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
>({ name, control, ...props }: FormFieldBaseProps<TValues, TName>) {
  const { field, error } = useFormField({ name, control });

  return (
    <SwitchField
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
