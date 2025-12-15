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
import { useDebounce } from "@/hooks/useDebounce";
import { useSheetPersistence } from "@/hooks/useSheetPersistence";
import { useHistory } from "@/hooks/useHistory";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { calculateHash } from "@/lib/storage-utils";
import { PreparationSteps } from "@/components/ficha-tecnica/PreparationSteps";
import { PreparationStep, NutritionData, recipeCategories } from "@/lib/mock-data";
import { NutritionPanel, defaultNutritionData } from "@/components/ficha-tecnica/NutritionPanel";
import { ShareDialog } from "@/components/ficha-tecnica/ShareDialog";
import { MobileCostBar } from "@/components/ficha-tecnica/MobileCostBar";
import { SmartIngredientInput } from "@/components/ficha-tecnica/SmartIngredientInput";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Apple } from "lucide-react";

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
  const [steps, setSteps] = useState<PreparationStep[]>([]);
  const [nutrition, setNutrition] = useState<NutritionData>(defaultNutritionData);

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
      setSteps(sheet.steps || []);
      if (sheet.nutrition) setNutrition(sheet.nutrition);
      setIsInitialized(true);
    }
  }, [sheet, isInitialized, globalOverheadPerUnit]);

  const debouncedFormData = useDebounce(formData, 300);
  const debouncedIngredients = useDebounce(ingredients, 300);
  const debouncedSteps = useDebounce(steps, 300);
  const debouncedNutrition = useDebounce(nutrition, 300);

  const calculations = useMemo(() => {
    const ingredientsCost = debouncedIngredients.reduce((acc, ing) => acc + ing.calculatedCost, 0);
    const effectiveOverhead = debouncedFormData.useGlobalOverhead ? globalOverheadPerUnit : debouncedFormData.overheadCost;
    const totalCost = calculateTotalCost(
      ingredientsCost,
      effectiveOverhead,
      debouncedFormData.packagingCost,
      debouncedFormData.laborCostPerHour,
      debouncedFormData.prepTimeMinutes,
      debouncedFormData.cookTimeMinutes
    );
    const costPerUnit = calculateCostPerUnit(totalCost, debouncedFormData.yieldQuantity);
    const suggestedPrice = debouncedFormData.useManualPrice
      ? debouncedFormData.manualPrice
      : calculateSuggestedPrice(costPerUnit, debouncedFormData.targetMargin);
    const actualMargin = calculateActualMargin(costPerUnit, suggestedPrice);

    const laborCost =
      (debouncedFormData.laborCostPerHour * (debouncedFormData.prepTimeMinutes + debouncedFormData.cookTimeMinutes)) / 60;

    return {
      ingredientsCost,
      totalCost,
      costPerUnit,
      suggestedPrice,
      actualMargin,
      breakdown: {
        ingredients: ingredientsCost,
        overhead: effectiveOverhead,
        packaging: debouncedFormData.packagingCost,
        labor: laborCost,
      },
    };
  }, [debouncedIngredients, debouncedFormData, globalOverheadPerUnit]);

  // Prepare data for persistence
  const persistableData = useMemo(() => {
    if (!sheet) return null;
    return {
      ...sheet,
      ...debouncedFormData,
      ingredients: debouncedIngredients.map(ing => ({
        id: ing.id,
        ingredient: ing.ingredient,
        quantity: ing.quantity,
        unit: ing.unit,
        correctionFactor: ing.correctionFactor,
        calculatedCost: ing.calculatedCost
      })),
      steps: debouncedSteps,
      nutrition: debouncedNutrition,
      updatedAt: new Date().toISOString()
    };
  }, [sheet, debouncedFormData, debouncedIngredients, debouncedSteps, debouncedNutrition]);

  // Persistence Hook
  const { status: saveStatus, hasNewerDraft, recoverDraft, clearDraft } = useSheetPersistence(id || '', persistableData);

  // Undo/Redo History
  const {
    state: historyState,
    push: historyPush,
    undo,
    redo,
    canUndo,
    canRedo
  } = useHistory(persistableData, 50);

  // Sync TO History
  useEffect(() => {
    if (persistableData && (!historyState || calculateHash(persistableData) !== calculateHash(historyState))) {
      historyPush(persistableData, 1000); // Debounce history updates
    }
  }, [persistableData, historyPush, historyState]);

  const handleRestoreState = useCallback((state: any) => {
    if (!state) return;

    setFormData({
      name: state.name,
      description: state.description || "",
      categoryId: state.categoryId,
      yieldQuantity: state.yieldQuantity,
      yieldUnit: state.yieldUnit,
      prepTimeMinutes: state.prepTimeMinutes,
      cookTimeMinutes: state.cookTimeMinutes,
      restTimeMinutes: state.restTimeMinutes,
      instructions: state.instructions || "",
      tips: state.tips || "",
      useGlobalOverhead: state.useGlobalOverhead,
      overheadCost: state.overheadCost,
      packagingCost: state.packagingCost,
      laborCostPerHour: state.laborCostPerHour,
      targetMargin: state.targetMargin,
      useManualPrice: !!state.manualPrice,
      manualPrice: state.manualPrice || 0,
    });

    const recipeIngredients = state.ingredients.map((si: any) => ({
      id: si.id,
      ingredient: si.ingredient,
      quantity: si.quantity,
      unit: si.unit,
      correctionFactor: si.correctionFactor,
      calculatedCost: si.calculatedCost,
    }));
    setIngredients(recipeIngredients);
    setSteps(state.steps || []);
    if (state.nutrition) setNutrition(state.nutrition);
  }, []);

  const handleUndo = useCallback(() => {
    if (canUndo) {
      const previous = undo();
      handleRestoreState(previous);
      toast.info("Desfeito");
    }
  }, [canUndo, undo, handleRestoreState]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      const next = redo();
      handleRestoreState(next);
      toast.info("Refeito");
    }
  }, [canRedo, redo, handleRestoreState]);

  useKeyboardShortcuts({
    shortcuts: [
      { key: 'z', ctrlKey: true, action: handleUndo, description: "Desfazer" },
      { key: 'z', ctrlKey: true, shiftKey: true, action: handleRedo, description: "Refazer" },
      // Standalone for some browsers
      { key: 'y', ctrlKey: true, action: handleRedo, description: "Refazer" }
    ]
  });

  // Load sheet data into form
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
      instructions: steps.length > 0
        ? steps.map(s => `${s.isCritical ? '[ATENÇÃO] ' : ''}${s.text}${s.timeInMinutes ? ` (${s.timeInMinutes} min)` : ''}`).join('\n')
        : formData.instructions || undefined,
      tips: formData.tips || undefined,
      useGlobalOverhead: formData.useGlobalOverhead,
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
      steps: steps,
      nutrition: nutrition,
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

  const handleRecoverDraft = () => {
    const draft = recoverDraft() as any;
    if (draft) {
      setFormData({
        name: draft.name,
        description: draft.description || "",
        categoryId: draft.categoryId,
        yieldQuantity: draft.yieldQuantity,
        yieldUnit: draft.yieldUnit,
        prepTimeMinutes: draft.prepTimeMinutes,
        cookTimeMinutes: draft.cookTimeMinutes,
        restTimeMinutes: draft.restTimeMinutes,
        instructions: draft.instructions || "",
        tips: draft.tips || "",
        useGlobalOverhead: draft.useGlobalOverhead,
        overheadCost: draft.overheadCost,
        packagingCost: draft.packagingCost,
        laborCostPerHour: draft.laborCostPerHour,
        targetMargin: draft.targetMargin,
        useManualPrice: !!draft.manualPrice,
        manualPrice: draft.manualPrice || 0,
      });

      const recipeIngredients = draft.ingredients.map((si: any) => ({
        id: si.id,
        ingredient: si.ingredient,
        quantity: si.quantity,
        unit: si.unit,
        correctionFactor: si.correctionFactor,
        calculatedCost: si.calculatedCost,
      }));
      setIngredients(recipeIngredients);
      toast.success("Rascunho recuperado com sucesso!");
    }
  };

  const handleDiscardDraft = () => {
    clearDraft();
    toast.info("Rascunho descartado.");
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
        {/* Recovery Dialog */}
        <AlertDialog open={hasNewerDraft}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Rascunho não salvo encontrado</AlertDialogTitle>
              <AlertDialogDescription>
                Encontramos uma versão mais recente desta ficha técnica salva no seu navegador (autosave).
                Deseja recuperar as alterações não salvas?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleDiscardDraft}>Descartar Rascunho</AlertDialogCancel>
              <AlertDialogAction onClick={handleRecoverDraft}>Recuperar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Código: {sheet.code}</p>
                <StatusBadge status={saveStatus} />
              </div>
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
                <TabsTrigger value="nutrition" className="gap-2">
                  <Apple className="h-4 w-4" />
                  <span className="hidden sm:inline">Nutrição</span>
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
                    <Button variant="ghost" size="sm" onClick={() => setIngredientSelectorOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Buscar Detalhado
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <SmartIngredientInput
                      onAdd={handleAddIngredient}
                      existingIngredients={ingredients.map(i => ({
                        ingredientId: i.ingredient.id,
                        ingredientName: i.ingredient.name
                      }))}
                    />

                    {ingredients.length > 0 ? (
                      <div className="space-y-2">
                        {ingredients.map((item) => (
                          <IngredientRow
                            key={item.id}
                            item={item}
                            onChange={handleUpdateIngredient}
                            onRemove={handleRemoveIngredient}
                            onLastFieldEnter={() => { /* Focus smart input? */ }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground border-2 border-dashed rounded-xl border-muted">
                        <UtensilsCrossed className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">Comece adicionando ingredientes acima</p>
                      </div>
                    )}
                  </div>
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

              <TabsContent value="instructions">
                {/* ... existing ... */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl border border-border p-6 space-y-6"
                >
                  <PreparationSteps
                    steps={steps}
                    onChange={setSteps}
                    legacyText={formData.instructions}
                  />

                  <div className="space-y-2 pt-4 border-t">
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

              <TabsContent value="nutrition">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl border border-border p-6"
                >
                  <NutritionPanel data={nutrition} onChange={setNutrition} />
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
      <MobileCostBar
        totalCost={calculations.totalCost}
        costPerUnit={calculations.costPerUnit}
        targetMargin={calculations.actualMargin}
        yieldQuantity={formData.yieldQuantity}
        yieldUnit={formData.yieldUnit}
      />
      <div className="h-20 lg:hidden" /> {/* Spacer for mobile bar */}
    </MainLayout>
  );
};

export default FichaTecnicaEdit;
