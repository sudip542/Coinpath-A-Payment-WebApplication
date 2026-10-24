import { EyeIcon, EyeOffIcon, LockIcon } from "lucide-react";
import { useState, type ChangeEvent, type ComponentProps, type Ref } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/shadcn/ui/input-group";

import { FieldShell } from "../form/field-shell";
import type { FieldBaseProps } from "../form/types";
import { useField } from "./use-field";

export type PasswordFieldProps = FieldBaseProps &
  Pick<ComponentProps<"input">, "placeholder" | "autoComplete"> & {
    value?: string;
    onValueChange?: (value: string) => void;
    onBlur?: () => void;
    inputRef?: Ref<HTMLInputElement>;
  };

/** Password input with a reveal toggle. */
export function PasswordField({
  placeholder,
  autoComplete = "current-password",
  value,
  onValueChange,
  onBlur,
  inputRef,
  ...props
}: PasswordFieldProps) {
  const { shell, controlProps } = useField(props);
  const [visible, setVisible] = useState(false);

  const inputProps = {
    ...controlProps,
    placeholder,
    autoComplete,
    name: props.name,
    value: value ?? "",
    onChange: (event: ChangeEvent<HTMLInputElement>) =>
      onValueChange?.(event.target.value),
    onBlur,
    ref: inputRef,
  };

  return (
    <FieldShell {...shell}>
      <InputGroup>
        <InputGroupInput {...inputProps} type={visible ? "text" : "password"} />
        <InputGroupAddon>
          <LockIcon />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            disabled={props.disabled}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            aria-controls={controlProps.id}
            onClick={() => setVisible((current) => !current)}
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </FieldShell>
  );
}
