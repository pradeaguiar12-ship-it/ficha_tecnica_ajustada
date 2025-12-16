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
  Beaker,
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
import { ProductionYieldSection } from "@/components/ficha-tecnica/ProductionYieldSection";
import { BaseCostSummary } from "@/components/ficha-tecnica/BaseCostSummary";
import {
  yieldUnitOptions,
  Ingredient,
  sheetTypeOptions,
  SheetType,
  ProductionYieldUnit,
} from "@/lib/mock-data";
import {
  calculateTotalCost,
  calculateCostPerUnit,
  calculateSuggestedPrice,
  calculateActualMargin,
  calculateProductionUnitCost,
  calculateIngredientCost,
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
  const { getSheetById, updateSheet, deleteSheet, isLoading, sheets } = useSheets();
  const { settings, overheadPerUnit: globalOverheadPerUnit } = useSettings();

  // Buscar ficha pelo ID
  const sheet = getSheetById(id || '');

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    // Sheet type (dish or production base)
    sheetType: "dish" as SheetType,
    // Standard yield for dishes
    yieldQuantity: 4,
    yieldUnit: "porções",
    // Production-specific fields
    productionYieldUnit: "ml" as ProductionYieldUnit,
    productionYieldFinal: 0,
    productionLossPercent: 0,
    // Time
    prepTimeMinutes: 0,
    cookTimeMinutes: 0,
    restTimeMinutes: 0,
    instructions: "",
    tips: "",
    // Costs
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
        // Sheet type (default to 'dish' for existing sheets)
        sheetType: sheet.sheetType || "dish",
        // Standard yield
        yieldQuantity: sheet.yieldQuantity,
        yieldUnit: sheet.yieldUnit,
        // Production fields
        productionYieldUnit: sheet.productionYieldUnit || "ml",
        productionYieldFinal: sheet.productionYieldFinal || 0,
        productionLossPercent: sheet.productionLossPercent || 0,
        // Time
        prepTimeMinutes: sheet.prepTimeMinutes,
        cookTimeMinutes: sheet.cookTimeMinutes,
        restTimeMinutes: sheet.restTimeMinutes,
        instructions: sheet.instructions || "",
        tips: sheet.tips || "",
        // Costs
        useGlobalOverhead: sheet.overheadCost === 0 || sheet.overheadCost === globalOverheadPerUnit,
        overheadCost: sheet.overheadCost,
        packagingCost: sheet.packagingCost,
        laborCostPerHour: sheet.laborCostPerHour,
        targetMargin: sheet.targetMargin,
        useManualPrice: !!sheet.manualPrice,
        manualPrice: sheet.manualPrice || 0,
      });

      // Convert SheetIngredient[] to RecipeIngredient[]
      const recipeIngredients: RecipeIngredient[] = sheet.ingredients
        .filter(si => si && si.ingredient) // Safety check
        .map((si) => ({
          id: si.id,
          ingredient: si.ingredient,
          quantity: si.quantity,
          unit: si.unit,
          correctionFactor: si.correctionFactor,
          calculatedCost: si.calculatedCost,
          ingredientKind: si.ingredientKind,
          refSheetId: si.refSheetId,
          refUnitCost: si.refUnitCost,
        }));
      setIngredients(recipeIngredients);
      setSteps(sheet.steps || []);
      if (sheet.nutrition) setNutrition(sheet.nutrition);
      setIsInitialized(true);
    }
  }, [sheet, isInitialized, globalOverheadPerUnit]);

  // Synchronize Production Base Costs
  useEffect(() => {
    if (isInitialized && !isLoading && sheets.length > 0) {
      let hasUpdates = false;
      const syncedIngredients = ingredients.map(ing => {
        if (ing.ingredientKind === 'production_ref' && ing.refSheetId) {
          const baseSheet = sheets.find(s => s.id === ing.refSheetId);
          if (baseSheet && baseSheet.productionUnitCost !== undefined) {
            const currentSnapshot = ing.refUnitCost || 0;
            const liveCost = baseSheet.productionUnitCost;

            if (Math.abs(currentSnapshot - liveCost) > 0.0001) {
              hasUpdates = true;
              return {
                ...ing,
                refUnitCost: liveCost,
                ingredient: {
                  ...ing.ingredient,
                  unitPrice: liveCost
                }
              };
            }
          }
        }
        return ing;
      });

      if (hasUpdates) {
        setIngredients(syncedIngredients);
        toast.info("Custos atualizados", {
          description: "Os custos de algumas bases foram atualizados automaticamente.",
          duration: 4000
        });
      }
    }
  }, [isInitialized, isLoading, sheets.length]);

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

    // Calculate production unit cost for production sheets
    // Now uses TOTAL cost (including overhead, packaging, labor) for accurate base costing
    const productionUnitCost = debouncedFormData.sheetType === 'production'
      ? calculateProductionUnitCost(totalCost, debouncedFormData.productionYieldFinal)
      : 0;

    return {
      ingredientsCost,
      totalCost,
      costPerUnit,
      suggestedPrice,
      actualMargin,
      productionUnitCost,
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
        sheetId: sheet.id,
        ingredientId: ing.ingredient.id,
        orderIndex: 0, // Not tracked in UI yet
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
      sheetType: state.sheetType || "dish",
      yieldQuantity: state.yieldQuantity,
      yieldUnit: state.yieldUnit,
      productionYieldUnit: state.productionYieldUnit || "ml",
      productionYieldFinal: state.productionYieldFinal || 0,
      productionLossPercent: state.productionLossPercent || 0,
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
  const handleAddIngredient = useCallback((ingredient: Ingredient, quantity: number = 0, unit: string = "un", mode: 'new' | 'sum' = 'new') => {
    const isBase = ingredient.id.startsWith('BASE_');
    const baseId = isBase ? ingredient.id.replace('BASE_', '') : undefined;

    const newItem: RecipeIngredient = {
      id: `temp-${Date.now()}`,
      ingredient,
      quantity,
      unit,
      correctionFactor: ingredient.defaultCorrection || 1,
      calculatedCost: 0,

      // Phase 2: Production Base Reference
      ingredientKind: isBase ? 'production_ref' : 'raw',
      refSheetId: baseId,
      refUnitCost: isBase ? ingredient.unitPrice : undefined,
      refYieldUnit: isBase ? (ingredient.priceUnit as any) : undefined
    };

    // Calculate initial cost
    newItem.calculatedCost = calculateIngredientCost(
      newItem.quantity,
      newItem.unit,
      newItem.ingredient.unitPrice,
      newItem.ingredient.priceUnit,
      newItem.correctionFactor
    );

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
    // Validate production sheet specific fields
    if (formData.sheetType === 'production' && formData.productionYieldFinal <= 0) {
      toast.error("Rendimento final é obrigatório para fichas de produção");
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

      // Phase 2: Production Base Reference
      ingredientKind: ing.ingredientKind || 'raw',
      refSheetId: ing.refSheetId,
      refUnitCost: ing.refUnitCost,
      refYieldUnit: ing.refYieldUnit,
    }));

    // Atualizar usando o hook
    const success = updateSheet(id!, {
      name: formData.name,
      description: formData.description || undefined,
      categoryId: formData.categoryId,
      // Production sheet fields
      sheetType: formData.sheetType,
      productionYieldUnit: formData.sheetType === 'production' ? formData.productionYieldUnit : undefined,
      productionYieldFinal: formData.sheetType === 'production' ? formData.productionYieldFinal : undefined,
      productionLossPercent: formData.sheetType === 'production' ? formData.productionLossPercent : undefined,
      productionUnitCost: formData.sheetType === 'production' ? calculations.productionUnitCost : undefined,
      // Standard yield
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
        sheetType: draft.sheetType || "dish",
        yieldQuantity: draft.yieldQuantity,
        yieldUnit: draft.yieldUnit,
        productionYieldUnit: draft.productionYieldUnit || "ml",
        productionYieldFinal: draft.productionYieldFinal || 0,
        productionLossPercent: draft.productionLossPercent || 0,
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
      clearDraft(); // Close dialog after recovering
      toast.success("Rascunho recuperado com sucesso!");
    } else {
      clearDraft(); // Clear invalid draft
      toast.info("Nenhum rascunho válido encontrado.");
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
              <h1 className="text-2xl font-bold text-foreground">
                {sheet.sheetType === 'production' ? "Editar Base de Produção" : "Editar Ficha Técnica"}
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Código: {sheet.code}</p>
                <StatusBadge status={saveStatus} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-auto sm:ml-0">
            {persistableData && <ShareDialog sheet={persistableData} />}
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

                    {/* Sheet Type Selector - Positioned prominently after Name */}
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

                    {/* Standard Yield - Only for dishes */}
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

                    {/* Production Yield Section - Only for production sheets */}
                    {formData.sheetType === 'production' && (
                      <ProductionYieldSection
                        yieldFinal={formData.productionYieldFinal}
                        yieldUnit={formData.productionYieldUnit}
                        lossPercent={formData.productionLossPercent}
                        totalIngredientCost={calculations.ingredientsCost}
                        onYieldFinalChange={(value) =>
                          setFormData((prev) => ({ ...prev, productionYieldFinal: value }))
                        }
                        onYieldUnitChange={(value) =>
                          setFormData((prev) => ({ ...prev, productionYieldUnit: value }))
                        }
                        onLossPercentChange={(value) =>
                          setFormData((prev) => ({ ...prev, productionLossPercent: value }))
                        }
                      />
                    )}
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
