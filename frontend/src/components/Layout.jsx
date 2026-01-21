import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Home, Plus, CalendarDays, Users, FileText, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: "Jobs" },
  { path: "/customers", icon: Users, label: "Customers" },
  { path: "/jobs/new", icon: Plus, label: "New", isAction: true },
  { path: "/calendar", icon: CalendarDays, label: "Calendar" },
  { path: "/invoices", icon: FileText, label: "Invoices" },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b-2 border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight uppercase text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                VoltMaster Pro
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">Job Management</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t-2 border-border bottom-nav">
        <div className="max-w-7xl mx-auto flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            if (item.isAction) {
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  data-testid="nav-new-job"
                  className="flex flex-col items-center justify-center w-14 h-14 -mt-6 bg-accent text-accent-foreground rounded-full shadow-lg touch-target"
                  style={{ boxShadow: '0 4px 0 0 rgba(251, 191, 36, 0.5)' }}
                >
                  <Icon className="w-7 h-7" strokeWidth={2.5} />
                </NavLink>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                data-testid={`nav-${item.label.toLowerCase()}`}
                className={cn(
                  "flex flex-col items-center justify-center touch-target px-3 py-1 rounded-lg transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
