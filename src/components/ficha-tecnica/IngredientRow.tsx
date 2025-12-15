import { memo } from "react";
import { GripVertical, Trash2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { unitOptions, Ingredient, ingredientCategories } from "@/lib/mock-data";
import { formatCurrency, calculateIngredientCost } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface RecipeIngredient {
  id: string;
  ingredient: Ingredient;
  quantity: number;
  unit: string;
  correctionFactor: number;
  calculatedCost: number;
}

interface IngredientRowProps {
  item: RecipeIngredient;
  onChange: (id: string, updates: Partial<RecipeIngredient>) => void;
  onRemove: (id: string) => void;
  onLastFieldEnter?: () => void;
}

export const IngredientRow = memo(function IngredientRow({
  item,
  onChange,
  onRemove,
  onLastFieldEnter
}: IngredientRowProps) {
  const category = ingredientCategories.find(c => c.id === item.ingredient.categoryId);
  const hasZeroPrice = item.ingredient.unitPrice === 0;

  const handleQuantityChange = (value: string) => {
    const quantity = parseFloat(value) || 0;
    const calculatedCost = calculateIngredientCost(
      quantity,
      item.unit,
      item.ingredient.unitPrice,
      item.ingredient.priceUnit,
      item.correctionFactor
    );
    onChange(item.id, { quantity, calculatedCost });
  };

  const handleUnitChange = (unit: string) => {
    const calculatedCost = calculateIngredientCost(
      item.quantity,
      unit,
      item.ingredient.unitPrice,
      item.ingredient.priceUnit,
      item.correctionFactor
    );
    onChange(item.id, { unit, calculatedCost });
  };

  const handleCorrectionChange = (value: string) => {
    const correctionFactor = parseFloat(value) || 1;
    const calculatedCost = calculateIngredientCost(
      item.quantity,
      item.unit,
      item.ingredient.unitPrice,
      item.ingredient.priceUnit,
      correctionFactor
    );
    onChange(item.id, { correctionFactor, calculatedCost });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onLastFieldEnter) {
      e.preventDefault();
      onLastFieldEnter();
    }
  };

  return (
    <div className={cn(
      "group flex items-center gap-3 p-3 rounded-xl bg-card border transition-colors",
      hasZeroPrice ? "border-amber-200 bg-amber-50/30" : "border-border hover:border-primary/30"
    )}>
      <button
        type="button"
        className="cursor-grab text-muted-foreground hover:text-foreground touch-none"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">{category?.icon}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground text-sm truncate">{item.ingredient.name}</p>
              {hasZeroPrice && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ingrediente sem preço cadastrado</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(item.ingredient.unitPrice)}/{item.ingredient.priceUnit}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={item.quantity || ""}
          onChange={(e) => handleQuantityChange(e.target.value)}
          placeholder="Qtd"
          className="w-20 h-9 text-sm"
        />

        <Select value={item.unit} onValueChange={handleUnitChange}>
          <SelectTrigger className="w-28 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {unitOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          value={item.correctionFactor}
          onChange={(e) => handleCorrectionChange(e.target.value)}
          onKeyDown={handleKeyDown}
          step="0.05"
          min="1"
          max="2"
          className="w-16 h-9 text-sm text-center"
          title="Fator de Correção"
        />

        <div className={cn(
          "w-24 text-right font-semibold text-sm",
          item.calculatedCost > 0 ? "text-primary" : "text-muted-foreground"
        )}>
          {formatCurrency(item.calculatedCost)}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onRemove(item.id)}
          className="text-muted-foreground hover:text-destructive opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});
