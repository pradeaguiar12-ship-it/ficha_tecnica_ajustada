import { useState, useMemo } from "react";
import { Search, Plus, Check, UtensilsCrossed, FlaskConical } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockIngredients, ingredientCategories, Ingredient, TechnicalSheet } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import { useSheets } from "@/hooks/useSheets";

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
  const [activeTab, setActiveTab] = useState("ingredients");

  // Fetch production sheets for the "Bases" tab
  const { sheets } = useSheets();

  const productionSheets = useMemo(() => {
    return sheets.filter(sheet => sheet.sheetType === 'production' && sheet.status !== 'ARCHIVED');
  }, [sheets]);

  // Filter regular ingredients
  const filteredIngredients = useMemo(() => {
    return mockIngredients.filter((ing) => {
      const matchesSearch = ing.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !selectedCategory || ing.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  // Filter production sheets (bases)
  const filteredBases = useMemo(() => {
    return productionSheets.filter((base) => {
      return base.name.toLowerCase().includes(search.toLowerCase());
    });
  }, [search, productionSheets]);

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

  const handleSelectBase = (sheet: TechnicalSheet) => {
    // Convert production sheet to ingredient format
    const baseIngredient: Ingredient = {
      id: `BASE_${sheet.id}`, // Special ID prefix
      userId: sheet.userId,
      name: sheet.name, // Prefix to identify
      categoryId: 'BASE', // Custom category
      unitPrice: sheet.productionUnitCost || 0,
      priceUnit: sheet.productionYieldUnit || 'un',
      defaultCorrection: 1,
      isActive: true,
      lastPriceUpdate: sheet.updatedAt || new Date().toISOString()
    };

    onSelect(baseIngredient);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Adicionar Item</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="ingredients" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="ingredients" className="gap-2">
              <UtensilsCrossed className="h-4 w-4" />
              Ingredientes
            </TabsTrigger>
            <TabsTrigger value="bases" className="gap-2">
              <FlaskConical className="h-4 w-4" />
              Minhas Bases
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4 flex-1 flex flex-col min-h-0">
            {/* Search */}
            <div className="relative flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={activeTab === 'ingredients' ? "Buscar ingrediente..." : "Buscar base de produção..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background text-foreground placeholder:text-muted-foreground border-input"
              />
            </div>

            {/* Content for Ingredients */}
            <TabsContent value="ingredients" className="flex-1 min-h-0 mt-0">
              {/* Category filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    "transition-all",
                    selectedCategory === null
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-accent"
                  )}
                >
                  Todos
                </Button>
                {ingredientCategories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "transition-all",
                      selectedCategory === cat.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-transparent border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-accent"
                    )}
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
                                      Add
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
            </TabsContent>

            {/* Content for Bases */}
            <TabsContent value="bases" className="flex-1 min-h-0 mt-0">
              <ScrollArea className="h-[440px] pr-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredBases.map((base) => {
                    // Check if already selected (using the ID prefix convention)
                    const isSelected = selectedIds.includes(`BASE_${base.id}`);

                    return (
                      <motion.button
                        key={base.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => !isSelected && handleSelectBase(base)}
                        disabled={isSelected}
                        className={cn(
                          "flex items-start justify-between p-3 rounded-xl border text-left transition-all group",
                          isSelected
                            ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 opacity-60 cursor-not-allowed"
                            : "bg-card border-border hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 cursor-pointer"
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <FlaskConical className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                            <p className="font-semibold text-sm text-foreground truncate">
                              {base.name}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px] h-5 px-1 bg-purple-100/50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                              Base
                            </Badge>
                            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(base.productionUnitCost || 0)}/{base.productionYieldUnit || 'un'}
                            </p>
                          </div>
                        </div>

                        {isSelected ? (
                          <Badge variant="success" className="ml-2 flex-shrink-0 h-6">
                            <Check className="h-3 w-3" />
                          </Badge>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="h-4 w-4" />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}

                  {filteredBases.length === 0 && (
                    <div className="col-span-full text-center py-12 flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <FlaskConical className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="text-muted-foreground max-w-xs mx-auto">
                        <p className="font-medium mb-1">Nenhuma base encontrada</p>
                        <p className="text-xs">Crie uma ficha técnica do tipo "Produção (Base)" para que ela apareça aqui.</p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
