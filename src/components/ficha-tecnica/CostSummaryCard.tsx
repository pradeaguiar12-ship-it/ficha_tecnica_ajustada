import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { formatCurrency, formatPercent, getMarginQuality } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import {
  getBusinessSettings,
  calculateMonthlyFixedCosts,
  calculateOverheadPerUnit,
  getOverheadBreakdown,
} from "@/lib/overhead-costs";

interface CostBreakdown {
  ingredients: number;
  overhead: number;
  packaging: number;
  labor: number;
}

interface CostSummaryCardProps {
  suggestedPrice: number;
  costPerUnit: number;
  totalCost: number;
  margin: number;
  breakdown: CostBreakdown;
  yieldQuantity: number;
  useGlobalOverhead?: boolean;
  taxRate?: number;
}

function SummaryContent({
  suggestedPrice,
  costPerUnit,
  totalCost,
  margin,
  breakdown,
  yieldQuantity,
  useGlobalOverhead = false,
  taxRate,
}: CostSummaryCardProps) {
  const [showOverheadDetail, setShowOverheadDetail] = useState(false);

  const marginQuality = getMarginQuality(margin);
  const profit = suggestedPrice - costPerUnit;
  const totalProfit = profit * yieldQuantity;

  // Get global settings for overhead breakdown
  const settings = getBusinessSettings();
  const effectiveTaxRate = taxRate ?? settings.taxRate;
  const taxAmount = suggestedPrice * (effectiveTaxRate / 100);
  const profitAfterTax = profit - taxAmount;

  const overheadBreakdown = useGlobalOverhead ? getOverheadBreakdown(settings.monthlyOverheadCosts) : [];

  const breakdownItems = [
    { label: "Ingredientes", value: breakdown.ingredients, color: "bg-emerald-500" },
    { label: "Custos indiretos", value: breakdown.overhead, color: "bg-blue-500", expandable: useGlobalOverhead && overheadBreakdown.length > 0 },
    { label: "Embalagem", value: breakdown.packaging, color: "bg-amber-500" },
    { label: "Mão de obra", value: breakdown.labor, color: "bg-purple-500" },
  ];

  const validBreakdown = breakdownItems.filter(item => item.value > 0);
  const maxValue = Math.max(...validBreakdown.map(item => item.value), 1);

  return (
    <div className="space-y-4">
      {/* Main price card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl gradient-hero p-6 text-white shadow-lg"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/70 text-sm font-medium mb-1">Preço Sugerido</p>
            <p className="text-4xl font-bold tracking-tight">{formatCurrency(suggestedPrice)}</p>
            <p className="text-white/60 text-xs mt-1">por porção/unidade</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Margem de lucro</span>
            <Badge
              className={cn(
                "text-xs",
                marginQuality.color === 'success' && "bg-white/20 text-white",
                marginQuality.color === 'warning' && "bg-amber-400/30 text-amber-100",
                marginQuality.color === 'destructive' && "bg-red-400/30 text-red-100"
              )}
            >
              {formatPercent(margin)} - {marginQuality.label}
            </Badge>
          </div>
          <Progress
            value={Math.min(margin, 100)}
            variant={marginQuality.color === 'success' ? 'success' : marginQuality.color === 'warning' ? 'warning' : 'destructive'}
            className="h-2 bg-white/20"
          />
        </div>

        {margin < 20 && (
          <div className="mt-4 flex items-center gap-2 text-amber-200 text-xs bg-amber-500/20 rounded-lg p-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>Margem abaixo do recomendado. Considere ajustar o preço.</span>
          </div>
        )}
      </motion.div>

      {/* Breakdown card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-card border border-border p-5"
      >
        <h4 className="font-semibold text-foreground mb-4">Composição do Custo</h4>

        <div className="space-y-4 mb-4">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-muted-foreground">Custo Total da Receita</span>
            <span className="font-bold text-lg">{formatCurrency(totalCost)}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-muted-foreground">Custo por porção</span>
            <span className="font-semibold">{formatCurrency(costPerUnit)}</span>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-border">
          {validBreakdown.map((item) => (
            <div key={item.label}>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    {item.label}
                    {item.expandable && (
                      <button
                        onClick={() => setShowOverheadDetail(!showOverheadDetail)}
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        {showOverheadDetail ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </span>
                  <span className="font-medium">{formatCurrency(item.value)}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", item.color)}
                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                  />
                </div>
              </div>

              {/* Overhead detail breakdown */}
              {item.expandable && showOverheadDetail && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-4 mt-2 space-y-1 text-xs"
                >
                  {overheadBreakdown.map((cat) => {
                    const perPortion = cat.value / settings.estimatedMonthlyProduction;
                    return (
                      <div key={cat.label} className="flex justify-between text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-border" />
                          {cat.label}
                        </span>
                        <span>{formatCurrency(perPortion)}</span>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tax info */}
      {effectiveTaxRate > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl bg-amber-50 border border-amber-200 p-4"
        >
          <div className="flex justify-between text-sm">
            <span className="text-amber-700">Impostos ({effectiveTaxRate}%)</span>
            <span className="font-medium text-amber-700">- {formatCurrency(taxAmount)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-amber-600">Lucro líquido/porção</span>
            <span className="font-semibold text-amber-700">{formatCurrency(profitAfterTax)}</span>
          </div>
        </motion.div>
      )}

      {/* Profit card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5"
      >
        <div className="flex items-center gap-2 text-emerald-700 mb-3">
          <TrendingUp className="h-5 w-5" />
          <h4 className="font-semibold">Lucro Estimado</h4>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-emerald-600 mb-1">Por porção {effectiveTaxRate > 0 ? "(bruto)" : ""}</p>
            <p className="text-xl font-bold text-emerald-700">{formatCurrency(profit)}</p>
          </div>
          <div>
            <p className="text-xs text-emerald-600 mb-1">Total ({yieldQuantity} porções)</p>
            <p className="text-xl font-bold text-emerald-700">{formatCurrency(totalProfit)}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function CostSummaryCard(props: CostSummaryCardProps) {
  const marginQuality = getMarginQuality(props.margin);

  return (
    <>
      {/* Desktop Sticky View */}
      <div className="hidden lg:block">
        <SummaryContent {...props} />
      </div>

      {/* Mobile Bottom Drawer */}
      <div className="lg:hidden">
        <Drawer>
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t p-4 shadow-top">
            <DrawerTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer active:opacity-70">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(props.suggestedPrice)}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-5 px-1.5 text-[10px]",
                        marginQuality.color === 'success' && "text-emerald-600 border-emerald-200 bg-emerald-50",
                        marginQuality.color === 'warning' && "text-amber-600 border-amber-200 bg-amber-50",
                        marginQuality.color === 'destructive' && "text-red-600 border-red-200 bg-red-50"
                      )}
                    >
                      {formatPercent(props.margin)}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">Preço Sugerido</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(props.costPerUnit)}</p>
                    <p className="text-xs text-muted-foreground">Custo</p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-accent/50">
                    <ChevronUp className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </DrawerTrigger>
          </div>

          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader className="text-left">
              <DrawerTitle>Resumo Financeiro</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 overflow-y-auto">
              <SummaryContent {...props} />
            </div>
            <div className="p-4 pt-0">
              <Button className="w-full" asChild>
                <DrawerTrigger>Fechar Resumo</DrawerTrigger>
              </Button>
            </div>
          </DrawerContent>
        </Drawer>

        {/* Spacer to prevent content from being hidden behind the bar */}
        <div className="h-20" />
      </div>
    </>
  );
}
