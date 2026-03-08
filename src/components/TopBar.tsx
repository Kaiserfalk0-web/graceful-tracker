import { useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/services": "Services",
  "/finances": "Finances",
  "/members": "Members",
  "/reports": "Reports",
};

export function TopBar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const title = titles[location.pathname] || "GraceTrack";
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="h-16 border-b border-border bg-card/60 backdrop-blur-sm flex items-center justify-between px-6 lg:px-8 no-print">
      <div className="lg:ml-0 ml-14">
        <h2 className="text-xl font-display font-bold text-foreground">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground hidden sm:block">{today}</p>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>
    </header>
  );
}
