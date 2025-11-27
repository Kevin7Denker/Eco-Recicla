import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Leaf,
  MapPin,
  Award,
  TrendingUp,
  Gift,
  ChevronRight,
  Recycle,
  Calendar,
  LogOut,
  Package,
  Shield,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Delivery = {
  id: string;
  weight_kg?: number | null;
  points_earned?: number | null;
  created_at?: string | null;
  material_type?: string | null;
  collection_point_id?: string | null;
};

type Coupon = {
  id: string;
  title: string;
  description: string;
  expiration_date?: string | null;
  points_required: number;
  quantity_available: number;
  partner_id?: string | null;
  active: boolean;
  partners?: { name?: string } | null;
};

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [pointsBalance, setPointsBalance] = useState<number | null>(null);
  const [monthRecycledKg, setMonthRecycledKg] = useState<number>(0);
  const [totalPointsEarned, setTotalPointsEarned] = useState<number>(0);
  const [deliveriesCount, setDeliveriesCount] = useState<number>(0);
  const [recentActivities, setRecentActivities] = useState<Delivery[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(!!data);
    };

    checkAdmin();
  }, [user]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;

      try {
        // profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("name, points_balance")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;
        if (profile) {
          setProfileName(profile.name ?? null);
          setPointsBalance(profile.points_balance ?? 0);
        }

        // deliveries
        const { data: deliveries, error: deliveriesError } = await supabase
          .from("deliveries")
          .select(
            "id, weight_kg, points_earned, created_at, material_type, collection_point_id"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (deliveriesError) throw deliveriesError;
        if (deliveries) {
          setRecentActivities(deliveries.slice(0, 6) as Delivery[]);

          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          let monthKg = 0;
          let totalPts = 0;
          deliveries.forEach((d: Delivery) => {
            const created = d.created_at ? new Date(d.created_at) : null;
            if (created && created >= startOfMonth)
              monthKg += Number(d.weight_kg || 0);
            totalPts += Number(d.points_earned || 0);
          });
          setMonthRecycledKg(Math.round(monthKg));
          setTotalPointsEarned(totalPts);
          setDeliveriesCount(deliveries.length);
        }

        // coupons
        const { data: couponsData, error: couponsError } = await supabase
          .from("coupons")
          .select(
            "id, title, description, expiration_date, points_required, quantity_available, active, partner_id, partners(name)"
          )
          .eq("active", true)
          .order("points_required", { ascending: true });

        if (couponsError) throw couponsError;
        if (couponsData) setCoupons(couponsData as Coupon[]);
      } catch (err) {
        console.error("Erro carregando dados do dashboard:", err);
      }
    };

    loadDashboardData();
  }, [user]);

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

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">
          Olá, {profileName ?? user.email ?? "Cidadão"}! 👋
        </h2>
        <p className="text-muted-foreground">
          Você já reciclou {monthRecycledKg}kg este mês. Continue assim!
        </p>
      </div>

      {/* Points Card */}
      <Card className="gradient-card border-0 shadow-eco p-6 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full gradient-eco flex items-center justify-center">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Saldo disponível
              </p>
              <h3 className="text-4xl font-bold text-primary">
                {pointsBalance ?? 0}
              </h3>
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
              <Link to="/coupons" className="flex items-center gap-2">
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
            <Badge variant="secondary" className="bg-success/10 text-success">
              +12%
            </Badge>
          </div>
          <h3 className="text-2xl font-bold mb-1">{monthRecycledKg} kg</h3>
          <p className="text-sm text-muted-foreground">Reciclados este mês</p>
        </Card>

        <Card className="gradient-card border-0 shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <Award className="w-6 h-6 text-secondary" />
            </div>
            <Badge variant="secondary" className="bg-info/10 text-info">
              Nível 5
            </Badge>
          </div>
          <h3 className="text-2xl font-bold mb-1">{totalPointsEarned}</h3>
          <p className="text-sm text-muted-foreground">Pontos totais ganhos</p>
        </Card>

        <Card className="gradient-card border-0 shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <Badge variant="secondary" className="bg-success/10 text-success">
              Ativo
            </Badge>
          </div>
          <h3 className="text-2xl font-bold mb-1">{deliveriesCount}</h3>
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
            {recentActivities.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhuma atividade recente.
              </p>
            )}

            {recentActivities.map((act: Delivery) => {
              const date = act.created_at ? new Date(act.created_at) : null;
              const dateLabel = date ? date.toLocaleString() : "";
              const materialLabel = act.material_type
                ? String(act.material_type).charAt(0).toUpperCase() +
                  String(act.material_type).slice(1)
                : "Entrega";
              return (
                <div
                  key={act.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Recycle className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium mb-1">
                          {materialLabel} reciclado
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {act.weight_kg ?? 0} kg{" "}
                          {act.collection_point_id
                            ? `no ${act.collection_point_id}`
                            : ""}
                        </p>
                      </div>
                      <Badge className="bg-primary/10 text-primary">
                        {act.points_earned ?? 0} pts
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{dateLabel}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Available Coupons */}
        <Card className="gradient-card border-0 shadow-soft p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Cupons Disponíveis</h3>
            <Button variant="ghost" size="sm">
              <Link to="/coupons" className="flex items-center gap-1">
                Ver todos <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {coupons.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum cupom disponível no momento.
              </p>
            )}

            {coupons.map((c) => {
              const partnerName =
                c.partners?.name ?? c.partner_id ?? "Parceiro";
              const expiry = c.expiration_date
                ? new Date(c.expiration_date).toLocaleDateString()
                : null;
              return (
                <div
                  key={c.id}
                  className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5 hover:border-primary/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-primary mb-1">
                        {c.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {partnerName}
                      </p>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">
                      {c.points_required} pts
                    </Badge>
                  </div>
                  {c.description && (
                    <p className="text-xs text-muted-foreground mb-3">
                      {c.description}
                    </p>
                  )}
                  {expiry && (
                    <p className="text-xs text-muted-foreground mb-3">
                      Validade: {expiry}
                    </p>
                  )}
                  <Button size="sm" className="w-full gradient-eco border-0" asChild>
                    <Link to="/coupons">Ver no Marketplace</Link>
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
