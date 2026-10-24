import type { ReactNode } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/ui/select";

import { FieldShell } from "../form/field-shell";
import type { FieldBaseProps, FieldOption } from "../form/types";
import { useField } from "./use-field";

export type SelectFieldProps = FieldBaseProps & {
  options: FieldOption[];
  placeholder?: string;
  /** Icon rendered in the trigger, before the selected value. */
  icon?: ReactNode;
  value?: string | null;
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
};

/** Single choice from a fixed list, shown in a popup. */
export function SelectField({
  options,
  placeholder = "Select an option",
  icon,
  value,
  onValueChange,
  onBlur,
  ...props
}: SelectFieldProps) {
  const { shell, controlProps } = useField(props);

  return (
    <FieldShell {...shell}>
      <Select
        name={props.name}
        // Without `items`, the trigger renders the raw value — "app-001"
        // rather than "Billing Service". Base UI uses this map to look the
        // label back up for the selected value.
        items={options}
        value={value ?? null}
        onValueChange={(next) => onValueChange?.(next ?? "")}
        disabled={props.disabled}
      >
        <SelectTrigger {...controlProps} className="w-full" onBlur={onBlur}>
          {icon && (
            <span className="text-muted-foreground [&>svg]:size-4">{icon}</span>
          )}
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  );
}
