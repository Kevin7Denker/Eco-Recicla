import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Clock, Phone, Star, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";

const Map = () => {
  const collectionPoints = [
    {
      id: 1,
      name: "Ponto Central EcoRecicla",
      address: "Av. Principal, 1234 - Centro",
      distance: "0.8 km",
      hours: "Seg-Sex: 8h-18h | Sáb: 8h-12h",
      phone: "(11) 1234-5678",
      rating: 4.8,
      materials: ["Plástico", "Papel", "Metal", "Vidro"],
      status: "Aberto agora"
    },
    {
      id: 2,
      name: "Ponto Zona Norte",
      address: "Rua das Flores, 567 - Zona Norte",
      distance: "1.2 km",
      hours: "Seg-Sex: 7h-19h",
      phone: "(11) 8765-4321",
      rating: 4.6,
      materials: ["Plástico", "Papel", "Metal"],
      status: "Aberto agora"
    },
    {
      id: 3,
      name: "EcoPonto Shopping",
      address: "Shopping Verde, Piso 2 - Centro",
      distance: "2.1 km",
      hours: "Todos os dias: 10h-22h",
      phone: "(11) 2468-1357",
      rating: 4.9,
      materials: ["Plástico", "Papel", "Eletrônicos"],
      status: "Aberto agora"
    },
    {
      id: 4,
      name: "Ponto Bairro Sul",
      address: "Praça da Sustentabilidade, 89",
      distance: "3.5 km",
      hours: "Seg-Sáb: 8h-17h",
      phone: "(11) 9876-5432",
      rating: 4.5,
      materials: ["Todos os tipos"],
      status: "Fecha às 17h"
    }
  ];

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
                <p className="text-xs text-muted-foreground">Encontre o mais próximo</p>
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
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
            <Button className="gradient-eco border-0 flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              Usar localização
            </Button>
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Map Placeholder */}
          <div className="order-2 lg:order-1">
            <Card className="gradient-card border-0 shadow-eco h-[600px] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-full gradient-eco mx-auto flex items-center justify-center">
                    <MapPin className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Mapa Interativo</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Visualize todos os pontos de coleta próximos a você
                    </p>
                    <Badge variant="secondary">Em breve com Google Maps/Mapbox</Badge>
                  </div>
                </div>
              </div>
              
              {/* Mock map markers */}
              <div className="absolute top-20 left-1/4 w-8 h-8 rounded-full gradient-eco flex items-center justify-center shadow-eco animate-bounce">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="absolute bottom-32 right-1/3 w-8 h-8 rounded-full gradient-eco flex items-center justify-center shadow-eco animate-bounce" style={{ animationDelay: '0.2s' }}>
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="absolute top-1/2 right-1/4 w-8 h-8 rounded-full gradient-eco flex items-center justify-center shadow-eco animate-bounce" style={{ animationDelay: '0.4s' }}>
                <MapPin className="w-4 h-4 text-white" />
              </div>
            </Card>
          </div>

          {/* Collection Points List */}
          <div className="order-1 lg:order-2 space-y-4 max-h-[600px] overflow-y-auto">
            {collectionPoints.map((point) => (
              <Card key={point.id} className="gradient-card border-0 shadow-soft p-6 hover:shadow-eco transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{point.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {point.address}
                    </p>
                  </div>
                  <Badge className="bg-success/10 text-success">{point.distance}</Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{point.hours}</span>
                    <Badge variant="secondary" className="ml-auto">{point.status}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{point.phone}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-warning fill-warning" />
                    <span className="font-medium">{point.rating}</span>
                    <span className="text-muted-foreground">(124 avaliações)</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Materiais aceitos:</p>
                  <div className="flex flex-wrap gap-2">
                    {point.materials.map((material, idx) => (
                      <Badge key={idx} variant="outline" className="border-primary/30 text-primary">
                        {material}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 gradient-eco border-0" size="sm">
                    <Navigation className="w-4 h-4 mr-2" />
                    Ver rota
                  </Button>
                  <Button variant="outline" size="sm">
                    Ver detalhes
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
