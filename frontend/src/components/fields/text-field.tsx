import type { ChangeEvent, ComponentProps, ReactNode, Ref } from "react";

import { Input } from "@/shadcn/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shadcn/ui/input-group";

import { FieldShell } from "../form/field-shell";
import type { FieldBaseProps } from "../form/types";
import { useField } from "./use-field";

export type TextFieldProps = FieldBaseProps &
  Pick<
    ComponentProps<"input">,
    "type" | "placeholder" | "autoComplete" | "inputMode" | "readOnly"
  > & {
    /** Rendered inside the control, before the value. Icon, or `<InputGroupText>` for a prefix. */
    startIcon?: ReactNode;
    /** Rendered inside the control, after the value. Icon, unit, hint or count. */
    endIcon?: ReactNode;
    value?: string | number;
    /** Receives a number when `type` is "number", otherwise a string. */
    onValueChange?: (value: string | number) => void;
    onBlur?: () => void;
    inputRef?: Ref<HTMLInputElement>;
  };

/** Single-line input for text, email, url and number values. */
export function TextField({
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  readOnly,
  startIcon,
  endIcon,
  value,
  onValueChange,
  onBlur,
  inputRef,
  ...props
}: TextFieldProps) {
  const { shell, controlProps } = useField(props);

  const inputProps = {
    ...controlProps,
    type,
    placeholder,
    autoComplete,
    inputMode,
    readOnly,
    name: props.name,
    value: value ?? "",
    // A number input reports "" as NaN via valueAsNumber, which schemas reject. Reading
    // target.value instead would give "", which z.coerce.number() turns into 0.
    onChange: (event: ChangeEvent<HTMLInputElement>) =>
      onValueChange?.(
        type === "number" ? event.target.valueAsNumber : event.target.value
      ),
    onBlur,
    ref: inputRef,
  };

  return (
    <FieldShell {...shell}>
      {startIcon || endIcon ? (
        <InputGroup>
          <InputGroupInput {...inputProps} />
          {startIcon && <InputGroupAddon>{startIcon}</InputGroupAddon>}
          {endIcon && (
            <InputGroupAddon align="inline-end">{endIcon}</InputGroupAddon>
          )}
        </InputGroup>
      ) : (
        <Input {...inputProps} />
      )}
    </FieldShell>
  );
}
