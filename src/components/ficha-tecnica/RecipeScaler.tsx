/**
 * Componente de Escalabilidade de Receitas
 * 
 * Permite ajustar a quantidade de porções e recalcular
 * automaticamente todos os ingredientes e custos.
 * 
 * @module components/ficha-tecnica/RecipeScaler
 */

import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { RecipeIngredient } from "./IngredientRow";
import { formatCurrency } from "@/lib/calculations";

interface RecipeScalerProps {
  currentYield: number;
  currentYieldUnit: string;
  ingredients: RecipeIngredient[];
  onScale: (newYield: number, scaledIngredients: RecipeIngredient[]) => void;
}

export function RecipeScaler({
  currentYield,
  currentYieldUnit,
  ingredients,
  onScale,
}: RecipeScalerProps) {
  const [open, setOpen] = useState(false);
  const [newYield, setNewYield] = useState(currentYield);

  // Calcula o fator de escala
  const scaleFactor = newYield / currentYield;

  // Calcula ingredientes escalados
  const scaledIngredients: RecipeIngredient[] = ingredients.map((ing) => ({
    ...ing,
    quantity: ing.quantity * scaleFactor,
    calculatedCost: (ing.calculatedCost / currentYield) * newYield,
  }));

  // Calcula custos totais
  const totalCostScaled = scaledIngredients.reduce(
    (acc, ing) => acc + ing.calculatedCost,
    0
  );
  const totalCostOriginal = ingredients.reduce(
    (acc, ing) => acc + ing.calculatedCost,
    0
  );

  const handleApply = () => {
    onScale(newYield, scaledIngredients);
    setOpen(false);
  };

  const handleReset = () => {
    setNewYield(currentYield);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Calculator className="h-4 w-4" />
          Escalar Receita
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Escalar Receita</DialogTitle>
          <DialogDescription>
            Ajuste a quantidade de porções e os ingredientes serão recalculados
            automaticamente mantendo as proporções.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Input de nova quantidade */}
          <div className="space-y-2">
            <Label htmlFor="new-yield">
              Nova Quantidade de {currentYieldUnit}
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="new-yield"
                type="number"
                min="1"
                max="10000"
                value={newYield}
                onChange={(e) => setNewYield(parseInt(e.target.value) || 1)}
                className="text-lg font-semibold"
              />
              <span className="text-muted-foreground">{currentYieldUnit}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                title="Restaurar quantidade original"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Quantidade atual: {currentYield} {currentYieldUnit} • Fator de escala:{" "}
              {scaleFactor.toFixed(2)}x
            </p>
          </div>

          {/* Preview das mudanças */}
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Comparação</span>
              <span className="text-xs text-muted-foreground">
                {currentYield} → {newYield} {currentYieldUnit}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Custo Total Original</p>
                <p className="text-lg font-bold">{formatCurrency(totalCostOriginal)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Custo Total Escalado</p>
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(totalCostScaled)}
                </p>
              </div>
            </div>

            {/* Lista de ingredientes escalados */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Ingredientes (quantidades ajustadas)
              </p>
              {scaledIngredients.map((ing) => {
                const original = ingredients.find((i) => i.id === ing.id);
                const quantityDiff = ing.quantity - (original?.quantity || 0);
                return (
                  <div
                    key={ing.id}
                    className="flex items-center justify-between text-sm p-2 rounded bg-background"
                  >
                    <span className="font-medium">{ing.ingredient.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {original?.quantity.toFixed(2)} {original?.unit}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-semibold text-primary">
                        {ing.quantity.toFixed(2)} {ing.unit}
                      </span>
                      {quantityDiff !== 0 && (
                        <span
                          className={`text-xs ${
                            quantityDiff > 0 ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          ({quantityDiff > 0 ? "+" : ""}
                          {quantityDiff.toFixed(2)})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleApply}>
            Aplicar Escala
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

