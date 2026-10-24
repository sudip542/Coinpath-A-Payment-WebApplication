import type { ReactNode } from "react";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/shadcn/ui/combobox";

import { FieldShell } from "../form/field-shell";
import type { FieldBaseProps, FieldOption } from "../form/types";
import { useField } from "./use-field";

export type MultiComboboxFieldProps = FieldBaseProps & {
  options: FieldOption[];
  placeholder?: string;
  emptyMessage?: string;
  /** Icon rendered before the chips. */
  icon?: ReactNode;
  value?: string[];
  onValueChange?: (value: string[]) => void;
  onBlur?: () => void;
};

/**
 * Multiple choices from a list, narrowed by typing. Selections show as removable chips
 * inside the control; the value is a `string[]` of option values.
 */
export function MultiComboboxField({
  options,
  placeholder = "Search...",
  emptyMessage = "No results found",
  icon,
  value,
  onValueChange,
  onBlur,
  ...props
}: MultiComboboxFieldProps) {
  const { shell, controlProps } = useField(props);
  const anchor = useComboboxAnchor();

  // The combobox works in whole options so it can show labels; callers pass the values.
  const values = value ?? [];
  const selected = options.filter((option) => values.includes(option.value));

  return (
    <FieldShell {...shell}>
      <Combobox<FieldOption, true>
        multiple
        name={props.name}
        items={options}
        value={selected}
        onValueChange={(next) => onValueChange?.(next.map((it) => it.value))}
        itemToStringLabel={(option) => option.label}
        disabled={props.disabled}
      >
        <ComboboxChips ref={anchor}>
          {icon && (
            <span className="pl-1 text-muted-foreground [&>svg]:size-4">
              {icon}
            </span>
          )}
          <ComboboxValue>
            {(chips: FieldOption[]) => (
              <>
                {chips.map((option) => (
                  <ComboboxChip key={option.value} aria-label={option.label}>
                    {option.label}
                  </ComboboxChip>
                ))}
                <ComboboxChipsInput
                  {...controlProps}
                  onBlur={onBlur}
                  placeholder={chips.length > 0 ? "" : placeholder}
                />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
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
