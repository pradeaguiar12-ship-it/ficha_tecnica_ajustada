import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChefHat,
  FileText,
  Package,
  TrendingUp,
  ArrowRight,
  Calculator,
  DollarSign,
  Sparkles,
  Plus,
  BarChart3,
  Zap,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: FileText,
    title: "Fichas Técnicas",
    description: "Crie fichas profissionais para suas receitas com cálculo automático de custos",
    href: "/ficha-tecnica",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Package,
    title: "Ingredientes",
    description: "Gerencie seu estoque de ingredientes com preços e fatores de correção",
    href: "/ficha-tecnica/ingredientes",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: Calculator,
    title: "Precificação",
    description: "Calcule preços de venda baseados em margens de lucro desejadas",
    href: "/ficha-tecnica/nova",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: BarChart3,
    title: "Dashboard Analítico",
    description: "Visualize métricas, gráficos e insights sobre suas fichas técnicas",
    href: "/dashboard",
    color: "from-amber-500 to-orange-500",
    badge: "Novo",
  },
  {
    icon: Zap,
    title: "Simulador de Cenários",
    description: "Simule variações de preços e veja o impacto em todas as suas fichas",
    href: "/simulador",
    color: "from-violet-500 to-purple-500",
    badge: "Novo",
  },
];

const stats = [
  { label: "Fichas Ativas", value: "3", icon: FileText },
  { label: "Ingredientes", value: "16", icon: Package },
  { label: "Margem Média", value: "38%", icon: TrendingUp },
];

export default function Index() {
  return (
    <MainLayout>
      <div className="space-y-12">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl gradient-hero p-8 md:p-12"
        >
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-white/20 text-white border-0">
                <Sparkles className="h-3 w-3 mr-1" />
                Novo
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Bem-vindo ao Meu Chef
            </h1>
            <p className="text-white/80 text-lg mb-6">
              Calcule custos, defina margens e precifique suas receitas de forma profissional. 
              Tudo que você precisa para uma gestão gastronômica eficiente.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link to="/ficha-tecnica/nova">
                  <Plus className="h-5 w-5" />
                  Nova Ficha Técnica
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-white hover:bg-white/10">
                <Link to="/ficha-tecnica">
                  Ver todas as fichas
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 right-20 w-64 h-64 bg-white/5 rounded-full blur-2xl translate-y-1/2" />
        </motion.section>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-card rounded-2xl border border-border p-6 flex items-center gap-4"
            >
              <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Features */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Funcionalidades</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <Link
                  to={feature.href}
                  className="group block h-full bg-card rounded-2xl border border-border p-6 hover:border-primary/30 hover:shadow-medium transition-all relative"
                >
                  {feature.badge && (
                    <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                      {feature.badge}
                    </Badge>
                  )}
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl border border-border p-8 text-center"
        >
          <div className="max-w-xl mx-auto">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Pronto para precificar?
            </h2>
            <p className="text-muted-foreground mb-6">
              Crie sua primeira ficha técnica e descubra o preço ideal para suas receitas
            </p>
            <Button asChild variant="gradient" size="lg">
              <Link to="/ficha-tecnica/nova">
                Começar agora
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </motion.section>
      </div>
    </MainLayout>
  );
}
