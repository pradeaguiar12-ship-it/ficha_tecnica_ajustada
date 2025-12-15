/**
 * Página do Simulador de Cenários
 * 
 * Permite simular variações de preços de ingredientes
 * e ver o impacto em todas as fichas técnicas.
 * 
 * @module pages/Simulador
 */

import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calculator,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Target,
  DollarSign,
  BarChart3,
  Zap,
  CheckCircle2,
  XCircle,
  Info,
  ExternalLink,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useSheets } from "@/hooks/useSheets";
import { useIngredients } from "@/hooks/useIngredients";
import { simulatePriceChange, findSubstituteIngredients } from "@/lib/simulator";
import { formatCurrency, formatPercent } from "@/lib/calculations";
import { cn } from "@/lib/utils";

export default function Simulador() {
  const { sheets } = useSheets();
  const { allIngredients } = useIngredients();
  const navigate = useNavigate();

  const [selectedIngredientId, setSelectedIngredientId] = useState<string>("");
  const [priceVariation, setPriceVariation] = useState<number>(0);

  // Ingredientes únicos usados em fichas
  const usedIngredients = useMemo(() => {
    const ingredientIds = new Set<string>();
    sheets.forEach(sheet => {
      sheet.ingredients.forEach(si => {
        ingredientIds.add(si.ingredient.id);
      });
    });
    return allIngredients.filter(ing => ingredientIds.has(ing.id));
  }, [sheets, allIngredients]);

  // Resultado da simulação
  const simulationResult = useMemo(() => {
    if (!selectedIngredientId || priceVariation === 0) return null;
    
    try {
      return simulatePriceChange(sheets, selectedIngredientId, priceVariation);
    } catch (error) {
      console.error("Erro na simulação:", error);
      return null;
    }
  }, [sheets, selectedIngredientId, priceVariation]);

  // Ingredientes substitutos
  const substitutes = useMemo(() => {
    if (!selectedIngredientId) return [];
    const selected = allIngredients.find(ing => ing.id === selectedIngredientId);
    if (!selected) return [];
    return findSubstituteIngredients(selected, allIngredients);
  }, [selectedIngredientId, allIngredients]);

  const selectedIngredient = allIngredients.find(ing => ing.id === selectedIngredientId);
  const newPrice = selectedIngredient 
    ? selectedIngredient.unitPrice * (1 + priceVariation / 100)
    : 0;

  // Dados para gráfico
  const chartData = useMemo(() => {
    if (!simulationResult) return [];
    return simulationResult.impacts.map(impact => ({
      name: impact.sheetName.length > 15 
        ? impact.sheetName.substring(0, 15) + '...' 
        : impact.sheetName,
      fullName: impact.sheetName,
      impacto: impact.costIncreasePercent,
      severidade: impact.severity,
    }));
  }, [simulationResult]);

  // Cores por severidade
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#eab308';
      default: return '#10b981';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header com Explicação do Valor */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/ficha-tecnica">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                Simulador de Cenários
              </h1>
              <p className="text-muted-foreground mt-2">
                Antecipe o impacto de mudanças de preços antes que aconteçam
              </p>
            </div>
          </div>

          {/* Card de Valor */}
          <Alert className="border-primary/20 bg-primary/5">
            <Info className="h-5 w-5 text-primary" />
            <AlertTitle className="text-base font-semibold">
              Por que usar o Simulador?
            </AlertTitle>
            <AlertDescription className="mt-2 space-y-1 text-sm">
              <p>
                <strong>Antecipe problemas:</strong> Descubra quais receitas serão mais afetadas se um ingrediente subir de preço.
              </p>
              <p>
                <strong>Planeje ajustes:</strong> Veja quanto você precisará aumentar os preços para manter suas margens.
              </p>
              <p>
                <strong>Compare alternativas:</strong> Avalie ingredientes substitutos antes de fazer mudanças.
              </p>
            </AlertDescription>
          </Alert>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Painel de Controle */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Configurar Simulação
                </CardTitle>
                <CardDescription>
                  Escolha um ingrediente e simule uma variação de preço
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Seleção de Ingrediente */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Ingrediente</Label>
                  <Select
                    value={selectedIngredientId}
                    onValueChange={(value) => {
                      setSelectedIngredientId(value);
                      setPriceVariation(0);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um ingrediente" />
                    </SelectTrigger>
                    <SelectContent>
                      {usedIngredients.map((ing) => (
                        <SelectItem key={ing.id} value={ing.id}>
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{ing.name}</span>
                            <span className="text-xs text-muted-foreground ml-4">
                              {formatCurrency(ing.unitPrice)}/{ing.priceUnit}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedIngredient && (
                    <p className="text-xs text-muted-foreground">
                      Usado em {sheets.filter(s => 
                        s.ingredients.some(si => si.ingredient.id === selectedIngredientId)
                      ).length} ficha(s) técnica(s)
                    </p>
                  )}
                </div>

                {/* Variação de Preço */}
                {selectedIngredientId && (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Variação de Preço</Label>
                        <div className="flex items-center gap-2">
                          {priceVariation > 0 ? (
                            <TrendingUp className="h-4 w-4 text-red-600" />
                          ) : priceVariation < 0 ? (
                            <TrendingDown className="h-4 w-4 text-emerald-600" />
                          ) : null}
                          <span className={cn(
                            "text-lg font-bold",
                            priceVariation > 0 && "text-red-600",
                            priceVariation < 0 && "text-emerald-600"
                          )}>
                            {priceVariation > 0 ? "+" : ""}{priceVariation.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <Slider
                        value={[priceVariation]}
                        onValueChange={([value]) => setPriceVariation(value)}
                        min={-50}
                        max={200}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>-50%</span>
                        <span>0%</span>
                        <span>+200%</span>
                      </div>
                    </div>

                    {/* Comparação de Preços */}
                    {selectedIngredient && (
                      <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-2">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Preço Atual</span>
                              <span className="text-lg font-bold">
                                {formatCurrency(selectedIngredient.unitPrice)}/{selectedIngredient.priceUnit}
                              </span>
                            </div>
                            <div className="h-px bg-border" />
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Novo Preço</span>
                              <span className={cn(
                                "text-xl font-bold",
                                priceVariation > 0 && "text-red-600",
                                priceVariation < 0 && "text-emerald-600"
                              )}>
                                {formatCurrency(newPrice)}/{selectedIngredient.priceUnit}
                              </span>
                            </div>
                            {priceVariation !== 0 && (
                              <div className={cn(
                                "text-center py-2 rounded-lg text-sm font-semibold",
                                priceVariation > 0 
                                  ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              )}>
                                {priceVariation > 0 ? "↑" : "↓"} {Math.abs(priceVariation).toFixed(1)}% de variação
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Ingredientes Substitutos */}
            {substitutes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    Alternativas Disponíveis
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Ingredientes similares que você pode considerar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {substitutes.map((sub) => {
                      const priceDiff = ((sub.unitPrice - (selectedIngredient?.unitPrice || 0)) / (selectedIngredient?.unitPrice || 1)) * 100;
                      return (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border"
                        >
                          <div className="flex-1">
                            <span className="text-sm font-medium">{sub.name}</span>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatCurrency(sub.unitPrice)}/{sub.priceUnit}
                            </p>
                          </div>
                          {priceDiff !== 0 && (
                            <Badge 
                              variant={priceDiff < 0 ? "default" : "secondary"}
                              className="ml-2"
                            >
                              {priceDiff > 0 ? "+" : ""}{priceDiff.toFixed(1)}%
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Resultados */}
          <div className="lg:col-span-2 space-y-6">
            {!simulationResult ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="h-20 w-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                      <Calculator className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Pronto para Simular</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Selecione um ingrediente e ajuste a variação de preço para ver o impacto em tempo real nas suas fichas técnicas
                    </p>
                  </motion.div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Resumo Visual do Impacto */}
                <Card className="border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">Impacto da Simulação</CardTitle>
                        <CardDescription className="mt-1">
                          {simulationResult.totalSheetsAffected} ficha(s) será(ão) afetada(s) por esta mudança
                        </CardDescription>
                      </div>
                      {simulationResult.impacts.some(i => i.severity === 'critical' || i.severity === 'high') && (
                        <Badge variant="destructive" className="text-sm px-3 py-1">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Atenção Necessária
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Custo Médio */}
                      <div className="p-4 rounded-lg bg-muted/50 border">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground font-medium">Custo por Porção</p>
                        </div>
                        <p className="text-2xl font-bold">
                          {formatCurrency(simulationResult.averageCostIncrease)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          aumento médio
                        </p>
                      </div>

                      {/* Margem */}
                      <div className="p-4 rounded-lg bg-muted/50 border">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground font-medium">Margem</p>
                        </div>
                        <p className={cn(
                          "text-2xl font-bold",
                          simulationResult.averageMarginDecrease < 0 && "text-red-600",
                          simulationResult.averageMarginDecrease > 0 && "text-emerald-600"
                        )}>
                          {formatPercent(simulationResult.averageMarginDecrease)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          variação média
                        </p>
                      </div>

                      {/* Impacto Total */}
                      <div className="p-4 rounded-lg bg-muted/50 border">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground font-medium">Impacto Total</p>
                        </div>
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrency(simulationResult.totalCostIncrease)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          em todas as fichas
                        </p>
                      </div>

                      {/* Severidade */}
                      <div className="p-4 rounded-lg bg-muted/50 border">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground font-medium">Risco</p>
                        </div>
                        <div className="space-y-1">
                          {simulationResult.impacts.filter(i => i.severity === 'critical').length > 0 && (
                            <Badge variant="destructive" className="w-full justify-center">Crítico</Badge>
                          )}
                          {simulationResult.impacts.filter(i => i.severity === 'high').length > 0 && (
                            <Badge variant="warning" className="w-full justify-center">Alto</Badge>
                          )}
                          {simulationResult.impacts.filter(i => i.severity === 'medium').length > 0 && (
                            <Badge variant="default" className="w-full justify-center">Médio</Badge>
                          )}
                          {simulationResult.impacts.filter(i => i.severity === 'low').length > 0 && (
                            <Badge variant="secondary" className="w-full justify-center">Baixo</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Gráfico de Impacto */}
                {chartData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Impacto por Ficha Técnica
                      </CardTitle>
                      <CardDescription>
                        Variação percentual do custo em cada receita afetada
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                          <XAxis 
                            dataKey="name" 
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            label={{ value: 'Variação (%)', angle: -90, position: 'insideLeft' }}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                                    <p className="font-semibold mb-1">{data.fullName}</p>
                                    <p className="text-sm">
                                      <span className="text-muted-foreground">Impacto: </span>
                                      <span className={cn(
                                        "font-bold",
                                        data.impacto > 0 ? "text-red-600" : "text-emerald-600"
                                      )}>
                                        {data.impacto > 0 ? "+" : ""}{data.impacto.toFixed(1)}%
                                      </span>
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Severidade: {data.severidade}
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="impacto" radius={[8, 8, 0, 0]}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getSeverityColor(entry.severidade)} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Recomendações Acionáveis */}
                {simulationResult.recommendations.length > 0 && (
                  <Card className={cn(
                    "border-2",
                    simulationResult.impacts.some(i => i.severity === 'critical' || i.severity === 'high')
                      ? "border-amber-200 bg-amber-50/50 dark:bg-amber-950/20"
                      : "border-blue-200 bg-blue-50/50 dark:bg-blue-950/20"
                  )}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Zap className="h-5 w-5 text-amber-600" />
                        Ações Recomendadas
                      </CardTitle>
                      <CardDescription>
                        Siga estes passos para proteger suas margens
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {simulationResult.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className={cn(
                              "h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                              simulationResult.impacts.some(i => i.severity === 'critical' || i.severity === 'high')
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                            )}>
                              {index + 1}
                            </div>
                            <span className="text-sm leading-relaxed">{rec}</span>
                          </li>
                        ))}
                        <li className="flex items-start gap-3 pt-2 border-t border-border">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold mb-1">Próximo Passo</p>
                            <p className="text-sm text-muted-foreground mb-3">
                              Revise as fichas afetadas abaixo e ajuste os preços conforme necessário
                            </p>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                const criticalSheets = simulationResult.impacts
                                  .filter(i => i.severity === 'critical' || i.severity === 'high')
                                  .map(i => i.sheetId);
                                if (criticalSheets.length > 0) {
                                  navigate(`/ficha-tecnica/${criticalSheets[0]}`);
                                }
                              }}
                            >
                              Ver Primeira Ficha Crítica
                              <ExternalLink className="h-3 w-3 ml-2" />
                            </Button>
                          </div>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Tabela Detalhada */}
                <Card>
                  <CardHeader>
                    <CardTitle>Fichas Técnicas Afetadas</CardTitle>
                    <CardDescription>
                      Detalhamento completo do impacto em cada receita
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border border-border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Receita</TableHead>
                            <TableHead className="text-right">Custo Atual</TableHead>
                            <TableHead className="text-right">Novo Custo</TableHead>
                            <TableHead className="text-right">Variação</TableHead>
                            <TableHead className="text-right">Margem Atual</TableHead>
                            <TableHead className="text-right">Nova Margem</TableHead>
                            <TableHead className="text-center">Ação</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {simulationResult.impacts
                            .sort((a, b) => {
                              const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                              return severityOrder[a.severity] - severityOrder[b.severity];
                            })
                            .map((impact) => (
                            <TableRow 
                              key={impact.sheetId}
                              className={cn(
                                impact.severity === 'critical' && "bg-red-50/50 dark:bg-red-950/10",
                                impact.severity === 'high' && "bg-amber-50/50 dark:bg-amber-950/10"
                              )}
                            >
                              <TableCell>
                                <div>
                                  <p className="font-semibold">{impact.sheetName}</p>
                                  <p className="text-xs text-muted-foreground">{impact.sheetCode}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(impact.currentCost)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <span className="font-bold">
                                    {formatCurrency(impact.newCost)}
                                  </span>
                                  {impact.costIncrease > 0 && (
                                    <TrendingUp className="h-4 w-4 text-red-600" />
                                  )}
                                  {impact.costIncrease < 0 && (
                                    <TrendingDown className="h-4 w-4 text-emerald-600" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className={cn(
                                "text-right font-semibold",
                                impact.costIncreasePercent > 0 ? "text-red-600" : "text-emerald-600"
                              )}>
                                {impact.costIncreasePercent > 0 ? "+" : ""}
                                {impact.costIncreasePercent.toFixed(1)}%
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {formatPercent(impact.currentMargin)}
                                  {impact.currentMargin < 20 && (
                                    <AlertTriangle className="h-3 w-3 text-amber-600" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className={cn(
                                "text-right font-semibold",
                                impact.marginChange < 0 ? "text-red-600" : "text-emerald-600"
                              )}>
                                <div className="flex flex-col items-end">
                                  <span>{formatPercent(impact.newMargin)}</span>
                                  {impact.marginChange !== 0 && (
                                    <span className={cn(
                                      "text-xs",
                                      impact.marginChange < 0 ? "text-red-600" : "text-emerald-600"
                                    )}>
                                      ({impact.marginChange > 0 ? "+" : ""}
                                      {impact.marginChange.toFixed(1)}%)
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex flex-col items-center gap-2">
                                  <Badge
                                    variant={
                                      impact.severity === 'critical' ? 'destructive' :
                                      impact.severity === 'high' ? 'warning' :
                                      impact.severity === 'medium' ? 'default' : 'secondary'
                                    }
                                    className="text-xs"
                                  >
                                    {impact.severity === 'critical' ? 'Crítico' :
                                     impact.severity === 'high' ? 'Alto' :
                                     impact.severity === 'medium' ? 'Médio' : 'Baixo'}
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-xs"
                                    onClick={() => navigate(`/ficha-tecnica/${impact.sheetId}`)}
                                  >
                                    Editar
                                    <ArrowRight className="h-3 w-3 ml-1" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
