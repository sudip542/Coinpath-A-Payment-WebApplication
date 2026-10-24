import type { Ref } from "react";

import { Checkbox } from "@/shadcn/ui/checkbox";

import { FieldShell } from "../form/field-shell";
import type { FieldBaseProps } from "../form/types";
import { useField } from "./use-field";

export type CheckboxFieldProps = FieldBaseProps & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onBlur?: () => void;
  inputRef?: Ref<HTMLInputElement>;
};

/** Single boolean, with the label and description beside the box. */
export function CheckboxField({
  checked,
  onCheckedChange,
  onBlur,
  inputRef,
  ...props
}: CheckboxFieldProps) {
  const { shell, controlProps } = useField(props);

  return (
    <FieldShell {...shell} inline>
      <Checkbox
        {...controlProps}
        name={props.name}
        checked={checked ?? false}
        onCheckedChange={(next) => onCheckedChange?.(next)}
        onBlur={onBlur}
        inputRef={inputRef}
      />
    </FieldShell>
  );
}
