import { useLocation } from "react-router-dom";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/services": "Services",
  "/finances": "Finances",
  "/members": "Members",
  "/reports": "Reports",
};

export function TopBar() {
  const location = useLocation();
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
      <p className="text-sm text-muted-foreground hidden sm:block">{today}</p>
    </header>
  );
}
