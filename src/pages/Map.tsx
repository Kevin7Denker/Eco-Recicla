import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Clock, Phone, Star, Search, Filter, Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MapView } from "@/components/MapView";

interface CollectionPoint {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  opening_hours: string;
  active: boolean;
}

const Map = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [collectionPoints, setCollectionPoints] = useState<CollectionPoint[]>([]);
  const [filteredPoints, setFilteredPoints] = useState<CollectionPoint[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPoint, setSelectedPoint] = useState<CollectionPoint | null>(null);

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
          .select("*")
          .eq("active", true)
          .order("name");

        if (error) throw error;

        setCollectionPoints(data || []);
        setFilteredPoints(data || []);
      } catch (error: any) {
        toast({
          title: "Erro ao carregar pontos de coleta",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCollectionPoints();
    }
  }, [user, toast]);

  // Get user location
  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserLocation(location);
          setLoading(false);
          toast({
            title: "Localização obtida!",
            description: "Mostrando pontos próximos a você",
          });
        },
        (error) => {
          setLoading(false);
          toast({
            title: "Erro ao obter localização",
            description: "Não foi possível acessar sua localização. Verifique as permissões.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Geolocalização não disponível",
        description: "Seu navegador não suporta geolocalização",
        variant: "destructive",
      });
    }
  };

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  // Get sorted points by distance
  const getPointsWithDistance = () => {
    if (!userLocation) return filteredPoints;

    return filteredPoints
      .map((point) => ({
        ...point,
        distance: calculateDistance(
          userLocation[0],
          userLocation[1],
          point.latitude,
          point.longitude
        ),
      }))
      .sort((a, b) => a.distance - b.distance);
  };

  // Search filter
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPoints(collectionPoints);
    } else {
      const filtered = collectionPoints.filter(
        (point) =>
          point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          point.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPoints(filtered);
    }
  }, [searchTerm, collectionPoints]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando pontos de coleta...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const pointsWithDistance = getPointsWithDistance();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-eco flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Pontos de Coleta</h1>
                <p className="text-xs text-muted-foreground">
                  {collectionPoints.length} pontos disponíveis
                </p>
              </div>
            </Link>
            
            <Button variant="outline" size="sm">
              <Link to="/dashboard">Voltar</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <Card className="gradient-card border-0 shadow-soft p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por endereço ou nome do ponto..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              onClick={getUserLocation}
              className="gradient-eco border-0 flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              Usar minha localização
            </Button>
          </div>
        </Card>

        {filteredPoints.length === 0 ? (
          <Card className="gradient-card border-0 shadow-soft p-12">
            <div className="text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-semibold">Nenhum ponto encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar sua busca ou limpar os filtros
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Map */}
            <div className="order-2 lg:order-1">
              <Card className="gradient-card border-0 shadow-eco h-[600px] overflow-hidden p-0">
                <MapView
                  collectionPoints={filteredPoints}
                  userLocation={userLocation}
                  onPointSelect={setSelectedPoint}
                />
              </Card>
            </div>

            {/* Collection Points List */}
            <div className="order-1 lg:order-2 space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {pointsWithDistance.map((point) => (
                <Card 
                  key={point.id} 
                  className={`gradient-card border-0 shadow-soft p-6 hover:shadow-eco transition-all cursor-pointer ${
                    selectedPoint?.id === point.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedPoint(point)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{point.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {point.address}
                      </p>
                    </div>
                    {userLocation && 'distance' in point && typeof (point as any).distance === 'number' && (
                      <Badge className="bg-success/10 text-success">
                        {(point as any).distance < 1 
                          ? `${((point as any).distance * 1000).toFixed(0)}m` 
                          : `${(point as any).distance.toFixed(1)}km`}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{point.opening_hours}</span>
                      <Badge variant="secondary" className="ml-auto bg-success/10 text-success">
                        Aberto
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 gradient-eco border-0" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`,
                          "_blank"
                        );
                      }}
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Ver rota
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Map;
