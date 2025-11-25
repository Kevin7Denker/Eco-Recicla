import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Package, MapPin, Weight, Award } from "lucide-react";

// Conversion rates: points per kg
const POINTS_PER_KG = {
  papel: 10,
  plastico: 15,
  vidro: 8,
  metal: 20,
  outro: 5,
} as const;

const deliverySchema = z.object({
  collection_point_id: z.string().uuid({ message: "Selecione um ponto de coleta" }),
  material_type: z.union([
    z.literal("papel"),
    z.literal("plastico"),
    z.literal("vidro"),
    z.literal("metal"),
    z.literal("outro"),
  ]),
  weight_kg: z.number().positive({ message: "O peso deve ser maior que zero" }).max(1000, { message: "Peso máximo: 1000 kg" }),
});

type DeliveryFormData = z.infer<typeof deliverySchema>;

interface CollectionPoint {
  id: string;
  name: string;
  address: string;
}

export default function DeliveryRegistration() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [collectionPoints, setCollectionPoints] = useState<CollectionPoint[]>([]);
  const [isLoadingPoints, setIsLoadingPoints] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedPoints, setCalculatedPoints] = useState<number | null>(null);

  const form = useForm<DeliveryFormData>({
    resolver: zodResolver(deliverySchema) as any,
    defaultValues: {
      collection_point_id: "",
      material_type: undefined as any,
      weight_kg: 0,
    },
  });

  const watchWeight = form.watch("weight_kg");
  const watchMaterialType = form.watch("material_type");

  // Calculate points in real-time
  useEffect(() => {
    if (watchWeight > 0 && watchMaterialType) {
      const points = Math.round(watchWeight * POINTS_PER_KG[watchMaterialType]);
      setCalculatedPoints(points);
    } else {
      setCalculatedPoints(null);
    }
  }, [watchWeight, watchMaterialType]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Fetch collection points
  useEffect(() => {
    const fetchCollectionPoints = async () => {
      try {
        const { data, error } = await supabase
          .from("collection_points")
          .select("id, name, address")
          .eq("active", true)
          .order("name");

        if (error) throw error;
        setCollectionPoints(data || []);
      } catch (error) {
        console.error("Error fetching collection points:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os pontos de coleta",
          variant: "destructive",
        });
      } finally {
        setIsLoadingPoints(false);
      }
    };

    if (user) {
      fetchCollectionPoints();
    }
  }, [user]);

  const onSubmit = async (data: DeliveryFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const pointsEarned = Math.round(data.weight_kg * POINTS_PER_KG[data.material_type]);

      // Insert delivery record
      const { error: deliveryError } = await supabase.from("deliveries").insert({
        user_id: user.id,
        collection_point_id: data.collection_point_id,
        material_type: data.material_type,
        weight_kg: data.weight_kg,
        points_earned: pointsEarned,
      });

      if (deliveryError) throw deliveryError;

      // Update user's points balance
      const { data: profile } = await supabase
        .from("profiles")
        .select("points_balance")
        .eq("id", user.id)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({ points_balance: profile.points_balance + pointsEarned })
          .eq("id", user.id);
      }

      toast({
        title: "Entrega registrada!",
        description: `Você ganhou ${pointsEarned} pontos!`,
      });

      form.reset();
      setCalculatedPoints(null);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error registering delivery:", error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar a entrega. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => navigate("/dashboard")} className="mb-6">
          ← Voltar ao Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              Registrar Entrega de Material
            </CardTitle>
            <CardDescription>
              Registre sua entrega de materiais recicláveis e acumule pontos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="collection_point_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Ponto de Coleta
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoadingPoints}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um ponto de coleta" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {collectionPoints.map((point) => (
                            <SelectItem key={point.id} value={point.id}>
                              {point.name} - {point.address}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Escolha o local onde você entregou o material
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="material_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Tipo de Material
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de material" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="papel">
                            Papel ({POINTS_PER_KG.papel} pts/kg)
                          </SelectItem>
                          <SelectItem value="plastico">
                            Plástico ({POINTS_PER_KG.plastico} pts/kg)
                          </SelectItem>
                          <SelectItem value="vidro">
                            Vidro ({POINTS_PER_KG.vidro} pts/kg)
                          </SelectItem>
                          <SelectItem value="metal">
                            Metal ({POINTS_PER_KG.metal} pts/kg)
                          </SelectItem>
                          <SelectItem value="outro">
                            Outro ({POINTS_PER_KG.outro} pts/kg)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Cada tipo tem uma pontuação diferente por quilograma
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight_kg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Weight className="h-4 w-4" />
                        Peso (kg)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1000"
                          placeholder="0.0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Informe o peso do material em quilogramas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {calculatedPoints !== null && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-primary" />
                          <span className="font-medium">Pontos a ganhar:</span>
                        </div>
                        <span className="text-2xl font-bold text-primary">
                          {calculatedPoints} pts
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    "Registrar Entrega"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
