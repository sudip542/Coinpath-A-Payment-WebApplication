import type { Ref } from "react";

import { Switch } from "@/shadcn/ui/switch";

import { FieldShell } from "../form/field-shell";
import type { FieldBaseProps } from "../form/types";
import { useField } from "./use-field";

export type SwitchFieldProps = FieldBaseProps & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onBlur?: () => void;
  inputRef?: Ref<HTMLInputElement>;
};

/** Boolean toggle, for settings that take effect as soon as they are flipped. */
export function SwitchField({
  checked,
  onCheckedChange,
  onBlur,
  inputRef,
  ...props
}: SwitchFieldProps) {
  const { shell, controlProps } = useField(props);

  return (
    <FieldShell {...shell} inline>
      <Switch
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
