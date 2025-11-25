import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, MapPin, Award, TrendingUp, Gift, ChevronRight, Recycle, Calendar, LogOut, Package } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-eco flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">EcoRecicla</h1>
                <p className="text-xs text-muted-foreground">Dashboard do Cidadão</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/dashboard" className="text-sm font-medium text-primary">Início</Link>
              <Link to="/dashboard/map" className="text-sm text-muted-foreground hover:text-primary transition-colors">Mapa</Link>
              <Link to="/dashboard/coupons" className="text-sm text-muted-foreground hover:text-primary transition-colors">Cupons</Link>
              <Link to="/dashboard/history" className="text-sm text-muted-foreground hover:text-primary transition-colors">Histórico</Link>
            </nav>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">Perfil</Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Olá, Maria! 👋</h2>
          <p className="text-muted-foreground">Você já reciclou 45kg este mês. Continue assim!</p>
        </div>

        {/* Points Card */}
        <Card className="gradient-card border-0 shadow-eco p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full gradient-eco flex items-center justify-center">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Saldo disponível</p>
                <h3 className="text-4xl font-bold text-primary">1,250</h3>
                <p className="text-sm text-muted-foreground">pontos EcoRecicla</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button className="gradient-eco border-0 shadow-lg" asChild>
                <Link to="/delivery" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Registrar entrega
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/map" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Encontrar ponto
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard/coupons" className="flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Ver cupons
                </Link>
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Stats */}
          <Card className="gradient-card border-0 shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Recycle className="w-6 h-6 text-primary" />
              </div>
              <Badge variant="secondary" className="bg-success/10 text-success">+12%</Badge>
            </div>
            <h3 className="text-2xl font-bold mb-1">45 kg</h3>
            <p className="text-sm text-muted-foreground">Reciclados este mês</p>
          </Card>
          
          <Card className="gradient-card border-0 shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-secondary" />
              </div>
              <Badge variant="secondary" className="bg-info/10 text-info">Nível 5</Badge>
            </div>
            <h3 className="text-2xl font-bold mb-1">8,540</h3>
            <p className="text-sm text-muted-foreground">Pontos totais ganhos</p>
          </Card>
          
          <Card className="gradient-card border-0 shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <Badge variant="secondary" className="bg-success/10 text-success">Ativo</Badge>
            </div>
            <h3 className="text-2xl font-bold mb-1">23</h3>
            <p className="text-sm text-muted-foreground">Entregas realizadas</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card className="gradient-card border-0 shadow-soft p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Atividades Recentes</h3>
              <Button variant="ghost" size="sm">
                Ver todas <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Recycle className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium mb-1">Plástico reciclado</p>
                      <p className="text-sm text-muted-foreground">5 kg no Ponto Central</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary">+250 pts</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>Há 2 horas</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Gift className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium mb-1">Cupom resgatado</p>
                      <p className="text-sm text-muted-foreground">20% OFF - Loja EcoVida</p>
                    </div>
                    <Badge className="bg-secondary/10 text-secondary">-500 pts</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>Ontem</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Recycle className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium mb-1">Papel reciclado</p>
                      <p className="text-sm text-muted-foreground">8 kg no Ponto Zona Norte</p>
                    </div>
                    <Badge className="bg-accent/10 text-accent">+160 pts</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>Há 2 dias</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Available Coupons */}
          <Card className="gradient-card border-0 shadow-soft p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Cupons Disponíveis</h3>
              <Button variant="ghost" size="sm">
                <Link to="/dashboard/coupons" className="flex items-center gap-1">
                  Ver todos <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5 hover:border-primary/40 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-primary mb-1">20% de desconto</h4>
                    <p className="text-sm text-muted-foreground">Supermercado Verde</p>
                  </div>
                  <Badge className="bg-primary text-primary-foreground">500 pts</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Válido em compras acima de R$ 100</p>
                <Button size="sm" className="w-full gradient-eco border-0">
                  Resgatar cupom
                </Button>
              </div>
              
              <div className="p-4 rounded-lg border-2 border-secondary/20 bg-secondary/5 hover:border-secondary/40 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-secondary mb-1">15% de desconto</h4>
                    <p className="text-sm text-muted-foreground">Restaurante Natural</p>
                  </div>
                  <Badge className="bg-secondary text-secondary-foreground">400 pts</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Válido de segunda a sexta</p>
                <Button size="sm" variant="outline" className="w-full">
                  Resgatar cupom
                </Button>
              </div>
              
              <div className="p-4 rounded-lg border-2 border-accent/20 bg-accent/5 hover:border-accent/40 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-accent mb-1">R$ 30 OFF</h4>
                    <p className="text-sm text-muted-foreground">Loja de Produtos Eco</p>
                  </div>
                  <Badge className="bg-accent text-accent-foreground">800 pts</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Compras acima de R$ 150</p>
                <Button size="sm" variant="outline" className="w-full">
                  Resgatar cupom
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
