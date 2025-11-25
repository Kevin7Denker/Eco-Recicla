import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const couponSchema = z.object({
  partner_id: z.string().uuid("Selecione um parceiro"),
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
  description: z.string().min(10, "Descrição deve ter no mínimo 10 caracteres"),
  points_required: z.number().positive("Pontos devem ser maior que zero"),
  expiration_date: z.string().min(1, "Data de expiração obrigatória"),
  quantity_available: z.number().positive("Quantidade deve ser maior que zero"),
});

type CouponFormData = z.infer<typeof couponSchema>;

interface Coupon {
  id: string;
  partner_id: string;
  title: string;
  description: string;
  points_required: number;
  expiration_date: string;
  quantity_available: number;
  active: boolean;
  partners: { name: string } | null;
}

interface Partner {
  id: string;
  name: string;
}

export default function CouponsManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const form = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      partner_id: "",
      title: "",
      description: "",
      points_required: 100,
      expiration_date: "",
      quantity_available: 10,
    },
  });

  const fetchData = async () => {
    try {
      const [couponsRes, partnersRes] = await Promise.all([
        supabase.from("coupons").select("*, partners(name)").order("created_at", { ascending: false }),
        supabase.from("partners").select("id, name").eq("active", true).order("name"),
      ]);

      if (couponsRes.error) throw couponsRes.error;
      if (partnersRes.error) throw partnersRes.error;

      setCoupons(couponsRes.data || []);
      setPartners(partnersRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data: CouponFormData) => {
    try {
      if (editingCoupon) {
        const { error } = await supabase
          .from("coupons")
          .update(data)
          .eq("id", editingCoupon.id);

        if (error) throw error;
        toast({ title: "Cupom atualizado com sucesso!" });
      } else {
        const { error } = await supabase.from("coupons").insert(data);

        if (error) throw error;
        toast({ title: "Cupom criado com sucesso!" });
      }

      setIsDialogOpen(false);
      setEditingCoupon(null);
      form.reset();
      fetchData();
    } catch (error) {
      console.error("Error saving coupon:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o cupom",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    form.reset({
      partner_id: coupon.partner_id,
      title: coupon.title,
      description: coupon.description,
      points_required: coupon.points_required,
      expiration_date: format(new Date(coupon.expiration_date), "yyyy-MM-dd"),
      quantity_available: coupon.quantity_available,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cupom?")) return;

    try {
      const { error } = await supabase.from("coupons").delete().eq("id", id);

      if (error) throw error;
      toast({ title: "Cupom excluído com sucesso!" });
      fetchData();
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cupom",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    try {
      const { error } = await supabase
        .from("coupons")
        .update({ active: !coupon.active })
        .eq("id", coupon.id);

      if (error) throw error;
      toast({ title: "Status atualizado!" });
      fetchData();
    } catch (error) {
      console.error("Error toggling status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold">Cupons</h2>
            <p className="text-muted-foreground">Gerencie os cupons de desconto</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingCoupon(null);
                  form.reset();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Cupom
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingCoupon ? "Editar Cupom" : "Novo Cupom"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="partner_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parceiro</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um parceiro" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {partners.map((partner) => (
                              <SelectItem key={partner.id} value={partner.id}>
                                {partner.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título do Cupom</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="points_required"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pontos Necessários</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="quantity_available"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantidade</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="expiration_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Expiração</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>
                          Data em que o cupom expira
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">Salvar</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Cupons</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Parceiro</TableHead>
                    <TableHead>Pontos</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-medium">{coupon.title}</TableCell>
                      <TableCell>{coupon.partners?.name}</TableCell>
                      <TableCell>{coupon.points_required}</TableCell>
                      <TableCell>{coupon.quantity_available}</TableCell>
                      <TableCell>
                        {format(new Date(coupon.expiration_date), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={coupon.active ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => toggleActive(coupon)}
                        >
                          {coupon.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(coupon)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(coupon.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
