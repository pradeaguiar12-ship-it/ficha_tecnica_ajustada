import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Plus,
  Info,
  UtensilsCrossed,
  DollarSign,
  BookOpen,
  Trash2,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CostSummaryCard } from "@/components/ficha-tecnica/CostSummaryCard";
import { OverheadCostSection } from "@/components/ficha-tecnica/OverheadCostSection";
import { IngredientSelector } from "@/components/ficha-tecnica/IngredientSelector";
import { IngredientRow, RecipeIngredient } from "@/components/ficha-tecnica/IngredientRow";
import {
  recipeCategories,
  yieldUnitOptions,
  Ingredient,
} from "@/lib/mock-data";
import {
  calculateTotalCost,
  calculateCostPerUnit,
  calculateSuggestedPrice,
  calculateActualMargin,
} from "@/lib/calculations";
import { useSheets } from "@/hooks/useSheets";
import { useSettings } from "@/hooks/useSettings";
import { toast } from "sonner";

const FichaTecnicaEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ingredientSelectorOpen, setIngredientSelectorOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Hooks de persistência
  const { getSheetById, updateSheet, deleteSheet, isLoading } = useSheets();
  const { settings, overheadPerUnit: globalOverheadPerUnit } = useSettings();

  // Buscar ficha pelo ID
  const sheet = getSheetById(id || '');

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    yieldQuantity: 4,
    yieldUnit: "porções",
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

  // Load sheet data into form
  useEffect(() => {
    if (sheet && !isInitialized) {
      setFormData({
        name: sheet.name,
        description: sheet.description || "",
        categoryId: sheet.categoryId,
        yieldQuantity: sheet.yieldQuantity,
        yieldUnit: sheet.yieldUnit,
        prepTimeMinutes: sheet.prepTimeMinutes,
        cookTimeMinutes: sheet.cookTimeMinutes,
        restTimeMinutes: sheet.restTimeMinutes,
        instructions: sheet.instructions || "",
        tips: sheet.tips || "",
        useGlobalOverhead: sheet.overheadCost === 0 || sheet.overheadCost === globalOverheadPerUnit,
        overheadCost: sheet.overheadCost,
        packagingCost: sheet.packagingCost,
        laborCostPerHour: sheet.laborCostPerHour,
        targetMargin: sheet.targetMargin,
        useManualPrice: !!sheet.manualPrice,
        manualPrice: sheet.manualPrice || 0,
      });

      // Convert SheetIngredient[] to RecipeIngredient[]
      const recipeIngredients: RecipeIngredient[] = sheet.ingredients.map((si) => ({
        id: si.id,
        ingredient: si.ingredient,
        quantity: si.quantity,
        unit: si.unit,
        correctionFactor: si.correctionFactor,
        calculatedCost: si.calculatedCost,
      }));
      setIngredients(recipeIngredients);
      setIsInitialized(true);
    }
  }, [sheet, isInitialized, globalOverheadPerUnit]);

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

    const laborCost =
      (formData.laborCostPerHour * (formData.prepTimeMinutes + formData.cookTimeMinutes)) / 60;

    return {
      ingredientsCost,
      totalCost,
      costPerUnit,
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

  const handleSave = () => {
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
    const sheetIngredients = ingredients.map((ing, index) => ({
      id: ing.id,
      sheetId: id!,
      ingredientId: ing.ingredient.id,
      ingredient: ing.ingredient,
      quantity: ing.quantity,
      unit: ing.unit,
      correctionFactor: ing.correctionFactor,
      calculatedCost: ing.calculatedCost,
      orderIndex: index,
    }));

    // Atualizar usando o hook
    const success = updateSheet(id!, {
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
      overheadCost: formData.useGlobalOverhead ? globalOverheadPerUnit : formData.overheadCost,
      packagingCost: formData.packagingCost,
      laborCostPerHour: formData.laborCostPerHour,
      targetMargin: formData.targetMargin,
      manualPrice: formData.useManualPrice ? formData.manualPrice : undefined,
      totalIngredientCost: calculations.ingredientsCost,
      totalCost: calculations.totalCost,
      costPerUnit: calculations.costPerUnit,
      suggestedPrice: calculations.suggestedPrice,
      actualMargin: calculations.actualMargin,
      ingredients: sheetIngredients,
    });

    if (success) {
      toast.success("Ficha técnica atualizada com sucesso!");
      navigate("/ficha-tecnica");
    } else {
      toast.error("Erro ao salvar ficha. Tente novamente.");
    }
  };

  const handleDelete = () => {
    const success = deleteSheet(id!);
    if (success) {
      toast.success("Ficha técnica excluída com sucesso!");
      navigate("/ficha-tecnica");
    } else {
      toast.error("Erro ao excluir ficha. Tente novamente.");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </MainLayout>
    );
  }

  // Not found
  if (!sheet) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <h1 className="text-2xl font-bold text-foreground">Ficha não encontrada</h1>
          <p className="text-muted-foreground">A ficha técnica solicitada não existe.</p>
          <Button onClick={() => navigate("/ficha-tecnica")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para lista
          </Button>
        </div>
      </MainLayout>
    );
  }

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
              <h1 className="text-2xl font-bold text-foreground">Editar Ficha Técnica</h1>
              <p className="text-sm text-muted-foreground">Código: {sheet.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-auto sm:ml-0">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir ficha técnica?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. A ficha "{sheet.name}" será permanentemente
                    excluída.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" onClick={() => navigate("/ficha-tecnica")}>
              Cancelar
            </Button>
            <Button variant="gradient" onClick={handleSave}>
              <Save className="h-4 w-4" />
              Salvar Alterações
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
                      <Label htmlFor="name">Nome da Receita *</Label>
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
                        {ingredients.length} ingrediente{ingredients.length !== 1 ? "s" : ""}{" "}
                        adicionado{ingredients.length !== 1 ? "s" : ""}
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
};

export default FichaTecnicaEdit;
