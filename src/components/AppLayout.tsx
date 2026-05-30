import { useState } from "react";
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
  Truck,
  ShieldCheck,
  Languages,
  KeyRound,
  LogOut,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useUser, roleLabel } from "@/context/UserContext";
import { toast } from "sonner";

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
      { to: "/mfr-table", icon: BookOpen, label: "MFR Table" },
      { to: "/supplier-master", icon: Truck, label: "Suppliers" },
    ],
  },
  {
    label: "Reports",
    items: [
      { to: "/schedule-ta", icon: ClipboardList, label: "Schedule TA" },
      { to: "/batch-prefix-audit", icon: ShieldCheck, label: "Batch Prefix Audit" },
    ],
  },
];

const AppLayout = () => {
  const { lang, setLang } = useLanguage();
  const { currentUser, login, logout } = useUser();
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState("");

  const handleLogin = () => {
    if (login(pin)) {
      toast.success("Switched user");
      setPin("");
      setShowPin(false);
    } else {
      toast.error("Invalid PIN");
    }
  };

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

        <div className="px-3 py-2.5 border-t border-sidebar-border space-y-2">
          {/* EN / हिं language toggle — switches RM & product names across the app */}
          <div className="flex items-center gap-1.5">
            <Languages className="w-3 h-3 text-muted-foreground shrink-0" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-1">Names</span>
            <div className="ml-auto inline-flex rounded-md border border-border overflow-hidden bg-background">
              <button
                type="button"
                onClick={() => setLang("en")}
                aria-pressed={lang === "en"}
                className={`px-2 py-0.5 text-[10px] font-medium transition-colors ${lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("hi")}
                aria-pressed={lang === "hi"}
                className={`px-2 py-0.5 text-[10px] font-medium transition-colors ${lang === "hi" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
              >
                हिं
              </button>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between gap-1">
              <div className="min-w-0">
                <div className="text-[11px] text-muted-foreground">Logged in as</div>
                <div className="text-xs font-medium mt-0.5 truncate">
                  {currentUser ? currentUser.name : "— not logged in —"}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {currentUser ? roleLabel(currentUser.role) : ""}
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowPin((v) => !v)}
                  className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border border-border bg-background hover:bg-secondary transition-colors"
                  title="Switch user"
                >
                  <KeyRound className="w-2.5 h-2.5" /> Switch
                </button>
                {currentUser && (
                  <button
                    type="button"
                    onClick={() => { logout(); toast.success("Logged out"); }}
                    className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border border-border bg-background hover:bg-secondary transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-2.5 h-2.5" /> Out
                  </button>
                )}
              </div>
            </div>
            {showPin && (
              <div className="mt-2 flex items-center gap-1">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  autoFocus
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="Enter PIN"
                  className="flex-1 min-w-0 h-7 px-2 text-xs rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={handleLogin}
                  className="h-7 px-2 text-[10px] font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Go
                </button>
              </div>
            )}
          </div>
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
