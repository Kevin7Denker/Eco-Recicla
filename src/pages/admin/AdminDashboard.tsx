import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, MapPin, Building2, Ticket, TrendingUp, Recycle } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalCollectionPoints: number;
  totalPartners: number;
  totalCoupons: number;
  totalDeliveries: number;
  totalPointsDistributed: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCollectionPoints: 0,
    totalPartners: 0,
    totalCoupons: 0,
    totalDeliveries: 0,
    totalPointsDistributed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, points, partners, coupons, deliveries] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("collection_points").select("*", { count: "exact", head: true }),
          supabase.from("partners").select("*", { count: "exact", head: true }),
          supabase.from("coupons").select("*", { count: "exact", head: true }),
          supabase.from("deliveries").select("points_earned"),
        ]);

        const totalPoints = deliveries.data?.reduce((sum, d) => sum + d.points_earned, 0) || 0;

        setStats({
          totalUsers: users.count || 0,
          totalCollectionPoints: points.count || 0,
          totalPartners: partners.count || 0,
          totalCoupons: coupons.count || 0,
          totalDeliveries: deliveries.data?.length || 0,
          totalPointsDistributed: totalPoints,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total de Usuários",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Pontos de Coleta",
      value: stats.totalCollectionPoints,
      icon: MapPin,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Parceiros Ativos",
      value: stats.totalPartners,
      icon: Building2,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Cupons Disponíveis",
      value: stats.totalCoupons,
      icon: Ticket,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      title: "Total de Entregas",
      value: stats.totalDeliveries,
      icon: Recycle,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "Pontos Distribuídos",
      value: stats.totalPointsDistributed.toLocaleString(),
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Visão geral do sistema EcoRecicla</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`${stat.bg} p-2 rounded-lg`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
