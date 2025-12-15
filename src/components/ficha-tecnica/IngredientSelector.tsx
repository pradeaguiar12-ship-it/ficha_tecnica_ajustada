import { useState, useMemo } from "react";
import { Search, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockIngredients, ingredientCategories, Ingredient } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/calculations";
import { cn } from "@/lib/utils";

interface IngredientSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (ingredient: Ingredient) => void;
  selectedIds: string[];
}

export function IngredientSelector({
  open,
  onOpenChange,
  onSelect,
  selectedIds,
}: IngredientSelectorProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredIngredients = useMemo(() => {
    return mockIngredients.filter((ing) => {
      const matchesSearch = ing.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !selectedCategory || ing.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const groupedIngredients = useMemo(() => {
    const groups: Record<string, Ingredient[]> = {};
    filteredIngredients.forEach((ing) => {
      if (!groups[ing.categoryId]) {
        groups[ing.categoryId] = [];
      }
      groups[ing.categoryId].push(ing);
    });
    return groups;
  }, [filteredIngredients]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">Adicionar Ingrediente</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar ingrediente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Todos
            </Button>
            {ingredientCategories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.name}
              </Button>
            ))}
          </div>

          {/* Ingredients list */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              {Object.entries(groupedIngredients).map(([categoryId, ingredients]) => {
                const category = ingredientCategories.find((c) => c.id === categoryId);
                return (
                  <div key={categoryId}>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                      <span>{category?.icon}</span>
                      {category?.name}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <AnimatePresence>
                        {ingredients.map((ing) => {
                          const isSelected = selectedIds.includes(ing.id);
                          return (
                            <motion.button
                              key={ing.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              onClick={() => !isSelected && onSelect(ing)}
                              disabled={isSelected}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-xl border text-left transition-all",
                                isSelected
                                  ? "bg-primary/5 border-primary/30 opacity-60 cursor-not-allowed"
                                  : "bg-card border-border hover:border-primary/50 hover:shadow-soft cursor-pointer"
                              )}
                            >
                              <div className="min-w-0">
                                <p className="font-medium text-sm text-foreground truncate">
                                  {ing.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatCurrency(ing.unitPrice)}/{ing.priceUnit}
                                </p>
                              </div>
                              {isSelected ? (
                                <Badge variant="success" className="ml-2 flex-shrink-0">
                                  <Check className="h-3 w-3 mr-1" />
                                  Adicionado
                                </Badge>
                              ) : (
                                <Plus className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              )}
                            </motion.button>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}

              {filteredIngredients.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum ingrediente encontrado</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
