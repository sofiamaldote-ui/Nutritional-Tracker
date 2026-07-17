import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutContext } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import { useContext } from "react";
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
  const [location] = useLocation();
  const { user, refetch } = useAuth();
  const { isSidebarOpen, setSidebarOpen } = useContext(LayoutContext);
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
        refetch();
      }
    });
  };

  const navContent = (
    <div className="flex h-full flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2.5 font-display text-xl font-bold tracking-tight">
          <NutriSpaceLogo size={34} />
          <span className="text-sidebar-foreground">NutriSpace</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto px-4 py-2">
        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = location === link.href || (location.startsWith(link.href) && link.href !== '/' && link.href !== '/dashboard' && link.href !== '/portal');
            const Icon = link.icon;
            
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="size-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t p-4">
        <div className="flex items-center gap-3 mb-4 rounded-lg border bg-card p-3 shadow-sm">
          <Avatar className="size-9 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold leading-none">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground mt-1 capitalize">{user.role}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start text-muted-foreground" 
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
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar Container */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-background transition-transform duration-200 ease-in-out md:translate-x-0 md:static",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
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
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
      <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setSidebarOpen(true)}>
        <Menu className="size-5" />
        <span className="sr-only">Menu</span>
      </Button>
      <div className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-primary">
        <NutriSpaceLogo size={26} />
        NutriSpace
      </div>
    </header>
  );
}