import type { FieldPath, FieldValues } from "react-hook-form";

import { RadioGroupField, type RadioGroupFieldProps } from "../../fields";
import type { FormFieldBaseProps } from "../types";
import { useFormField } from "../use-form-field";

type RadioGroupFormFieldProps<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
> = FormFieldBaseProps<TValues, TName> & Pick<RadioGroupFieldProps, "options">;

/** Form-bound {@link RadioGroupField}. */
export function RadioGroupFormField<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
>({ name, control, ...props }: RadioGroupFormFieldProps<TValues, TName>) {
  const { field, error } = useFormField({ name, control });

  return (
    <RadioGroupField
      {...props}
      name={field.name}
      error={error}
      value={field.value}
      onValueChange={field.onChange}
      onBlur={field.onBlur}
    />
  );
}
