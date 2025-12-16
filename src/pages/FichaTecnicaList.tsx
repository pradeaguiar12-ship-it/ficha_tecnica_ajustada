import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  TrendingUp,
  Package,
  AlertTriangle,
  FileText,
  FlaskConical,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/alert-dialog";
import { StatCard } from "@/components/ficha-tecnica/StatCard";
import { RecipeCard } from "@/components/ficha-tecnica/RecipeCard";
import { EmptyState } from "@/components/ficha-tecnica/EmptyState";
import { RecipeCardGridSkeleton } from "@/components/ui/skeleton-cards";
import { recipeCategories, statusOptions, TechnicalSheet } from "@/lib/mock-data";
import { useSheets } from "@/hooks/useSheets";
import { useIngredients } from "@/hooks/useIngredients";
import { toastDeleteWithUndo } from "@/lib/toast-utils";
import { toast } from "sonner";

export default function FichaTecnicaList() {
  // Estados de filtro
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Hook de fichas técnicas com persistência
  const {
    sheets,
    deleteSheet,
    duplicateSheet,
    stats: sheetStats,
    isLoading
  } = useSheets();

  // Hook de ingredientes para estatísticas
  const { stats: ingredientStats } = useIngredients();

  // Estados para controle do dialog de exclusão
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sheetToDelete, setSheetToDelete] = useState<TechnicalSheet | null>(null);

  // Filtra as fichas baseado nos critérios de busca
  const filteredSheets = useMemo(() => {
    return sheets.filter((sheet) => {
      const matchesSearch = sheet.name.toLowerCase().includes(search.toLowerCase()) ||
        sheet.code.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || sheet.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || sheet.categoryId === categoryFilter;
      const matchesType = typeFilter === "all" || (sheet.sheetType || 'dish') === typeFilter;
      return matchesSearch && matchesStatus && matchesCategory && matchesType;
    });
  }, [sheets, search, statusFilter, categoryFilter, typeFilter]);

  // Handler para iniciar processo de exclusão
  const handleDelete = (id: string) => {
    const sheet = sheets.find(s => s.id === id);
    if (sheet) {
      setSheetToDelete(sheet);
      setDeleteDialogOpen(true);
    }
  };

  // Handler para confirmar exclusão
  const confirmDelete = () => {
    if (sheetToDelete) {
      const deletedSheet = sheetToDelete;
      const success = deleteSheet(deletedSheet.id);
      if (success) {
        // Toast com undo
        toastDeleteWithUndo(
          `Ficha "${deletedSheet.name}"`,
          () => {
            // Reverter exclusão (adicionar de volta)
            // Nota: Isso requer uma função de restore no hook useSheets
            toast.info("Funcionalidade de restaurar em desenvolvimento");
          }
        );
      } else {
        toast.error("Erro ao excluir ficha. Tente novamente.");
      }
      setDeleteDialogOpen(false);
      setSheetToDelete(null);
    }
  };

  // Handler para duplicar ficha
  const handleDuplicate = (id: string) => {
    const duplicated = duplicateSheet(id);
    if (duplicated) {
      toast.success(`Ficha "${duplicated.name}" criada com sucesso!`);
    } else {
      toast.error("Erro ao duplicar ficha. Tente novamente.");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Fichas Técnicas</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie suas receitas e controle custos de produção
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link to="/ficha-tecnica/ingredientes">
                <Package className="h-4 w-4" />
                Ingredientes
              </Link>
            </Button>
            <Button variant="outline" asChild className="hidden sm:flex border-purple-200 hover:bg-purple-50 hover:text-purple-700 text-purple-600">
              <Link to="/ficha-tecnica/nova?type=production" aria-label="Criar nova base de produção">
                <FlaskConical className="h-4 w-4 mr-2" />
                Nova Base
              </Link>
            </Button>
            <Button variant="gradient" asChild>
              <Link to="/ficha-tecnica/nova?type=dish" aria-label="Criar nova ficha técnica">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Nova Ficha
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Fichas Ativas"
            value={sheetStats.active}
            subtitle="receitas prontas para uso"
            icon={<FileText className="h-6 w-6 text-primary" />}
          />
          <StatCard
            title="Margem Média"
            value={`${sheetStats.avgMargin}%`}
            subtitle="de todas as fichas"
            icon={<TrendingUp className="h-6 w-6 text-white" />}
            variant="primary"
          />
          <StatCard
            title="Ingredientes"
            value={ingredientStats.total}
            subtitle={`${ingredientStats.totalSystem} sistema + ${ingredientStats.totalUser} seus`}
            icon={<Package className="h-6 w-6 text-primary" />}
          />
          <StatCard
            title="Alertas"
            value={sheetStats.lowMarginCount}
            subtitle="margem abaixo de 20%"
            icon={<AlertTriangle className="h-6 w-6 text-amber-600" />}
            variant="warning"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              aria-label="Buscar fichas técnicas por nome ou código"
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="dish">Pratos</SelectItem>
                <SelectItem value="production">Bases</SelectItem>
              </SelectContent>
            </Select>
            <div className="w-[1px] bg-border h-10 mx-1 hidden sm:block"></div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
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
        </div>

        {/* Loading State */}
        {isLoading ? (
          <RecipeCardGridSkeleton count={8} />
        ) : filteredSheets.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filteredSheets.map((sheet, index) => (
              <RecipeCard
                key={sheet.id}
                sheet={sheet}
                index={index}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
              />
            ))}
          </motion.div>
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir ficha técnica?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A ficha{" "}
              <span className="font-semibold text-foreground">
                "{sheetToDelete?.name}"
              </span>{" "}
              será permanentemente excluída do sistema.
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
