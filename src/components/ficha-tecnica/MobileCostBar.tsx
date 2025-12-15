import { formatCurrency } from "@/lib/calculations";
import { cn } from "@/lib/utils";

interface MobileCostBarProps {
    totalCost: number;
    costPerUnit: number;
    targetMargin: number;
    yieldQuantity: number;
    yieldUnit: string;
}

export const MobileCostBar = ({
    totalCost,
    costPerUnit,
    targetMargin,
    yieldQuantity,
    yieldUnit
}: MobileCostBarProps) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 pb-6 shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.1)] lg:hidden z-50">
            <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase font-medium">Custo Total</span>
                    <span className="text-sm font-bold">{formatCurrency(totalCost)}</span>
                </div>

                <div className="h-8 w-px bg-border my-auto" />

                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase font-medium">Por Unidade</span>
                    <span className="text-sm font-bold">{formatCurrency(costPerUnit)}</span>
                </div>

                <div className="ml-auto bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                    <span className="text-xs text-primary font-bold">{targetMargin}% Margem</span>
                </div>
            </div>
        </div>
    );
};
