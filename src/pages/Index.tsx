import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Leaf, MapPin, Award, Users, Sparkles, ArrowRight, Recycle } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-light to-accent">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-white space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Transforme reciclagem em recompensas</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Recicle e ganhe
                <span className="block text-primary-glow">cupons de desconto</span>
              </h1>
              
              <p className="text-lg text-white/90 max-w-xl">
                Conectamos você a pontos de coleta próximos e recompensamos cada ação sustentável com benefícios reais em empresas parceiras.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg">
                  <Link to="/dashboard" className="flex items-center gap-2">
                    Começar agora
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10">
                  Como funciona
                </Button>
              </div>
              
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold">1.2M+</div>
                  <div className="text-sm text-white/80">kg reciclados</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">50K+</div>
                  <div className="text-sm text-white/80">usuários ativos</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">200+</div>
                  <div className="text-sm text-white/80">parceiros</div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <div className="relative w-full max-w-md mx-auto">
                <div className="absolute inset-0 bg-white/20 backdrop-blur-xl rounded-3xl transform rotate-6"></div>
                <Card className="relative gradient-card border-0 shadow-eco p-8 space-y-6 animate-float">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Seu saldo</p>
                      <h3 className="text-4xl font-bold text-primary">1,250</h3>
                      <p className="text-sm text-muted-foreground">pontos EcoRecicla</p>
                    </div>
                    <div className="w-16 h-16 rounded-full gradient-eco flex items-center justify-center">
                      <Leaf className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Recycle className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Plástico - 5kg</p>
                        <p className="text-xs text-muted-foreground">+250 pontos</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                        <Award className="w-5 h-5 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Cupom disponível</p>
                        <p className="text-xs text-muted-foreground">20% de desconto</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Como funciona o EcoRecicla</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simplificamos a reciclagem e recompensamos sua contribuição para um planeta mais sustentável
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="gradient-card border-0 shadow-soft p-6 space-y-4 hover:shadow-eco transition-shadow">
              <div className="w-12 h-12 rounded-full gradient-eco flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Encontre pontos</h3>
              <p className="text-muted-foreground">
                Localize pontos de coleta próximos a você com nosso mapa interativo
              </p>
            </Card>
            
            <Card className="gradient-card border-0 shadow-soft p-6 space-y-4 hover:shadow-eco transition-shadow">
              <div className="w-12 h-12 rounded-full gradient-eco flex items-center justify-center">
                <Recycle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Entregue materiais</h3>
              <p className="text-muted-foreground">
                Leve seus recicláveis e registre a entrega no app para ganhar pontos
              </p>
            </Card>
            
            <Card className="gradient-card border-0 shadow-soft p-6 space-y-4 hover:shadow-eco transition-shadow">
              <div className="w-12 h-12 rounded-full gradient-eco flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Acumule pontos</h3>
              <p className="text-muted-foreground">
                Cada kg reciclado gera pontos baseados no tipo de material
              </p>
            </Card>
            
            <Card className="gradient-card border-0 shadow-soft p-6 space-y-4 hover:shadow-eco transition-shadow">
              <div className="w-12 h-12 rounded-full gradient-eco flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Troque por cupons</h3>
              <p className="text-muted-foreground">
                Use seus pontos para obter descontos em centenas de empresas parceiras
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Juntos por um futuro mais verde
            </h2>
            <p className="text-lg text-muted-foreground">
              Nossa comunidade já fez a diferença. Seja parte dessa transformação!
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 pt-8">
              <div className="space-y-2">
                <div className="w-16 h-16 rounded-full gradient-eco mx-auto flex items-center justify-center">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-primary">342 ton</div>
                <p className="text-muted-foreground">de CO₂ evitados</p>
              </div>
              
              <div className="space-y-2">
                <div className="w-16 h-16 rounded-full gradient-eco mx-auto flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-primary">50K+</div>
                <p className="text-muted-foreground">famílias engajadas</p>
              </div>
              
              <div className="space-y-2">
                <div className="w-16 h-16 rounded-full gradient-eco mx-auto flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-primary">R$ 2.5M</div>
                <p className="text-muted-foreground">em descontos gerados</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Pronto para fazer a diferença?
            </h2>
            <p className="text-lg text-white/90">
              Junte-se a milhares de pessoas que já estão transformando o mundo através da reciclagem
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg">
                <Link to="/dashboard" className="flex items-center gap-2">
                  Criar conta grátis
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10">
                Sou uma empresa
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
