import { Field, FieldLabel } from "@/shadcn/ui/field";
import { RadioGroup, RadioGroupItem } from "@/shadcn/ui/radio-group";

import { FieldShell } from "../form/field-shell";
import type { FieldBaseProps, FieldOption } from "../form/types";
import { useField } from "./use-field";

export type RadioGroupFieldProps = FieldBaseProps & {
  options: FieldOption[];
  value?: string | null;
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
};

/** Single choice from a short list, with every option visible. */
export function RadioGroupField({
  options,
  value,
  onValueChange,
  onBlur,
  ...props
}: RadioGroupFieldProps) {
  const { shell, controlProps } = useField(props);

  return (
    <FieldShell {...shell} labelAs="title">
      <RadioGroup
        {...controlProps}
        aria-labelledby={shell.label ? `${shell.controlId}-label` : undefined}
        name={props.name}
        value={value ?? null}
        onValueChange={(next) => onValueChange?.(next)}
        onBlur={onBlur}
      >
        {options.map((option) => {
          const itemId = `${shell.controlId}-${option.value}`;
          return (
            <Field key={option.value} orientation="horizontal">
              <RadioGroupItem
                id={itemId}
                value={option.value}
                disabled={props.disabled || option.disabled}
              />
              <FieldLabel htmlFor={itemId} className="font-normal">
                {option.label}
              </FieldLabel>
            </Field>
          );
        })}
      </RadioGroup>
    </FieldShell>
  );
}
