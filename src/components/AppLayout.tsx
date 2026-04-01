import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileText,
  Clock,
  Warehouse,
  ClipboardList,
  BookOpen,
} from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { to: "/", icon: LayoutDashboard, label: "Dashboard", badge: 3 },
    ],
  },
  {
    label: "Transactions",
    items: [
      { to: "/rm-inward", icon: ArrowDownToLine, label: "RM Inward" },
      { to: "/rm-outward", icon: ArrowUpFromLine, label: "RM Outward" },
      { to: "/bmr", icon: FileText, label: "BMR" },
    ],
  },
  {
    label: "Masters",
    items: [
      { to: "/rm-master", icon: Clock, label: "RM Master" },
      { to: "/stock-ledger", icon: Warehouse, label: "Stock Ledger" },
    ],
  },
  {
    label: "Reports",
    items: [
      { to: "/schedule-ta", icon: ClipboardList, label: "Schedule TA" },
    ],
  },
];

const AppLayout = () => {
  return (
    <div className="grid grid-cols-[200px_1fr] min-h-screen bg-card">
      {/* Sidebar */}
      <aside className="bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="px-4 pt-4 pb-3 border-b border-sidebar-border flex items-center gap-2">
          <div className="w-[26px] h-[26px] bg-primary rounded-md flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M3 8h10M8 3l5 5-5 5" />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="text-xs font-medium text-foreground">AyurRM Pro</div>
            <div className="text-[10px] text-muted-foreground">Vaidya Pharma Pvt. Ltd.</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label} className="px-2 pt-2.5 pb-1">
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-2 pb-1">
                {group.label}
              </div>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `nav-item-app ${isActive ? "nav-item-app-active" : ""}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={`w-[15px] h-[15px] shrink-0 ${
                          isActive ? "text-primary opacity-100" : "opacity-70"
                        }`}
                      />
                      {item.label}
                      {item.badge && (
                        <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] rounded-full px-1.5 py-px font-medium">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="px-3 py-2.5 border-t border-sidebar-border">
          <div className="text-[11px] text-muted-foreground">Logged in as</div>
          <div className="text-xs font-medium mt-0.5">Dr. Anand Kulkarni</div>
          <div className="text-[10px] text-muted-foreground">Store Manager</div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
