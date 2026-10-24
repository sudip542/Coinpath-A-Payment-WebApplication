import { Maximize2 } from "lucide-react";
import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type ComponentProps,
  type ReactNode,
} from "react";

import { Button } from "@/shadcn/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/shadcn/ui/input-group";
import { Textarea } from "@/shadcn/ui/textarea";
import { cn } from "@/shadcn/lib/utils";

import { Modal } from "../modal";
import { FieldShell } from "../form/field-shell";
import type { FieldBaseProps } from "../form/types";
import { useField } from "./use-field";

export type ExpandableTextareaFieldProps = FieldBaseProps &
  Pick<ComponentProps<"textarea">, "placeholder" | "readOnly"> & {
    value?: string;
    onValueChange?: (value: string) => void;
    onBlur?: () => void;
    /** Heading of the expanded editor. Defaults to the field's label. */
    dialogTitle?: ReactNode;
    /** Icon beside that heading. */
    dialogIcon?: ReactNode;
    /** Renders both the field and the editor in a monospace face. */
    monospace?: boolean;
    /** Turns the browser's spell checker off, for code and JSON. */
    spellCheck?: boolean;
    /**
     * Names the control where there is no visible label to name it — a row in
     * a grid of unlabelled columns, or one item of a list.
     */
    "aria-label"?: string;
  };

/**
 * A one-line input for a value that may be far longer, which opens into a full
 * editor.
 *
 * A prompt or a block of code does not fit in the space a form can spare, and
 * sizing the field to the longest value would push every property below it off
 * the panel. So the field is a single-line input and the whole of the value is
 * one click away, in a dialog big enough to read it.
 *
 * A text input cannot hold a line break — the browser strips them out on its
 * own, silently — so the input is bound to the *first line* only and the rest
 * of the value is carried around it. Editing the field therefore edits the
 * first line and leaves the remaining lines untouched, which is why it stays
 * editable however many lines the value has: there is no state in which typing
 * here can destroy what the field is not showing.
 *
 * The dialog edits the value directly rather than a copy: there is no Cancel,
 * so a draft that had to be committed would only be a way to lose work by
 * pressing Escape. "Finish editing" closes what is already saved.
 */
export function ExpandableTextareaField({
  placeholder,
  readOnly,
  value,
  onValueChange,
  onBlur,
  dialogTitle,
  dialogIcon,
  monospace,
  spellCheck,
  "aria-label": ariaLabel,
  ...props
}: ExpandableTextareaFieldProps) {
  const { shell, controlProps } = useField(props);
  const [expanded, setExpanded] = useState(false);
  const compactRef = useRef<HTMLInputElement>(null);

  const face = monospace ? "font-mono text-xs" : undefined;

  const raw = value ?? "";
  const firstBreak = raw.indexOf("\n");
  /** All the input ever holds. */
  const head = firstBreak === -1 ? raw : raw.slice(0, firstBreak);
  /** Everything from the first line break on, kept verbatim including it. */
  const tail = firstBreak === -1 ? "" : raw.slice(firstBreak);
  const hiddenLines = tail === "" ? 0 : tail.split("\n").length - 1;

  /** Puts an edited first line back in front of the lines the input cannot show. */
  const commitHead = (next: string) => onValueChange?.(next + tail);

  const handleChange = (
    event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => onValueChange?.(event.target.value);

  /**
   * Returns the one-line preview to the start of the value.
   *
   * An input scrolls to keep the caret in view, so arriving at the end of a
   * pasted value leaves the field showing its last few words — the least
   * useful part, and nothing like what the field showed a moment earlier. The
   * caret goes with it while the field is focused, so carrying on typing
   * continues from the beginning rather than somewhere out of sight.
   */
  const showFromStart = useCallback(() => {
    const el = compactRef.current;
    if (!el) return;
    el.scrollLeft = 0;
    if (document.activeElement === el) el.setSelectionRange(0, 0);
  }, []);

  /**
   * Applies a multi-line paste by hand.
   *
   * Left to the browser, pasting several lines into a text input drops every
   * line break and runs the words together — silently, and with no way back
   * short of undo. Doing it here keeps the value the user actually copied.
   */
  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text");

    if (!pasted.includes("\n")) {
      // Nothing at risk, so the browser inserts it and `onChange` carries the
      // rest of the value along. The scroll is corrected on the frame after,
      // because the text has not landed yet.
      requestAnimationFrame(showFromStart);
      return;
    }

    event.preventDefault();
    const el = event.currentTarget;
    const start = el.selectionStart ?? head.length;
    const end = el.selectionEnd ?? start;
    commitHead(head.slice(0, start) + pasted + head.slice(end));
    requestAnimationFrame(showFromStart);
  };

  const closeEditor = () => {
    setExpanded(false);
    // The preview is behind the dialog while it is open, so it is still
    // scrolled wherever it was left before expanding.
    requestAnimationFrame(showFromStart);
  };

  return (
    <FieldShell {...shell}>
      <InputGroup>
        <InputGroupInput
          {...controlProps}
          ref={compactRef}
          type="text"
          name={props.name}
          // The first line only: handing the input the whole value would let
          // the browser strip the line breaks out of it.
          value={head}
          onChange={(event) => commitHead(event.target.value)}
          onPaste={handlePaste}
          onBlur={() => {
            showFromStart();
            onBlur?.();
          }}
          readOnly={readOnly}
          placeholder={placeholder}
          spellCheck={spellCheck}
          aria-label={ariaLabel}
          title={
            hiddenLines > 0
              ? `Editing the first line. ${hiddenLines} more ${
                  hiddenLines === 1 ? "line is" : "lines are"
                } kept — open the editor to see all of it.`
              : undefined
          }
          className={face}
        />
        <InputGroupAddon align="inline-end">
          {hiddenLines > 0 && (
            <InputGroupText className="text-[10px] tabular-nums">
              +{hiddenLines}
            </InputGroupText>
          )}
          <InputGroupButton
            size="icon-xs"
            aria-label="Open the full editor"
            disabled={props.disabled}
            onClick={() => setExpanded(true)}
          >
            <Maximize2 />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      {expanded && (
        <Modal
          open
          onOpenChange={(next) => !next && closeEditor()}
          size="2xl"
          // Nearly the whole viewport: the point of expanding is to see the
          // value, and a dialog the size of a form field would not.
          className="h-[88svh]"
          title={
            <span className="flex items-center gap-2">
              {dialogIcon}
              {dialogTitle ?? shell.label ?? "Edit text content"}
            </span>
          }
          // The editor fills the body instead of scrolling it — the textarea is
          // its own scroller, and two nested ones would fight.
          bodyClassName="flex flex-col overflow-hidden"
          footer={<Button onClick={closeEditor}>Finish editing</Button>}
        >
          <Textarea
            autoFocus
            value={raw}
            onChange={handleChange}
            placeholder={placeholder}
            readOnly={readOnly}
            spellCheck={spellCheck}
            aria-label={
              ariaLabel ??
              (typeof shell.label === "string" ? shell.label : undefined)
            }
            // Fills the dialog rather than sizing to its content, so the
            // footer button stays put however much is typed.
            className={cn("field-sizing-fixed min-h-0 flex-1 resize-none", face)}
          />
        </Modal>
      )}
    </FieldShell>
  );
}
