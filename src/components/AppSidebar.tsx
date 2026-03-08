import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Church,
  Wallet,
  Users,
  FileBarChart,
  UserCircle,
  Cross,
} from "lucide-react";
import { useAppData } from "@/contexts/AppContext";
import { useChurchProfile } from "@/hooks/useChurchProfile";
import { cn } from "@/lib/utils";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/services", label: "Services", icon: Church },
  { to: "/finances", label: "Finances", icon: Wallet },
  { to: "/members", label: "Members", icon: Users },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/profile", label: "Profile", icon: UserCircle },
];

export function AppSidebar() {
  const { members } = useAppData();

  return (
    <>
      {/* Desktop-only sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-64 bg-navy flex-col z-40 no-print">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary/20 flex items-center justify-center">
            <Cross className="w-5 h-5 text-sidebar-primary" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-sidebar-accent-foreground">GraceTrack</h1>
            <p className="text-xs text-sidebar-foreground/60">Church Management</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {links.map((link) => (
            <RouterNavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary/15 text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )
              }
            >
              <link.icon className="w-5 h-5" />
              <span>{link.label}</span>
              {link.to === "/members" && (
                <span className="ml-auto text-xs bg-sidebar-primary/20 text-sidebar-primary px-2 py-0.5 rounded-full">
                  {members.length}
                </span>
              )}
            </RouterNavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/40 text-center">GraceTrack v1.0.0</p>
        </div>
      </aside>

      {/* Desktop spacer */}
      <div className="hidden lg:block w-64 flex-shrink-0" />
    </>
  );
}
