/**
 * Dashboard Analítico
 * 
 * Exibe métricas, gráficos e insights sobre as fichas técnicas
 * e ingredientes do sistema.
 * 
 * @module pages/Dashboard
 */

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  AlertTriangle,
  BarChart3,
  PieChart,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ficha-tecnica/StatCard";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart as RechartsPieChart, Pie, Cell, Legend } from "recharts";
import { useSheets } from "@/hooks/useSheets";
import { useIngredients } from "@/hooks/useIngredients";
import { formatCurrency, formatPercent } from "@/lib/calculations";
import { recipeCategories } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { sheets, stats } = useSheets();
  const { allIngredients, stats: ingredientStats } = useIngredients();

  // Métricas por categoria
  const categoryMetrics = useMemo(() => {
    const metrics = recipeCategories.map(category => {
      const categorySheets = sheets.filter(s => s.categoryId === category.id);
      const avgMargin = categorySheets.length > 0
        ? categorySheets.reduce((acc, s) => acc + s.actualMargin, 0) / categorySheets.length
        : 0;
      const avgCost = categorySheets.length > 0
        ? categorySheets.reduce((acc, s) => acc + s.costPerUnit, 0) / categorySheets.length
        : 0;
      const avgPrice = categorySheets.length > 0
        ? categorySheets.reduce((acc, s) => acc + s.suggestedPrice, 0) / categorySheets.length
        : 0;

      return {
        category: category.name,
        icon: category.icon,
        count: categorySheets.length,
        avgMargin,
        avgCost,
        avgPrice,
      };
    });

    return metrics.filter(m => m.count > 0);
  }, [sheets]);

  // Ingredientes mais caros
  const expensiveIngredients = useMemo(() => {
    return [...(allIngredients || [])]
      .sort((a, b) => b.unitPrice - a.unitPrice)
      .slice(0, 10)
      .map(ing => ({
        name: ing.name,
        price: ing.unitPrice,
        unit: ing.priceUnit,
      }));
  }, [allIngredients]);

  // Fichas com margem baixa
  const lowMarginSheets = useMemo(() => {
    return sheets
      .filter(s => s.actualMargin < 20)
      .sort((a, b) => a.actualMargin - b.actualMargin)
      .slice(0, 10)
      .map(s => ({
        name: s.name,
        code: s.code,
        margin: s.actualMargin,
        cost: s.costPerUnit,
        price: s.suggestedPrice,
      }));
  }, [sheets]);

  // Distribuição de margens
  const marginDistribution = useMemo(() => {
    const ranges = [
      { name: '0-10%', min: 0, max: 10, count: 0 },
      { name: '10-20%', min: 10, max: 20, count: 0 },
      { name: '20-30%', min: 20, max: 30, count: 0 },
      { name: '30-40%', min: 30, max: 40, count: 0 },
      { name: '40%+', min: 40, max: 100, count: 0 },
    ];

    sheets.forEach(sheet => {
      const range = ranges.find(r => sheet.actualMargin >= r.min && sheet.actualMargin < r.max);
      if (range) range.count++;
    });

    return ranges;
  }, [sheets]);

  // Dados para gráfico de barras (margem por categoria)
  const chartData = categoryMetrics.map(m => ({
    name: m.category,
    margem: m.avgMargin,
    custo: m.avgCost,
    preco: m.avgPrice,
  }));

  const chartConfig = {
    margem: {
      label: "Margem Média",
      color: "hsl(var(--chart-1))",
    },
    custo: {
      label: "Custo Médio",
      color: "hsl(var(--chart-2))",
    },
    preco: {
      label: "Preço Médio",
      color: "hsl(var(--chart-3))",
    },
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Analítico</h1>
            <p className="text-muted-foreground mt-1">
              Visão geral e insights sobre suas fichas técnicas
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/ficha-tecnica">
              Ver Todas as Fichas
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total de Fichas"
            value={stats.total}
            subtitle={`${stats.active} ativas, ${stats.draft} rascunhos`}
            icon={<BarChart3 className="h-6 w-6 text-primary" />}
          />
          <StatCard
            title="Margem Média"
            value={`${stats.avgMargin}%`}
            subtitle="de todas as fichas"
            icon={<TrendingUp className="h-6 w-6 text-white" />}
            variant="primary"
          />
          <StatCard
            title="Ingredientes"
            value={ingredientStats.total}
            subtitle={`${ingredientStats.totalSystem} sistema + ${ingredientStats.totalUser} seus`}
            icon={<Package className="h-6 w-6 text-primary" />}
          />
          <StatCard
            title="Alertas"
            value={stats.lowMarginCount}
            subtitle="margem abaixo de 20%"
            icon={<AlertTriangle className="h-6 w-6 text-amber-600" />}
            variant="warning"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Margem por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Margem Média por Categoria
              </CardTitle>
              <CardDescription>
                Comparação de margens entre diferentes categorias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="margem" fill="var(--color-margem)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Distribuição de Margens */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Distribuição de Margens
              </CardTitle>
              <CardDescription>
                Quantidade de fichas por faixa de margem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <RechartsPieChart>
                  <Pie
                    data={marginDistribution}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, count }) => `${name}: ${count}`}
                  >
                    {marginDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                  <Legend />
                </RechartsPieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ingredientes Mais Caros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Ingredientes Mais Caros
              </CardTitle>
              <CardDescription>
                Top 10 ingredientes com maior preço unitário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expensiveIngredients.map((ing, index) => (
                  <motion.div
                    key={ing.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="font-medium">{ing.name}</span>
                    </div>
                    <Badge variant="secondary">
                      {formatCurrency(ing.price)}/{ing.unit}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Fichas com Margem Baixa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Fichas com Margem Baixa
              </CardTitle>
              <CardDescription>
                Fichas que precisam de atenção (margem &lt; 20%)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lowMarginSheets.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhuma ficha com margem baixa!</p>
                  <p className="text-sm">Todas as fichas estão com margem saudável.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lowMarginSheets.map((sheet, index) => (
                    <motion.div
                      key={sheet.code}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-3 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{sheet.name}</p>
                          <p className="text-xs text-muted-foreground">{sheet.code}</p>
                        </div>
                        <Badge
                          variant={sheet.margin < 10 ? 'destructive' : 'warning'}
                        >
                          {formatPercent(sheet.margin)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Custo: {formatCurrency(sheet.cost)}</span>
                        <span>Preço: {formatCurrency(sheet.price)}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Métricas por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Métricas Detalhadas por Categoria</CardTitle>
            <CardDescription>
              Análise completa de cada categoria de receitas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryMetrics.map((metric) => (
                <motion.div
                  key={metric.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border border-border bg-card"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{metric.icon}</span>
                    <div>
                      <p className="font-semibold">{metric.category}</p>
                      <p className="text-xs text-muted-foreground">
                        {metric.count} ficha{metric.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Margem Média:</span>
                      <span className="font-semibold">{formatPercent(metric.avgMargin)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Custo Médio:</span>
                      <span className="font-semibold">{formatCurrency(metric.avgCost)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Preço Médio:</span>
                      <span className="font-semibold text-primary">
                        {formatCurrency(metric.avgPrice)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
