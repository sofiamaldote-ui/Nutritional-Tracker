import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutContext } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import { useContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  LayoutDashboard, 
  Users, 
  FolderHeart, 
  Settings, 
  LogOut, 
  FileText,
  Activity,
  Menu,
  UserCircle
} from "lucide-react";
import { AuthUserRole, useLogout } from "@workspace/api-client-react";
import { NutriSpaceLogo } from "@/components/nutrispace-logo";

export function Sidebar() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { isSidebarOpen, setSidebarOpen } = useContext(LayoutContext);
  const queryClient = useQueryClient();
  const logout = useLogout();

  if (!user) return null;

  const isNutri = user.role === AuthUserRole.nutricionista;

  const nutriLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/pacientes", label: "Pacientes", icon: Users },
    { href: "/grupos", label: "Grupos", icon: FolderHeart },
    { href: "/biblioteca", label: "Biblioteca", icon: FileText },
    { href: "/configuracoes", label: "Configurações", icon: Settings },
  ];

  const patientLinks = [
    { href: "/portal", label: "Biblioteca", icon: FileText },
    { href: "/portal/consultas", label: "Minhas Consultas", icon: Activity },
    { href: "/portal/perfil", label: "Meu Perfil", icon: UserCircle },
  ];

  const links = isNutri ? nutriLinks : patientLinks;

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        navigate('/login');
      },
    });
  };

  const navContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-border">
        <NutriSpaceLogo size={38} />
        <span className="font-display text-xl font-bold tracking-tight text-primary">
          NutriSpace
        </span>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto px-3 py-4">
        <nav className="space-y-0.5">
          {links.map((link) => {
            const isActive =
              location === link.href ||
              (location.startsWith(link.href) &&
                link.href !== "/" &&
                link.href !== "/dashboard" &&
                link.href !== "/portal");
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="size-4 shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User + Logout */}
      <div className="border-t border-border p-4 space-y-3">
        <div className="flex items-center gap-3 rounded-xl border bg-muted/40 px-3 py-2.5">
          <Avatar className="size-9 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold leading-none text-foreground">
              {user.name}
            </p>
            <p className="truncate text-xs text-muted-foreground mt-1 capitalize">
              {user.role}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:border-destructive/40"
          onClick={handleLogout}
          disabled={logout.isPending}
        >
          <LogOut className="size-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-sidebar transition-transform duration-200 ease-in-out md:translate-x-0 md:static",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {navContent}
      </aside>
    </>
  );
}

export function MobileHeader() {
  const { setSidebarOpen } = useContext(LayoutContext);
  const { user } = useAuth();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-sidebar px-4 md:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="size-5" />
        <span className="sr-only">Menu</span>
      </Button>
      <div className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
        <NutriSpaceLogo size={26} />
        <span className="text-primary">NutriSpace</span>
      </div>
    </header>
  );
}
