import type { ReactNode } from "react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shadcn/ui/combobox";
import { InputGroupAddon } from "@/shadcn/ui/input-group";

import { FieldShell } from "../form/field-shell";
import type { FieldBaseProps, FieldOption } from "../form/types";
import { useField } from "./use-field";

export type ComboboxFieldProps = FieldBaseProps & {
  options: FieldOption[];
  placeholder?: string;
  emptyMessage?: string;
  /** Icon rendered inside the control, before the search text. */
  icon?: ReactNode;
  value?: string | null;
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
};

/** Single choice from a long list, narrowed by typing. */
export function ComboboxField({
  options,
  placeholder = "Search...",
  emptyMessage = "No results found",
  icon,
  value,
  onValueChange,
  onBlur,
  ...props
}: ComboboxFieldProps) {
  const { shell, controlProps } = useField(props);

  // The combobox works in whole options so it can show a label; callers pass the value.
  const selected = options.find((option) => option.value === value) ?? null;

  return (
    <FieldShell {...shell}>
      <Combobox<FieldOption>
        name={props.name}
        items={options}
        value={selected}
        onValueChange={(option) => onValueChange?.(option ? option.value : "")}
        itemToStringLabel={(option) => option.label}
        disabled={props.disabled}
      >
        <ComboboxInput
          {...controlProps}
          placeholder={placeholder}
          onBlur={onBlur}
          showClear={selected !== null}
        >
          {icon && <InputGroupAddon>{icon}</InputGroupAddon>}
        </ComboboxInput>
        <ComboboxContent>
          <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
          <ComboboxList>
            {(option: FieldOption) => (
              <ComboboxItem
                key={option.value}
                value={option}
                disabled={option.disabled}
              >
                {option.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </FieldShell>
  );
}
