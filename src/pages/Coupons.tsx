import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Ticket, Clock, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Coupon = Database["public"]["Tables"]["coupons"]["Row"] & {
  partners?: { name: string; logo_url?: string | null } | null;
};

type Redemption = Database["public"]["Tables"]["redemptions"]["Row"] & {
  coupons?: Coupon | null;
};

const Coupons = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [pointsBalance, setPointsBalance] = useState<number | null>(null);
  const [partners, setPartners] = useState<{ id: string; name: string }[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string>("");
  const [validityFilter, setValidityFilter] = useState<
    "all" | "valid" | "expired"
  >("all");
  const [page, setPage] = useState<number>(1);
  const pageSize = 9;
  const [totalCount, setTotalCount] = useState<number>(0);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [activeTab, setActiveTab] = useState<"available" | "redeemed">("available");

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
      if (activeTab !== "available") return;
      
      setLoading(true);
      try {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
          .from("coupons")
          .select(
            "*, partners(name, logo_url)",
            { count: "exact" }
          )
          .eq("active", true)
          .gt("quantity_available", 0);

        if (selectedPartner) query = query.eq("partner_id", selectedPartner);

        const todayIso = new Date().toISOString();
        if (validityFilter === "valid")
          query = query.gte("expiration_date", todayIso);
        if (validityFilter === "expired")
          query = query.lt("expiration_date", todayIso);
        else
          query = query.gte("expiration_date", todayIso); // Default to valid only

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
  }, [page, selectedPartner, validityFilter, toast, activeTab]);

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

  useEffect(() => {
    const loadRedemptions = async () => {
      if (activeTab !== "redeemed" || !user) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("redemptions")
          .select("*, coupons(*, partners(name, logo_url))")
          .eq("user_id", user.id)
          .order("redeemed_at", { ascending: false });

        if (error) throw error;
        setRedemptions(data ?? []);
      } catch (err) {
        console.error("Erro carregando resgates:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRedemptions();
  }, [user, activeTab]);

  const handleRedeemClick = (coupon: Coupon) => {
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

    setSelectedCoupon(coupon);
    setShowConfirmDialog(true);
  };

  const handleConfirmRedeem = async () => {
    if (!user || !selectedCoupon) return;

    setRedeeming(true);
    try {
      // 1. Create redemption
      const { error: redemptionError } = await supabase
        .from("redemptions")
        .insert({
          user_id: user.id,
          coupon_id: selectedCoupon.id,
        });

      if (redemptionError) throw redemptionError;

      // 2. Update user points balance
      const newBalance = (pointsBalance ?? 0) - selectedCoupon.points_required;
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ points_balance: newBalance })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // 3. Update coupon quantity
      const { error: couponError } = await supabase
        .from("coupons")
        .update({ 
          quantity_available: selectedCoupon.quantity_available - 1 
        })
        .eq("id", selectedCoupon.id);

      if (couponError) throw couponError;

      // Update local state
      setPointsBalance(newBalance);
      setCoupons(prev => prev.map(c => 
        c.id === selectedCoupon.id 
          ? { ...c, quantity_available: c.quantity_available - 1 }
          : c
      ));

      toast({
        title: "Cupom resgatado!",
        description: `Você gastou ${selectedCoupon.points_required} pontos. Novo saldo: ${newBalance} pontos.`,
      });

      setShowConfirmDialog(false);
      setSelectedCoupon(null);
    } catch (err) {
      console.error("Erro ao resgatar cupom:", err);
      toast({
        title: "Erro",
        description: "Não foi possível resgatar o cupom. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-primary" />
                Marketplace de Cupons
              </h1>
              <p className="text-muted-foreground mt-1">
                Troque seus pontos por cupons e benefícios exclusivos
              </p>
            </div>
            <Link
              to="/dashboard"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Voltar
            </Link>
          </div>

          {user && (
            <Card className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Gift className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Seu saldo</p>
                    <p className="text-2xl font-bold text-primary">
                      {pointsBalance ?? 0} pontos
                    </p>
                  </div>
                </div>
                <Button variant="outline" asChild>
                  <Link to="/delivery">Ganhar mais pontos</Link>
                </Button>
              </div>
            </Card>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "available" | "redeemed")} className="mb-6">
          <TabsList>
            <TabsTrigger value="available" className="flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              Cupons Disponíveis
            </TabsTrigger>
            <TabsTrigger value="redeemed" className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Meus Cupons
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="mt-6">

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
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
                      className="rounded-md border px-3 py-2 bg-background"
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
                      className="rounded-md border px-3 py-2 bg-background"
                    >
                      <option value="all">Todos</option>
                      <option value="valid">Válidos</option>
                      <option value="expired">Expirados</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coupons.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium text-muted-foreground">
                        Nenhum cupom disponível no momento
                      </p>
                    </div>
                  )}

                  {coupons.map((c) => {
                    const canAfford = (pointsBalance ?? 0) >= c.points_required;
                    const isExpired = c.expiration_date && new Date(c.expiration_date) < new Date();
                    
                    return (
                      <Card key={c.id} className="p-5 hover:shadow-lg transition-shadow">
                        {c.partners?.logo_url && (
                          <div className="mb-4 h-16 flex items-center justify-center bg-muted/50 rounded-lg p-2">
                            <img 
                              src={c.partners.logo_url} 
                              alt={c.partners.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        )}
                        
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{c.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {c.partners?.name ?? "Parceiro"}
                            </p>
                            <p className="text-sm text-foreground/80">
                              {c.description}
                            </p>
                          </div>
                          <Badge 
                            className={canAfford ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
                          >
                            {c.points_required} pts
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                          <Clock className="w-3 h-3" />
                          <span>
                            Válido até:{" "}
                            {c.expiration_date
                              ? formatDistanceToNow(new Date(c.expiration_date), {
                                  addSuffix: true,
                                  locale: ptBR,
                                })
                              : "—"}
                          </span>
                        </div>

                        {c.quantity_available <= 5 && c.quantity_available > 0 && (
                          <Badge variant="destructive" className="mb-3">
                            Apenas {c.quantity_available} restantes
                          </Badge>
                        )}

                        <Button
                          className="w-full gradient-eco border-0"
                          onClick={() => handleRedeemClick(c)}
                          disabled={!canAfford || c.quantity_available <= 0 || isExpired}
                        >
                          {!canAfford 
                            ? `Faltam ${c.points_required - (pointsBalance ?? 0)} pontos`
                            : c.quantity_available <= 0
                            ? "Esgotado"
                            : isExpired
                            ? "Expirado"
                            : "Resgatar Cupom"
                          }
                        </Button>
                      </Card>
                    );
                  })}
                </div>

                {coupons.length > 0 && (
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
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="redeemed" className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : redemptions.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  Você ainda não resgatou nenhum cupom
                </p>
                <Button 
                  className="mt-4" 
                  variant="outline"
                  onClick={() => setActiveTab("available")}
                >
                  Ver cupons disponíveis
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {redemptions.map((r) => {
                  const coupon = r.coupons;
                  if (!coupon) return null;
                  
                  return (
                    <Card key={r.id} className="p-5 border-2 border-success/20 bg-success/5">
                      <Badge className="mb-3 bg-success text-success-foreground">
                        Resgatado
                      </Badge>
                      
                      {coupon.partners?.logo_url && (
                        <div className="mb-4 h-16 flex items-center justify-center bg-muted/50 rounded-lg p-2">
                          <img 
                            src={coupon.partners.logo_url} 
                            alt={coupon.partners.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      )}
                      
                      <h3 className="font-semibold text-lg mb-1">{coupon.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {coupon.partners?.name ?? "Parceiro"}
                      </p>
                      <p className="text-sm text-foreground/80 mb-4">
                        {coupon.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>
                          Resgatado{" "}
                          {formatDistanceToNow(new Date(r.redeemed_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>
                          Válido até:{" "}
                          {coupon.expiration_date
                            ? new Date(coupon.expiration_date).toLocaleDateString("pt-BR")
                            : "—"}
                        </span>
                      </div>
                      
                      <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
                        <p className="text-xs text-muted-foreground mb-1">Código do cupom:</p>
                        <p className="font-mono font-bold text-primary">{r.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar resgate de cupom</AlertDialogTitle>
              <AlertDialogDescription>
                Você está prestes a resgatar o cupom <strong>"{selectedCoupon?.title}"</strong> por{" "}
                <strong>{selectedCoupon?.points_required} pontos</strong>.
                <br /><br />
                Seu novo saldo será: <strong>{(pointsBalance ?? 0) - (selectedCoupon?.points_required ?? 0)} pontos</strong>
                <br /><br />
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={redeeming}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmRedeem}
                disabled={redeeming}
                className="gradient-eco border-0"
              >
                {redeeming ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resgatando...
                  </>
                ) : (
                  "Confirmar resgate"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Coupons;
