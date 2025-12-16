import { Link, useLocation } from "react-router-dom";
import { ChefHat, Bell, Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Início" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/ficha-tecnica", label: "Fichas Técnicas" },
  { href: "/simulador", label: "Simulador" },
  { href: "/ficha-tecnica/ingredientes", label: "Ingredientes" },
  { href: "/configuracoes/custos", label: "Custos Fixos" },
];

export function Header() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-soft group-hover:shadow-glow transition-shadow">
              <ChefHat className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-foreground leading-tight">
                Meu Chef
              </span>
              <span className="text-[10px] font-medium text-muted-foreground -mt-0.5">
                Edil Digital
              </span>
            </div>
            <Badge variant="outline" className="hidden sm:inline-flex ml-1 text-[10px] px-1.5 py-0 h-4 border-amber-300 text-amber-600 bg-amber-50">
              Beta
            </Badge>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href ||
                (item.href !== "/" && location.pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]" variant="destructive">
              3
            </Badge>
          </Button>

          <div className="hidden md:flex items-center gap-3 pl-3 border-l border-border">
            <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-sm">
              CE
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Chef Edil</span>
              <span className="text-xs text-muted-foreground">Plano Pro</span>
            </div>
          </div>

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
