import { NavLink as RouterNavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Church,
  Wallet,
  Users,
  FileBarChart,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/services", label: "Services", icon: Church },
  { to: "/finances", label: "Finances", icon: Wallet },
  { to: "/members", label: "Members", icon: Users },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/profile", label: "Profile", icon: UserCircle },
];

export function MobileTabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-navy border-t border-sidebar-border no-print">
      <div className="flex items-center justify-around h-16">
        {links.map((link) => (
          <RouterNavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors",
                isActive
                  ? "text-sidebar-primary"
                  : "text-sidebar-foreground/50"
              )
            }
          >
            <link.icon className="w-5 h-5" />
            <span>{link.label}</span>
          </RouterNavLink>
        ))}
      </div>
    </nav>
  );
}
