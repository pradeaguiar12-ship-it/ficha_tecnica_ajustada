import { useState, useMemo, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Plus,
  FlaskConical,
  Info,
  UtensilsCrossed,
  DollarSign,
  BookOpen,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BaseCostSummary } from "@/components/ficha-tecnica/BaseCostSummary";
import { CostSummaryCard } from "@/components/ficha-tecnica/CostSummaryCard";
import { OverheadCostSection } from "@/components/ficha-tecnica/OverheadCostSection";
import { IngredientSelector } from "@/components/ficha-tecnica/IngredientSelector";
import { IngredientRow, RecipeIngredient } from "@/components/ficha-tecnica/IngredientRow";
import { ProductionYieldSection } from "@/components/ficha-tecnica/ProductionYieldSection";
import {
  recipeCategories,
  yieldUnitOptions,
  Ingredient,
  SheetType,
  ProductionYieldUnit,
  sheetTypeOptions,
} from "@/lib/mock-data";
import {
  calculateTotalCost,
  calculateCostPerUnit,
  calculateSuggestedPrice,
  calculateActualMargin,
  calculateProductionUnitCost,
} from "@/lib/calculations";
import { useSheets } from "@/hooks/useSheets";
import { useSettings } from "@/hooks/useSettings";
import { toast } from "sonner";

