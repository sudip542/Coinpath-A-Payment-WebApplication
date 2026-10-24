import type { FieldPath, FieldValues } from "react-hook-form";

import { TextareaField, type TextareaFieldProps } from "../../fields";
import type { FormFieldBaseProps } from "../types";
import { useFormField } from "../use-form-field";

type TextareaFormFieldProps<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
> = FormFieldBaseProps<TValues, TName> &
  Pick<
    TextareaFieldProps,
    "placeholder" | "rows" | "readOnly" | "maxLength"
  >;

/** Form-bound {@link TextareaField}. */
export function TextareaFormField<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
>({ name, control, ...props }: TextareaFormFieldProps<TValues, TName>) {
  const { field, error } = useFormField({ name, control });

  return (
    <TextareaField
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
