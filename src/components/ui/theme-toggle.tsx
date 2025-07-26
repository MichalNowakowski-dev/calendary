"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { use } from "react";
import { ThemeContext } from "@/lib/context/ThemeContext";

export const ThemeToggle = () => {
  const { theme, setTheme } = use(ThemeContext);

  const handleToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
      aria-label="Przełącz motyw"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 mr-3" />
      ) : (
        <Sun className="h-5 w-5 mr-3" />
      )}
      {theme === "light" ? "Tryb ciemny" : "Tryb jasny"}
    </Button>
  );
};
