import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Database } from "@/integrations/supabase/types";

type DeliveryRow = Database["public"]["Tables"]["deliveries"]["Row"] & {
  collection_points?: { name: string } | null;
};

const DashboardHistory: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deliveries, setDeliveries] = useState<DeliveryRow[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("deliveries")
        .select(
          `id, weight_kg, material_type, points_earned, created_at, collection_points (name)`
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading deliveries:", error);
        setDeliveries([]);
      } else {
        setDeliveries((data as DeliveryRow[]) ?? []);
      }

      setLoading(false);
    };

    load();
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Histórico de Entregas</h2>
          <p className="text-sm text-muted-foreground">
            Registros das suas entregas e pontos ganhos
          </p>
        </div>
      </div>

      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Peso (kg)</TableHead>
              <TableHead>Pontos</TableHead>
              <TableHead>Parceiro / Ponto de Coleta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : deliveries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Nenhuma entrega encontrada.
                </TableCell>
              </TableRow>
            ) : (
              deliveries.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(d.created_at).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(d.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">
                    {d.material_type}
                  </TableCell>
                  <TableCell>{d.weight_kg.toFixed(2)}</TableCell>
                  <TableCell>{d.points_earned}</TableCell>
                  <TableCell>
                    {d.collection_points?.name ?? "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TableCaption>Últimas entregas registradas no sistema</TableCaption>
      </Card>
    </div>
  );
};

export default DashboardHistory;
