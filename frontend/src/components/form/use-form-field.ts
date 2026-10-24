import { useController, type FieldPath, type FieldValues } from "react-hook-form";

import type { FormFieldBaseProps } from "./types";

/**
 * Binds a field path to react-hook-form. Everything presentational — ids, aria wiring,
 * label, description, error placement — lives in the matching standalone field.
 */
export function useFormField<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
>({ name, control }: Pick<FormFieldBaseProps<TValues, TName>, "name" | "control">) {
  const { field, fieldState } = useController<TValues, TName>({ name, control });

  return { field, error: fieldState.error?.message };
}
