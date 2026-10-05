import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  UserCheck,
  CalendarClock,
  CalendarDays,
  MessagesSquare,
} from "lucide-react";

const navItems = [
  {
    to: "/counselor/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/counselor/onboarding",
    label: "Profile",
    icon: UserCheck,
  },
  {
    to: "/counselor/availability",
    label: "Availability",
    icon: CalendarDays,
  },
  {
    to: "/counselor/bookings",
    label: "Bookings",
    icon: CalendarClock,
  },
  {
    to: "/counselor/chat",
    label: "Messages",
    icon: MessagesSquare,
  },
];

const CounselorSidebar = () => (
  <aside className="hidden md:flex md:flex-col w-64 border-r border-border/30 bg-background/70 backdrop-blur-lg">
    <div className="p-6">
      <h2 className="text-lg font-semibold tracking-tight">Counselor Panel</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Manage your profile, availability, and student sessions.
      </p>
    </div>
    <nav className="flex-1 px-3 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-primary/5 hover:text-primary",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground"
              )
            }
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  </aside>
);

export default CounselorSidebar;