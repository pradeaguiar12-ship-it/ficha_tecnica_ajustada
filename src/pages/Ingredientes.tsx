import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  FlaskConical,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { priceUnitOptions, Ingredient } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/calculations";
import { useIngredients } from "@/hooks/useIngredients";
import { useSheets } from "@/hooks/useSheets";
import { toast } from "sonner";

export default function Ingredientes() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"user" | "system" | "production">("system");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

  // Hook de ingredientes com persistência
  const {
    systemIngredients,
    userIngredients,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    categories: ingredientCategories,
    isLoading,
  } = useIngredients();

  const { sheets } = useSheets();
  const productionBases = useMemo(() =>
    sheets.filter(s => s.sheetType === 'production'),
    [sheets]);

  // Estados para controle do dialog de exclusão
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState<Ingredient | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    unitPrice: 0,
    priceUnit: "kg",
    defaultCorrection: 1.0,
    supplier: "",
  });

  // Filtra ingredientes baseado na tab ativa
  const filteredIngredients = useMemo(() => {
    const sourceList = activeTab === "user" ? userIngredients : systemIngredients;

    return sourceList.filter((ing) => {
      const matchesSearch = ing.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || ing.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter, activeTab, userIngredients, systemIngredients]);

  const getCategoryInfo = (categoryId: string) => {
    return ingredientCategories.find((c) => c.id === categoryId);
  };

  const handleOpenDialog = (ingredient?: Ingredient) => {
    if (ingredient) {
      setEditingIngredient(ingredient);
      setFormData({
        name: ingredient.name,
        categoryId: ingredient.categoryId,
        unitPrice: ingredient.unitPrice,
        priceUnit: ingredient.priceUnit,
        defaultCorrection: ingredient.defaultCorrection,
        supplier: ingredient.supplier || "",
      });
    } else {
      setEditingIngredient(null);
      setFormData({
        name: "",
        categoryId: "",
        unitPrice: 0,
        priceUnit: "kg",
        defaultCorrection: 1.0,
        supplier: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (!formData.categoryId) {
      toast.error("Selecione uma categoria");
      return;
    }
    if (formData.unitPrice <= 0) {
      toast.error("Preço deve ser maior que zero");
      return;
    }

    if (editingIngredient) {
      // Atualizar ingrediente existente
      const success = updateIngredient(editingIngredient.id, formData);
      if (success) {
        toast.success("Ingrediente atualizado com sucesso!");
      } else {
        toast.error("Erro ao atualizar ingrediente. Tente novamente.");
      }
    } else {
      // Criar novo ingrediente
      createIngredient({
        name: formData.name,
        categoryId: formData.categoryId,
        unitPrice: formData.unitPrice,
        priceUnit: formData.priceUnit,
        defaultCorrection: formData.defaultCorrection,
        supplier: formData.supplier || undefined,
      });
      toast.success("Ingrediente criado com sucesso!");
    }
    setDialogOpen(false);
  };

  // Handler para iniciar exclusão
  const handleDelete = (ingredient: Ingredient) => {
    setIngredientToDelete(ingredient);
    setDeleteDialogOpen(true);
  };

  // Handler para confirmar exclusão
  const confirmDelete = () => {
    if (ingredientToDelete) {
      const success = deleteIngredient(ingredientToDelete.id);
      if (success) {
        toast.success(`Ingrediente "${ingredientToDelete.name}" excluído com sucesso!`);
      } else {
        toast.error("Erro ao excluir ingrediente. Tente novamente.");
      }
      setDeleteDialogOpen(false);
      setIngredientToDelete(null);
    }
  };

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
              <h1 className="text-2xl font-bold text-foreground">Ingredientes</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie os ingredientes para suas fichas técnicas
              </p>
            </div>
          </div>
          <Button variant="gradient" onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4" />
            Novo Ingrediente
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "user" | "system")}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="system">Ingredientes do Sistema</TabsTrigger>
            <TabsTrigger value="user">
              Meus Ingredientes
              {userIngredients.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {userIngredients.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="production" className="text-purple-700 data-[state=active]:text-purple-800 data-[state=active]:bg-purple-50">
              Bases de Produção
              {productionBases.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 bg-purple-100 text-purple-700">
                  {productionBases.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar ingrediente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  aria-label="Buscar ingrediente"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {ingredientCategories.map((cat) => (
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

            {/* Table */}
            <TabsContent value={activeTab} className="mt-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card rounded-2xl border border-border overflow-hidden"
              >
                {isLoading ? (
                  <div className="py-16 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Carregando ingredientes...</p>
                  </div>
                ) : filteredIngredients.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ingrediente</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Preço</TableHead>
                        <TableHead className="text-center">FC</TableHead>
                        <TableHead>Atualizado</TableHead>
                        {activeTab === "user" && <TableHead className="w-[100px]">Ações</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredIngredients.map((ing) => {
                        const category = getCategoryInfo(ing.categoryId);
                        return (
                          <TableRow key={ing.id}>
                            <TableCell className="font-medium">{ing.name}</TableCell>
                            <TableCell>
                              <Badge variant="muted" className="gap-1">
                                <span>{category?.icon}</span>
                                {category?.name}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {formatCurrency(ing.unitPrice)}/{ing.priceUnit}
                            </TableCell>
                            <TableCell className="text-center">
                              {ing.defaultCorrection.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {new Date(ing.lastPriceUpdate).toLocaleDateString("pt-BR")}
                            </TableCell>
                            {activeTab === "user" && (
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => handleOpenDialog(ing)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleDelete(ing)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-16 text-center">
                    <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-muted-foreground">
                      {activeTab === "user"
                        ? "Você ainda não criou nenhum ingrediente personalizado"
                        : "Nenhum ingrediente encontrado"
                      }
                    </p>
                    {activeTab === "user" && (
                      <Button
                        variant="link"
                        className="mt-2"
                        onClick={() => handleOpenDialog()}
                      >
                        Criar primeiro ingrediente
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="production" className="mt-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card rounded-2xl border border-border overflow-hidden"
              >
                {productionBases.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Base</TableHead>
                        <TableHead>Rendimento</TableHead>
                        <TableHead className="text-right">Custo Unitário</TableHead>
                        <TableHead className="text-right">Custo Total</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productionBases.map((base) => (
                        <TableRow key={base.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <FlaskConical className="h-4 w-4 text-purple-500" />
                              {base.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            {base.productionYieldFinal || '-'} {base.productionYieldUnit}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(base.productionUnitCost || 0)}/{base.productionYieldUnit}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(base.totalCost || 0)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/ficha-tecnica/${base.id}`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-16 text-center">
                    <FlaskConical className="h-12 w-12 mx-auto mb-3 text-purple-200" />
                    <p className="text-muted-foreground">Nenhuma base de produção encontrada</p>
                    <Button variant="link" asChild className="mt-2 text-purple-600">
                      <Link to="/ficha-tecnica/nova?type=production">Criar primeira base</Link>
                    </Button>
                  </div>
                )}
              </motion.div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Dialog de criar/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingIngredient ? "Editar Ingrediente" : "Novo Ingrediente"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ing-name">Nome *</Label>
              <Input
                id="ing-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Ex: Filé Mignon"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, categoryId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {ingredientCategories.map((cat) => (
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
                <Label>Preço Unitário (R$) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.10"
                  value={formData.unitPrice}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      unitPrice: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Unidade</Label>
                <Select
                  value={formData.priceUnit}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, priceUnit: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priceUnitOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fator de Correção</Label>
                <Input
                  type="number"
                  min="1"
                  max="2"
                  step="0.05"
                  value={formData.defaultCorrection}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      defaultCorrection: parseFloat(e.target.value) || 1,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Fornecedor</Label>
                <Input
                  value={formData.supplier}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, supplier: e.target.value }))
                  }
                  placeholder="Opcional"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingIngredient ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir ingrediente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O ingrediente{" "}
              <span className="font-semibold text-foreground">
                "{ingredientToDelete?.name}"
              </span>{" "}
              será permanentemente excluído.
              <br /><br />
              <span className="text-amber-600">
                Nota: Fichas técnicas que usam este ingrediente não serão afetadas.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
