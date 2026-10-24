import type { ChangeEvent, ComponentProps, Ref } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/shadcn/ui/input-group";
import { Textarea } from "@/shadcn/ui/textarea";

import { FieldShell } from "../form/field-shell";
import type { FieldBaseProps } from "../form/types";
import { useField } from "./use-field";

export type TextareaFieldProps = FieldBaseProps &
  Pick<ComponentProps<"textarea">, "placeholder" | "rows" | "readOnly"> & {
    /** Caps the input and shows a live character counter under the text. */
    maxLength?: number;
    value?: string;
    onValueChange?: (value: string) => void;
    onBlur?: () => void;
    inputRef?: Ref<HTMLTextAreaElement>;
  };

/** Multi-line text input, with an optional character counter. */
export function TextareaField({
  placeholder,
  rows,
  readOnly,
  maxLength,
  value,
  onValueChange,
  onBlur,
  inputRef,
  ...props
}: TextareaFieldProps) {
  const { shell, controlProps } = useField(props);

  const textareaProps = {
    ...controlProps,
    placeholder,
    rows,
    readOnly,
    maxLength,
    name: props.name,
    value: value ?? "",
    onChange: (event: ChangeEvent<HTMLTextAreaElement>) =>
      onValueChange?.(event.target.value),
    onBlur,
    ref: inputRef,
  };

  if (maxLength === undefined) {
    return (
      <FieldShell {...shell}>
        <Textarea {...textareaProps} />
      </FieldShell>
    );
  }

  return (
    <FieldShell {...shell}>
      <InputGroup>
        <InputGroupTextarea {...textareaProps} />
        <InputGroupAddon align="block-end">
          <InputGroupText className="ml-auto tabular-nums">
            {(value ?? "").length}/{maxLength}
          </InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </FieldShell>
  );
}
