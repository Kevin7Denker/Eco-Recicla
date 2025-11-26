import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, MapPin, Shield, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";

const MainLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: String(error),
        variant: "destructive",
      });
      return;
    }
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-eco flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  EcoRecicla
                </h1>
                <p className="text-xs text-muted-foreground">
                  Dashboard do Cidadão
                </p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/dashboard"
                className="text-sm font-medium text-primary"
              >
                Início
              </Link>
              <Link
                to="/map"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Mapa
              </Link>
              <Link
                to="/coupons"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Cupons
              </Link>
              <Link
                to="/dashboard/history"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Histórico
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Shield className="w-3 h-3" />
                  Admin
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                Perfil
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
