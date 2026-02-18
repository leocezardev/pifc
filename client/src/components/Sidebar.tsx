import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();

  const mainNavItems = [
    { icon: "dashboard", label: "Dashboard", href: "/" },
    { icon: "cloud_upload", label: "Ingestão", href: "/contracts" },
    { icon: "analytics", label: "Análise", href: "/analysis" },
  ];

  const managementNavItems = [
    { icon: "description", label: "Relatórios", href: "/reports" },
    { icon: "settings", label: "Configurações", href: "/settings" },
  ];

  return (
    <aside
      id="pifc-sidebar"
      className="w-64 bg-white border-r border-gray-200 flex-col hidden lg:flex shrink-0"
    >
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        <div className="mb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Principal
        </div>

        {mainNavItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all group",
                  isActive
                    ? "bg-pifc-primary/10 text-pifc-primary border-l-4 border-pifc-primary shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-pifc-primary"
                )}
              >
                <span
                  className={cn(
                    "material-icons-outlined text-[20px] transition-colors",
                    isActive ? "text-pifc-primary" : "text-gray-400 group-hover:text-pifc-primary"
                  )}
                >
                  {item.icon}
                </span>
                {item.label}
              </a>
            </Link>
          );
        })}

        <div className="mt-6 mb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Gestão
        </div>

        {managementNavItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all group",
                  isActive
                    ? "bg-pifc-primary/10 text-pifc-primary border-l-4 border-pifc-primary shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-pifc-primary"
                )}
              >
                <span
                  className={cn(
                    "material-icons-outlined text-[20px] transition-colors",
                    isActive ? "text-pifc-primary" : "text-gray-400 group-hover:text-pifc-primary"
                  )}
                >
                  {item.icon}
                </span>
                {item.label}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* Help Card */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="material-icons-outlined text-pifc-primary text-xl mt-0.5">info</span>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-1">Precisa de Ajuda?</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Consulte o manual do fiscal ou contate o suporte técnico.
              </p>
              <a className="text-xs font-semibold text-pifc-primary hover:underline mt-2 inline-block" href="#">
                Ver Documentação →
              </a>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
