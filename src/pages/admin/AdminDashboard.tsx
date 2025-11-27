import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, MapPin, Building2, Ticket, TrendingUp, Recycle } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

interface Stats {
  totalUsers: number;
  totalCollectionPoints: number;
  totalPartners: number;
  totalCoupons: number;
  totalDeliveries: number;
  totalPointsDistributed: number;
}

interface MaterialData {
  name: string;
  value: number;
  color: string;
}

interface TrendData {
  date: string;
  deliveries: number;
  points: number;
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
  const [materialData, setMaterialData] = useState<MaterialData[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, points, partners, coupons, deliveries] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("collection_points").select("*", { count: "exact", head: true }),
          supabase.from("partners").select("*", { count: "exact", head: true }),
          supabase.from("coupons").select("*", { count: "exact", head: true }),
          supabase.from("deliveries").select("material_type, points_earned, created_at"),
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

        // Process material type data for pie chart
        const materialCounts: Record<string, number> = {};
        deliveries.data?.forEach((d) => {
          materialCounts[d.material_type] = (materialCounts[d.material_type] || 0) + 1;
        });

        const materials: MaterialData[] = [
          { name: "Papel", value: materialCounts.papel || 0, color: "hsl(var(--chart-1))" },
          { name: "Plástico", value: materialCounts.plastico || 0, color: "hsl(var(--chart-2))" },
          { name: "Vidro", value: materialCounts.vidro || 0, color: "hsl(var(--chart-3))" },
          { name: "Metal", value: materialCounts.metal || 0, color: "hsl(var(--chart-4))" },
          { name: "Outro", value: materialCounts.outro || 0, color: "hsl(var(--chart-5))" },
        ];
        setMaterialData(materials.filter(m => m.value > 0));

        // Process trend data for last 7 days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.toISOString().split('T')[0];
        });

        const trendByDate: Record<string, { deliveries: number; points: number }> = {};
        last7Days.forEach(date => {
          trendByDate[date] = { deliveries: 0, points: 0 };
        });

        deliveries.data?.forEach((d) => {
          const date = d.created_at.split('T')[0];
          if (trendByDate[date]) {
            trendByDate[date].deliveries += 1;
            trendByDate[date].points += d.points_earned;
          }
        });

        const trends: TrendData[] = last7Days.map(date => ({
          date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          deliveries: trendByDate[date].deliveries,
          points: trendByDate[date].points,
        }));
        setTrendData(trends);

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

        <div className="grid gap-4 md:grid-cols-2 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Entregas por Tipo de Material</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Carregando...</p>
                </div>
              ) : materialData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Nenhum dado disponível</p>
                </div>
              ) : (
                <ChartContainer
                  config={{
                    papel: { label: "Papel", color: "hsl(var(--chart-1))" },
                    plastico: { label: "Plástico", color: "hsl(var(--chart-2))" },
                    vidro: { label: "Vidro", color: "hsl(var(--chart-3))" },
                    metal: { label: "Metal", color: "hsl(var(--chart-4))" },
                    outro: { label: "Outro", color: "hsl(var(--chart-5))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={materialData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {materialData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tendência de Entregas (Últimos 7 Dias)</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Carregando...</p>
                </div>
              ) : (
                <ChartContainer
                  config={{
                    deliveries: { label: "Entregas", color: "hsl(var(--primary))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="deliveries" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Distribuição de Pontos (Últimos 7 Dias)</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Carregando...</p>
                </div>
              ) : (
                <ChartContainer
                  config={{
                    points: { label: "Pontos", color: "hsl(var(--chart-2))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="points" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
