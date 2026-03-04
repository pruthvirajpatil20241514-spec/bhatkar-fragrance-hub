import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "./button";

/**
 * Small toggle button that switches between dark and light themes.
 * Uses `next-themes` to keep the HTML class in sync with the selected mode.
 * The icon reflects the *current* mode (sun when dark so clicking switches to light).
 */
export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  // `resolvedTheme` is provided by next-themes and handles the
  //  system preference fallback for us; fall back to the raw `theme` if
  //  it's not available (e.g. during SSR while the client has not hydrated).
  const current = resolvedTheme || theme;

  const handleToggle = () => {
    if (current === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      aria-label="Toggle dark mode"
    >
      {current === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
