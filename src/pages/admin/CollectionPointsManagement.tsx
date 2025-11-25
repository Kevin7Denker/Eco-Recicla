import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const pointSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  address: z.string().min(5, "Endereço deve ter no mínimo 5 caracteres"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  opening_hours: z.string().min(3, "Horário de funcionamento obrigatório"),
});

type PointFormData = z.infer<typeof pointSchema>;

interface CollectionPoint {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  opening_hours: string;
  active: boolean;
}

export default function CollectionPointsManagement() {
  const [points, setPoints] = useState<CollectionPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<CollectionPoint | null>(null);

  const form = useForm<PointFormData>({
    resolver: zodResolver(pointSchema),
    defaultValues: {
      name: "",
      address: "",
      latitude: 0,
      longitude: 0,
      opening_hours: "",
    },
  });

  const fetchPoints = async () => {
    try {
      const { data, error } = await supabase
        .from("collection_points")
        .select("*")
        .order("name");

      if (error) throw error;
      setPoints(data || []);
    } catch (error) {
      console.error("Error fetching points:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pontos de coleta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, []);

  const onSubmit = async (data: PointFormData) => {
    try {
      if (editingPoint) {
        const { error } = await supabase
          .from("collection_points")
          .update(data)
          .eq("id", editingPoint.id);

        if (error) throw error;
        toast({ title: "Ponto atualizado com sucesso!" });
      } else {
        const { error } = await supabase.from("collection_points").insert(data);

        if (error) throw error;
        toast({ title: "Ponto criado com sucesso!" });
      }

      setIsDialogOpen(false);
      setEditingPoint(null);
      form.reset();
      fetchPoints();
    } catch (error) {
      console.error("Error saving point:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o ponto de coleta",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (point: CollectionPoint) => {
    setEditingPoint(point);
    form.reset({
      name: point.name,
      address: point.address,
      latitude: Number(point.latitude),
      longitude: Number(point.longitude),
      opening_hours: point.opening_hours,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este ponto?")) return;

    try {
      const { error } = await supabase.from("collection_points").delete().eq("id", id);

      if (error) throw error;
      toast({ title: "Ponto excluído com sucesso!" });
      fetchPoints();
    } catch (error) {
      console.error("Error deleting point:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o ponto",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (point: CollectionPoint) => {
    try {
      const { error } = await supabase
        .from("collection_points")
        .update({ active: !point.active })
        .eq("id", point.id);

      if (error) throw error;
      toast({ title: "Status atualizado!" });
      fetchPoints();
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
            <h2 className="text-3xl font-bold">Pontos de Coleta</h2>
            <p className="text-muted-foreground">Gerencie os pontos de coleta</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingPoint(null);
                  form.reset();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Ponto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingPoint ? "Editar Ponto" : "Novo Ponto de Coleta"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.000001"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.000001"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="opening_hours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário de Funcionamento</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Seg-Sex: 8h-18h" />
                        </FormControl>
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
            <CardTitle>Lista de Pontos</CardTitle>
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
                    <TableHead>Nome</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {points.map((point) => (
                    <TableRow key={point.id}>
                      <TableCell className="font-medium">{point.name}</TableCell>
                      <TableCell>{point.address}</TableCell>
                      <TableCell>{point.opening_hours}</TableCell>
                      <TableCell>
                        <Badge
                          variant={point.active ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => toggleActive(point)}
                        >
                          {point.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(point)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(point.id)}
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
