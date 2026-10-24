import { cn } from "@/shadcn/lib/utils";
import { Button } from "@/shadcn/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/shadcn/ui/popover";
import { CheckIcon, MoonIcon, SunIcon } from "lucide-react";
import type { Theme } from "./theme-context";
import { useTheme } from "./use-theme";

const OPTIONS: { value: Theme; label: string; icon: typeof SunIcon }[] = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const TriggerIcon = theme === "dark" ? MoonIcon : SunIcon;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" size="icon" aria-label="Change theme">
            <TriggerIcon className="size-4" />
          </Button>
        }
      />
      <PopoverContent align="end" className="w-44 gap-1 p-1.5">
        <PopoverHeader className="px-2 pt-1">
          <PopoverTitle className="text-muted-foreground text-xs">
            Theme
          </PopoverTitle>
        </PopoverHeader>
        {OPTIONS.map((option) => {
          const selected = theme === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              aria-pressed={selected}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                "hover:bg-accent hover:text-accent-foreground",
                selected && "bg-accent/60 font-medium"
              )}
            >
              <option.icon className="size-4" />
              <span>{option.label}</span>
              {selected && <CheckIcon className="ml-auto size-4" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
