import type { ComponentProps } from "react";
import { FormProvider, type FieldValues, type UseFormReturn } from "react-hook-form";

/**
 * `TTransformedValues` mirrors react-hook-form: with a resolver the parsed output can
 * differ from the input values, and that parsed type is what a submit handler receives.
 */
type FormProps<
  TValues extends FieldValues,
  TContext = unknown,
  TTransformedValues = TValues,
> = Omit<ComponentProps<"form">, "onSubmit"> & {
  form: UseFormReturn<TValues, TContext, TTransformedValues>;
  onSubmit: (values: TTransformedValues) => void | Promise<void>;
};

/**
 * Puts the form instance on context so fields can be used without passing `control`,
 * and runs submits through the schema. `noValidate` leaves validation to the schema
 * instead of the browser.
 */
export function Form<
  TValues extends FieldValues,
  TContext = unknown,
  TTransformedValues = TValues,
>({
  form,
  onSubmit,
  children,
  ...props
}: FormProps<TValues, TContext, TTransformedValues>) {
  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} {...props}>
        {children}
      </form>
    </FormProvider>
  );
}