export default function FichaTecnicaNova() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialType = (searchParams.get('type') === 'production' ? 'production' : 'dish') as SheetType;

  const [ingredientSelectorOpen, setIngredientSelectorOpen] = useState(false);

  // Hooks de persistência
  const { createSheet } = useSheets();
  const { settings, monthlyTotal, overheadPerUnit: globalOverheadPerUnit } = useSettings();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    sheetType: initialType,
    yieldQuantity: 4,
    yieldUnit: "porções",
    productionYieldUnit: 'ml' as ProductionYieldUnit,
    productionYieldFinal: 0,
    productionLossPercent: 0,
    prepTimeMinutes: 0,
    cookTimeMinutes: 0,
    restTimeMinutes: 0,
    instructions: "",
    tips: "",
    useGlobalOverhead: true,
    overheadCost: 0,
    packagingCost: 0,
    laborCostPerHour: 25,
    targetMargin: 30,
    useManualPrice: false,
    manualPrice: 0,
  });

  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);

  // Calculations
  const calculations = useMemo(() => {
    const ingredientsCost = ingredients.reduce((acc, ing) => acc + ing.calculatedCost, 0);
    const effectiveOverhead = formData.useGlobalOverhead ? globalOverheadPerUnit : formData.overheadCost;
    const totalCost = calculateTotalCost(
      ingredientsCost,
      effectiveOverhead,
      formData.packagingCost,
      formData.laborCostPerHour,
      formData.prepTimeMinutes,
      formData.cookTimeMinutes
    );
    const costPerUnit = calculateCostPerUnit(totalCost, formData.yieldQuantity);
    const suggestedPrice = formData.useManualPrice
      ? formData.manualPrice
      : calculateSuggestedPrice(costPerUnit, formData.targetMargin);
    const actualMargin = calculateActualMargin(costPerUnit, suggestedPrice);

    const laborCost = (formData.laborCostPerHour * (formData.prepTimeMinutes + formData.cookTimeMinutes)) / 60;

    const productionUnitCost = formData.sheetType === 'production'
      ? calculateProductionUnitCost(totalCost, formData.productionYieldFinal)
      : 0;

    return {
      ingredientsCost,
      totalCost,
      costPerUnit,
      productionUnitCost,
      suggestedPrice,
      actualMargin,
      breakdown: {
        ingredients: ingredientsCost,
        overhead: effectiveOverhead,
        packaging: formData.packagingCost,
        labor: laborCost,
      },
    };
  }, [ingredients, formData, globalOverheadPerUnit]);

  // Handlers
  const handleAddIngredient = useCallback((ingredient: Ingredient) => {
    const newItem: RecipeIngredient = {
      id: `temp-${Date.now()}`,
      ingredient,
      quantity: 0,
      unit: "g",
      correctionFactor: ingredient.defaultCorrection,
      calculatedCost: 0,
    };
    setIngredients((prev) => [...prev, newItem]);
    setIngredientSelectorOpen(false);
  }, []);

  const handleUpdateIngredient = useCallback(
    (id: string, updates: Partial<RecipeIngredient>) => {
      setIngredients((prev) =>
        prev.map((ing) => (ing.id === id ? { ...ing, ...updates } : ing))
      );
    },
    []
  );

  const handleRemoveIngredient = useCallback((id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
  }, []);

  const handleSave = (asDraft: boolean) => {
    if (!formData.name.trim()) {
      toast.error("Nome da receita é obrigatório");
      return;
    }
    if (formData.yieldQuantity <= 0) {
      toast.error("Rendimento deve ser maior que zero");
      return;
    }
    if (ingredients.length === 0) {
      toast.error("Adicione pelo menos um ingrediente");
      return;
    }

    // Preparar ingredientes para salvar
    const sheetIngredients = ingredients.map((ing) => ({
      ingredientId: ing.ingredient.id,
      quantity: ing.quantity,
      unit: ing.unit,
      correctionFactor: ing.correctionFactor,
      calculatedCost: ing.calculatedCost,
    }));

    // Determinar o overhead efetivo
    const effectiveOverhead = formData.useGlobalOverhead ? globalOverheadPerUnit : formData.overheadCost;

    // Criar a ficha usando o hook
    const newSheet = createSheet({
      name: formData.name,
      description: formData.description || undefined,
      categoryId: formData.categoryId,
      yieldQuantity: formData.yieldQuantity,
      yieldUnit: formData.yieldUnit,
      prepTimeMinutes: formData.prepTimeMinutes,
      cookTimeMinutes: formData.cookTimeMinutes,
      restTimeMinutes: formData.restTimeMinutes,
      instructions: formData.instructions || undefined,
      tips: formData.tips || undefined,
      overheadCost: effectiveOverhead,
      packagingCost: formData.packagingCost,
      laborCostPerHour: formData.laborCostPerHour,
      targetMargin: formData.targetMargin,
      manualPrice: formData.useManualPrice ? formData.manualPrice : undefined,
      totalIngredientCost: calculations.ingredientsCost,
      totalCost: calculations.totalCost,
      costPerUnit: calculations.costPerUnit,
      suggestedPrice: calculations.suggestedPrice,
      actualMargin: calculations.actualMargin,
      ingredients: sheetIngredients as any,
      sheetType: formData.sheetType,
      productionYieldUnit: formData.sheetType === 'production' ? formData.productionYieldUnit : undefined,
      productionYieldFinal: formData.sheetType === 'production' ? formData.productionYieldFinal : undefined,
      productionLossPercent: formData.sheetType === 'production' ? formData.productionLossPercent : undefined,
      productionUnitCost: formData.sheetType === 'production' ? calculations.productionUnitCost : undefined,
      status: asDraft ? 'DRAFT' : 'ACTIVE',
    });

    toast.success(`Ficha ${newSheet.code} ${asDraft ? "salva como rascunho" : "criada"} com sucesso!`);
    navigate("/ficha-tecnica");
  };

  const selectedIngredientIds = ingredients.map((ing) => ing.ingredient.id);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/ficha-tecnica">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {formData.sheetType === 'production' ? "Nova Base de Produção" : "Nova Ficha Técnica"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {formData.sheetType === 'production'
                    ? "Crie uma base para usar em outras receitas"
                    : "Preencha os dados para calcular custos e preços"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-auto sm:ml-0">
              <Button variant="outline" onClick={() => handleSave(true)}>
                <Save className="h-4 w-4" />
                Salvar Rascunho
              </Button>
              <Button variant="gradient" onClick={() => handleSave(false)}>
                <Plus className="h-4 w-4" />
                Criar Ficha
              </Button>
            </div>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="info" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 h-12">
                  <TabsTrigger value="info" className="gap-2">
                    <Info className="h-4 w-4" />
                    <span className="hidden sm:inline">Informações</span>
                  </TabsTrigger>
                  <TabsTrigger value="ingredients" className="gap-2">
                    <UtensilsCrossed className="h-4 w-4" />
                    <span className="hidden sm:inline">Ingredientes</span>
                  </TabsTrigger>
                  <TabsTrigger value="costs" className="gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="hidden sm:inline">Custos</span>
                  </TabsTrigger>
                  <TabsTrigger value="instructions" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden sm:inline">Preparo</span>
                  </TabsTrigger>
                </TabsList>

                {/* Info Tab */}
                <TabsContent value="info">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-2xl border border-border p-6 space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          {formData.sheetType === 'production' ? "Nome da Base *" : "Nome da Receita *"}
                        </Label>
                        <Input
                          id="name"
                          placeholder="Ex: Risoto de Camarão"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, name: e.target.value }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          placeholder="Breve descrição da receita..."
                          value={formData.description}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, description: e.target.value }))
                          }
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Categoria</Label>
                        <Select
                          value={formData.categoryId}
                          onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, categoryId: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {recipeCategories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                <span className="flex items-center gap-2">
                                  <span>{cat.icon}</span>
                                  {cat.name}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Sheet Type Selector (Hidden if initialized with type, or shown?) - Let's keep it visible for flexibility */}
                      <div className="space-y-3">
                        <Label>Tipo de Ficha</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {sheetTypeOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setFormData((prev) => ({
                                ...prev,
                                sheetType: option.value as SheetType
                              }))}
                              className={`
                              relative p-4 rounded-xl border-2 transition-all duration-200
                              ${formData.sheetType === option.value
                                  ? 'border-primary bg-primary/5 shadow-sm'
                                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                }
                            `}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{option.icon}</span>
                                <div className="text-left">
                                  <p className="font-semibold">{option.label}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {option.description}
                                  </p>
                                </div>
                              </div>
                              {formData.sheetType === option.value && (
                                <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {formData.sheetType === 'production' && (
                        <ProductionYieldSection
                          yieldUnit={formData.productionYieldUnit}
                          yieldFinal={formData.productionYieldFinal}
                          lossPercent={formData.productionLossPercent}
                          onYieldUnitChange={(val) => setFormData(prev => ({ ...prev, productionYieldUnit: val }))}
                          onYieldFinalChange={(val) => setFormData(prev => ({ ...prev, productionYieldFinal: val }))}
                          onLossPercentChange={(val) => setFormData(prev => ({ ...prev, productionLossPercent: val }))}
                          totalIngredientCost={calculations.ingredientsCost}
                        />
                      )}

                      {formData.sheetType === 'dish' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Rendimento *</Label>
                            <Input
                              type="number"
                              min="1"
                              value={formData.yieldQuantity}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  yieldQuantity: parseInt(e.target.value) || 1,
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Unidade</Label>
                            <Select
                              value={formData.yieldUnit}
                              onValueChange={(value) =>
                                setFormData((prev) => ({ ...prev, yieldUnit: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {yieldUnitOptions.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Preparo (min)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={formData.prepTimeMinutes}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                prepTimeMinutes: parseInt(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Cozimento (min)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={formData.cookTimeMinutes}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                cookTimeMinutes: parseInt(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Descanso (min)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={formData.restTimeMinutes}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                restTimeMinutes: parseInt(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>

                {/* Ingredients Tab */}
                <TabsContent value="ingredients">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-2xl border border-border p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">Ingredientes</h3>
                        <p className="text-sm text-muted-foreground">
                          {ingredients.length} ingrediente{ingredients.length !== 1 ? "s" : ""} adicionado{ingredients.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <Button onClick={() => setIngredientSelectorOpen(true)}>
                        <Plus className="h-4 w-4" />
                        Adicionar
                      </Button>
                    </div>

                    {ingredients.length > 0 ? (
                      <div className="space-y-2">
                        {ingredients.map((item) => (
                          <IngredientRow
                            key={item.id}
                            item={item}
                            onChange={handleUpdateIngredient}
                            onRemove={handleRemoveIngredient}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-muted-foreground">
                        <UtensilsCrossed className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>Nenhum ingrediente adicionado</p>
                        <p className="text-sm">Clique no botão acima para começar</p>
                      </div>
                    )}
                  </motion.div>
                </TabsContent>

                {/* Costs Tab */}
                <TabsContent value="costs">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-2xl border border-border p-6 space-y-6"
                  >
                    <OverheadCostSection
                      useGlobalOverhead={formData.useGlobalOverhead}
                      manualOverhead={formData.overheadCost}
                      packagingCost={formData.packagingCost}
                      laborCostPerHour={formData.laborCostPerHour}
                      onUseGlobalChange={(value) =>
                        setFormData((prev) => ({ ...prev, useGlobalOverhead: value }))
                      }
                      onManualOverheadChange={(value) =>
                        setFormData((prev) => ({ ...prev, overheadCost: value }))
                      }
                      onPackagingChange={(value) =>
                        setFormData((prev) => ({ ...prev, packagingCost: value }))
                      }
                      onLaborChange={(value) =>
                        setFormData((prev) => ({ ...prev, laborCostPerHour: value }))
                      }
                    />

                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-foreground mb-4">Precificação</h3>
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label>Margem Desejada</Label>
                            <span className="text-lg font-bold text-primary">
                              {formData.targetMargin}%
                            </span>
                          </div>
                          <Slider
                            value={[formData.targetMargin]}
                            onValueChange={([value]) =>
                              setFormData((prev) => ({ ...prev, targetMargin: value }))
                            }
                            min={10}
                            max={80}
                            step={5}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>10%</span>
                            <span>80%</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                          <div>
                            <Label>Definir preço manual</Label>
                            <p className="text-sm text-muted-foreground">
                              Ignora a margem e usa um preço fixo
                            </p>
                          </div>
                          <Switch
                            checked={formData.useManualPrice}
                            onCheckedChange={(checked) =>
                              setFormData((prev) => ({ ...prev, useManualPrice: checked }))
                            }
                          />
                        </div>

                        {formData.useManualPrice && (
                          <div className="space-y-2">
                            <Label>Preço Manual (R$)</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.50"
                              value={formData.manualPrice}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  manualPrice: parseFloat(e.target.value) || 0,
                                }))
                              }
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>

                {/* Instructions Tab */}
                <TabsContent value="instructions">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-2xl border border-border p-6 space-y-6"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="instructions">Modo de Preparo</Label>
                      <Textarea
                        id="instructions"
                        placeholder="Descreva o passo a passo do preparo..."
                        value={formData.instructions}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, instructions: e.target.value }))
                        }
                        rows={10}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tips">Dicas do Chef</Label>
                      <Textarea
                        id="tips"
                        placeholder="Dicas especiais para melhor resultado..."
                        value={formData.tips}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, tips: e.target.value }))
                        }
                        rows={4}
                      />
                    </div>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Cost Summary - Sticky on desktop */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              {formData.sheetType === 'production' ? (
                <BaseCostSummary
                  productionUnitCost={calculations.productionUnitCost}
                  totalCost={calculations.totalCost}
                  productionYieldFinal={formData.productionYieldFinal}
                  productionYieldUnit={formData.productionYieldUnit}
                  hasYieldUndefined={!formData.productionYieldFinal || formData.productionYieldFinal <= 0}
                />
              ) : (
                <CostSummaryCard
                  suggestedPrice={calculations.suggestedPrice}
                  costPerUnit={calculations.costPerUnit}
                  totalCost={calculations.totalCost}
                  margin={calculations.actualMargin}
                  breakdown={calculations.breakdown}
                  yieldQuantity={formData.yieldQuantity}
                  useGlobalOverhead={formData.useGlobalOverhead}
                  taxRate={settings.taxRate}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <IngredientSelector
        open={ingredientSelectorOpen}
        onOpenChange={setIngredientSelectorOpen}
        onSelect={handleAddIngredient}
        selectedIds={selectedIngredientIds}
      />
    </MainLayout>
  );
}
