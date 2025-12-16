import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";
import { FlaskConical, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BaseCostSummaryProps {
    productionUnitCost: number;
    totalCost: number;
    productionYieldFinal: number;
    productionYieldUnit: string;
    hasYieldUndefined?: boolean;
}

export function BaseCostSummary({
    productionUnitCost,
    totalCost,
    productionYieldFinal,
    productionYieldUnit,
    hasYieldUndefined
}: BaseCostSummaryProps) {
    return (
        <Card className="border-purple-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-purple-50 pb-4 border-b border-purple-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-700">
                        <FlaskConical className="h-5 w-5" />
                        <CardTitle className="text-lg">Custo da Base</CardTitle>
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <AlertCircle className="h-4 w-4 text-purple-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-xs">Base de produção é um custo intermediário. Não possui preço de venda ou margem própria.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Custo por {productionYieldUnit}
                    </p>
                    {hasYieldUndefined ? (
                        <p className="text-lg font-medium text-amber-600">Defina o rendimento final</p>
                    ) : (
                        <p className="text-4xl font-bold text-foreground tracking-tight">
                            {formatCurrency(productionUnitCost)}
                        </p>
                    )}
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Custo Total da base</span>
                        <span className="font-semibold text-foreground">{formatCurrency(totalCost)}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Rendimento Final Informado</span>
                        {hasYieldUndefined ? (
                            <span className="text-amber-600 font-medium">-</span>
                        ) : (
                            <span className="font-semibold text-foreground">
                                {productionYieldFinal} {productionYieldUnit}
                            </span>
                        )}
                    </div>
                </div>

                {hasYieldUndefined && (
                    <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-lg border border-amber-100 mt-2">
                        Informe o "Rendimento da Base" abaixo para que o sistema possa calcular o custo unitário.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
