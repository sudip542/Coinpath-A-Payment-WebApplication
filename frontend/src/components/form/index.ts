// Form-bound fields. Same look and props, but value and error come from react-hook-form
// via `name` + `control`.
export * from "./form-fields";

export { Form } from "./form";
export { useFormField } from "./use-form-field";
export { FieldShell } from "./field-shell";
export type { FieldBaseProps, FieldOption, FormFieldBaseProps } from "./types";

// Layout primitives forms need alongside the fields.
export {
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/shadcn/ui/field";

// For text prefixes/suffixes in a field's `startIcon` / `endIcon`, e.g. https:// or .00
export { InputGroupText } from "@/shadcn/ui/input-group";
