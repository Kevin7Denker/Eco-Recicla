import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type Coupon = Database["public"]["Tables"]["coupons"]["Row"];

const Coupons = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [pointsBalance, setPointsBalance] = useState<number | null>(null);
  const [partners, setPartners] = useState<{ id: string; name: string }[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string>("");
  const [validityFilter, setValidityFilter] = useState<
    "all" | "valid" | "expired"
  >("all");
  const [page, setPage] = useState<number>(1);
  const pageSize = 9;
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    const loadPartners = async () => {
      try {
        const { data } = await supabase
          .from("partners")
          .select("id, name")
          .eq("active", true)
          .order("name", { ascending: true });

        setPartners(data ?? []);
      } catch (err) {
        console.error("Erro carregando parceiros:", err);
      }
    };

    loadPartners();
  }, []);

  useEffect(() => {
    const loadCoupons = async () => {
      setLoading(true);
      try {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
          .from("coupons")
          .select(
            "id, title, description, points_required, expiration_date, quantity_available, partner_id, active, created_at, updated_at",
            { count: "exact" }
          )
          .eq("active", true);

        if (selectedPartner) query = query.eq("partner_id", selectedPartner);

        const todayIso = new Date().toISOString();
        if (validityFilter === "valid")
          query = query.gte("expiration_date", todayIso);
        if (validityFilter === "expired")
          query = query.lt("expiration_date", todayIso);

        query = query
          .order("points_required", { ascending: true })
          .range(from, to);

        const { data, count, error } = await query;

        if (error) throw error;
        setCoupons(data ?? []);
        setTotalCount(count ?? 0);
      } catch (err) {
        console.error("Erro carregando cupons:", err);
        toast({
          title: "Erro",
          description: "Não foi possível carregar cupons.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadCoupons();
  }, [page, selectedPartner, validityFilter, toast]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("points_balance")
          .eq("id", user.id)
          .maybeSingle();
        if (!error && data) setPointsBalance(data.points_balance ?? 0);
      } catch (err) {
        console.error("Erro carregando perfil:", err);
      }
    };

    loadProfile();
  }, [user]);

  const handleRedeem = (coupon: Coupon) => {
    if (!user) {
      toast({
        title: "Faça login",
        description: "Entre para resgatar cupons.",
        variant: "default",
      });
      return;
    }

    if ((coupon.quantity_available ?? 0) <= 0) {
      toast({
        title: "Indisponível",
        description: "Cupom esgotado.",
        variant: "destructive",
      });
      return;
    }

    if ((pointsBalance ?? 0) < (coupon.points_required ?? 0)) {
      toast({
        title: "Pontos insuficientes",
        description:
          "Você não tem pontos suficientes para resgatar este cupom.",
        variant: "destructive",
      });
      return;
    }

    // Placeholder: actual resgate deve criar uma redemption e decrementar pontos no servidor
    toast({
      title: "Atenção",
      description: "Resgate ainda não implementado nesta tela.",
      variant: "default",
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Cupons Disponíveis</h1>
          <Link
            to="/dashboard"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Voltar
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sm text-muted-foreground">
                  Parceiro:
                </label>
                <select
                  value={selectedPartner}
                  onChange={(e) => {
                    setSelectedPartner(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-md border px-2 py-1 bg-white"
                >
                  <option value="">Todos parceiros</option>
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm text-muted-foreground">
                  Validade:
                </label>
                <select
                  value={validityFilter}
                  onChange={(e) => {
                    setValidityFilter(
                      e.target.value as "all" | "valid" | "expired"
                    );
                    setPage(1);
                  }}
                  className="rounded-md border px-2 py-1 bg-white"
                >
                  <option value="all">Todos</option>
                  <option value="valid">Válidos</option>
                  <option value="expired">Expirados</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum cupom disponível no momento.
                </p>
              )}

              {coupons.map((c) => (
                <Card key={c.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{c.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {c.description}
                      </p>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">
                      {c.points_required} pts
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground mb-4">
                    Válido até:{" "}
                    {c.expiration_date
                      ? formatDistanceToNow(new Date(c.expiration_date), {
                          addSuffix: true,
                          locale: ptBR,
                        })
                      : "—"}
                  </p>

                  <div className="flex gap-3">
                    <Button
                      className="w-full gradient-eco border-0"
                      onClick={() => handleRedeem(c)}
                      disabled={(c.quantity_available ?? 0) <= 0}
                    >
                      Resgatar
                    </Button>
                    <Button variant="outline" asChild>
                      <Link
                        to={`/partners/${c.partner_id ?? ""}`}
                        className="flex items-center gap-2"
                      >
                        <Gift className="w-4 h-4" />
                        Mais info
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {Math.min((page - 1) * pageSize + 1, totalCount || 0)}{" "}
                - {Math.min(page * pageSize, totalCount || 0)} de {totalCount}{" "}
                cupons
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <div className="text-sm">
                  Página {page} de{" "}
                  {Math.max(1, Math.ceil((totalCount || 0) / pageSize))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * pageSize >= (totalCount || 0)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Coupons;
