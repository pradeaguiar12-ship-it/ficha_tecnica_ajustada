/**
 * Seção de Rendimento e Perdas para Fichas de Produção
 * 
 * Exibe campos simplificados para configurar:
 * - Rendimento final (Quanto rende esta receita?)
 * - Unidade do rendimento (g/ml/un/porção)
 * - Exibição clara e educativa do Custo por Unidade
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Beaker, TrendingDown, Calculator, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { productionYieldUnitOptions, ProductionYieldUnit } from "@/lib/mock-data";
import { calculateProductionUnitCost, formatCurrency } from "@/lib/calculations";
import { cn } from "@/lib/utils";

interface ProductionYieldSectionProps {
    yieldFinal: number;
    yieldUnit: ProductionYieldUnit;
    lossPercent: number;
    totalIngredientCost: number;
    onYieldFinalChange: (value: number) => void;
    onYieldUnitChange: (value: ProductionYieldUnit) => void;
    onLossPercentChange: (value: number) => void;
}

export function ProductionYieldSection({
    yieldFinal,
    yieldUnit,
    lossPercent,
    totalIngredientCost,
    onYieldFinalChange,
    onYieldUnitChange,
    onLossPercentChange,
}: ProductionYieldSectionProps) {
    // Calculate unit cost
    const unitCost = useMemo(() => {
        return calculateProductionUnitCost(totalIngredientCost, yieldFinal);
    }, [totalIngredientCost, yieldFinal]);

    // Format unit label
    const unitLabel = useMemo(() => {
        const option = productionYieldUnitOptions.find(o => o.value === yieldUnit);
        return option?.label || yieldUnit;
    }, [yieldUnit]);

    // Get unit symbol for display
    const unitSymbol = useMemo(() => {
        const symbols: Record<string, string> = {
            'g': 'g',
            'ml': 'ml',
            'un': 'un',
            'portion': 'porção',
        };
        return symbols[yieldUnit] || yieldUnit;
    }, [yieldUnit]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="border-2 border-purple-200 dark:border-purple-900 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Beaker className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Rendimento da Base</CardTitle>
                            <CardDescription>
                                Defina quanto você produz com essa receita para calcular o custo unitário.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Simplified Yield Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Final Yield Answer */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold text-foreground">
                                Quanto rende esta receita?
                            </Label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <Input
                                        type="number"
                                        min={0}
                                        step={1}
                                        value={yieldFinal || ''}
                                        onChange={(e) => onYieldFinalChange(parseFloat(e.target.value) || 0)}
                                        placeholder="Ex: 2000"
                                        className="text-lg h-12 font-semibold"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-sm">
                                        Qtd
                                    </div>
                                </div>
                                <Select value={yieldUnit} onValueChange={onYieldUnitChange}>
                                    <SelectTrigger className="w-[140px] h-12">
                                        <SelectValue placeholder="Unidade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {productionYieldUnitOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Exemplo: Se você prepara um caldeirão de molho, coloque o volume total (ex: 5000 ml).
                                Se faz porções individuais, coloque a quantidade (ex: 12 un).
                            </p>
                        </div>

                        {/* Cost Display - Simplified and Prominent */}
                        <div className={cn(
                            "rounded-xl p-6 flex flex-col justify-center items-center border-2 transition-all duration-500",
                            yieldFinal > 0 && totalIngredientCost > 0
                                ? "bg-white dark:bg-slate-950 border-emerald-500/30 shadow-lg shadow-emerald-500/5 scale-[1.02]"
                                : "bg-white/50 dark:bg-slate-950/50 border-dashed border-slate-200 dark:border-slate-800"
                        )}>
                            <p className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                                Custo por {unitSymbol === 'porção' ? 'Porção' : 'Unidade'}
                            </p>

                            <div className="flex flex-col items-center">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className={cn(
                                        "text-4xl font-bold tracking-tight",
                                        yieldFinal > 0 && totalIngredientCost > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/30"
                                    )}>
                                        {yieldFinal > 0 && totalIngredientCost > 0
                                            ? formatCurrency(unitCost)
                                            : "R$ 0,00"}
                                    </span>
                                    {yieldFinal > 0 && totalIngredientCost > 0 && (
                                        <span className="text-lg font-medium text-muted-foreground">/ {unitSymbol}</span>
                                    )}
                                </div>

                                {yieldFinal > 0 && totalIngredientCost > 0 ? (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-full mt-2">
                                        <Calculator className="w-3 h-3" />
                                        <span>Custo Total ({formatCurrency(totalIngredientCost)}) ÷ Rendimento ({yieldFinal})</span>
                                    </div>
                                ) : (
                                    <span className="text-xs text-muted-foreground mt-2">
                                        Preencha o rendimento e adicione ingredientes
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
