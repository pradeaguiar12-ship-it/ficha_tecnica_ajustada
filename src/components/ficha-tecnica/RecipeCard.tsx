import { Link } from "react-router-dom";
import { Clock, Users, MoreVertical, Eye, Copy, Trash2, ChefHat, FileDown, FlaskConical } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TechnicalSheet, statusOptions } from "@/lib/mock-data";
import { formatCurrency, formatTime, getMarginQuality } from "@/lib/calculations";
import { PDFDownloadButton } from "@/lib/pdf-generator";
import { useUser } from "@/contexts/UserContext";
import { FEATURES } from "@/lib/features";
import { cn } from "@/lib/utils";

interface RecipeCardProps {
  sheet: TechnicalSheet;
  index: number;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

export function RecipeCard({ sheet, index, onDelete, onDuplicate }: RecipeCardProps) {
  const { hasFeature } = useUser();
  const totalTime = sheet.prepTimeMinutes + sheet.cookTimeMinutes + sheet.restTimeMinutes;
  const marginQuality = getMarginQuality(sheet.actualMargin);
  const status = statusOptions.find(s => s.value === sheet.status);
  const canExportPDF = hasFeature(FEATURES.EXPORT_PDF);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-card rounded-2xl border border-border overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300"
    >
      {/* Image area */}
      <div className="relative h-40 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center overflow-hidden">
        {sheet.imageUrl ? (
          <img
            src={sheet.imageUrl}
            alt={sheet.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ChefHat className="h-12 w-12 opacity-30" />
            <span className="text-xs opacity-50">Sem imagem</span>
          </div>
        )}

        {/* Status badge */}
        <Badge
          variant="status"
          className={cn("absolute top-3 left-3", status?.color)}
        >
          {status?.label}
        </Badge>

        {/* Production Badge */}
        {sheet.sheetType === 'production' && (
          <Badge
            className="absolute top-3 right-3 bg-purple-500 hover:bg-purple-600 text-white border-none shadow-sm gap-1"
          >
            <FlaskConical className="h-3 w-3" />
            Base
          </Badge>
        )}

        {/* Category icon */}
        {sheet.category && sheet.sheetType !== 'production' && (
          <div className="absolute top-3 right-3 text-2xl">
            {sheet.category.icon}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="space-y-1">
          <p className="text-xs font-mono text-muted-foreground">{sheet.code}</p>
          <h3 className="font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {sheet.name}
          </h3>
        </div>

        {/* Info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatTime(totalTime)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>{sheet.yieldQuantity} {sheet.yieldUnit}</span>
          </div>
        </div>

        {/* Prices & Production Info */}
        {sheet.sheetType === 'production' ? (
          /* Production Layout */
          <div className="space-y-3 py-3 border-t border-border mt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Custo / {sheet.productionYieldUnit || sheet.yieldUnit}</p>
                <p className="font-bold text-foreground">{formatCurrency(sheet.productionUnitCost || 0)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Custo Total</p>
                <p className="font-bold text-foreground">{formatCurrency((sheet.totalCost || 0))}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
              <FlaskConical className="h-3.5 w-3.5 text-purple-500" />
              <span>Base de Produção</span>
            </div>
          </div>
        ) : (
          /* Dish Layout */
          <>
            <div className="grid grid-cols-2 gap-3 py-3 border-y border-border">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Custo/unid.</p>
                <p className="font-bold text-foreground">{formatCurrency(sheet.costPerUnit)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Preço sugerido</p>
                <p className="font-bold text-primary">{formatCurrency(sheet.suggestedPrice)}</p>
              </div>
            </div>

            {/* Margin */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Margem</span>
                <Badge
                  variant={marginQuality.color === 'success' ? 'success' : marginQuality.color === 'warning' ? 'warning' : 'destructive'}
                  className="text-[10px]"
                >
                  {sheet.actualMargin.toFixed(1)}% - {marginQuality.label}
                </Badge>
              </div>
              <Progress
                value={Math.min(sheet.actualMargin, 100)}
                variant={marginQuality.color === 'success' ? 'success' : marginQuality.color === 'warning' ? 'warning' : 'destructive'}
                className="h-1.5"
              />
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon-sm"
              className="h-8 w-8 bg-card/90 backdrop-blur-sm shadow-md"
              aria-label={`Menu de opções para ${sheet.name}`}
            >
              <MoreVertical className="h-4 w-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link to={`/ficha-tecnica/${sheet.id}`} className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Ver / Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDuplicate?.(sheet.id)}
              className="flex items-center gap-2"
              aria-label={`Duplicar ficha técnica ${sheet.name}`}
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              Duplicar
            </DropdownMenuItem>
            {canExportPDF && (
              <>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5">
                  <PDFDownloadButton sheet={sheet} />
                </div>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete?.(sheet.id)}
              className="flex items-center gap-2 text-destructive focus:text-destructive"
              aria-label={`Excluir ficha técnica ${sheet.name}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Click overlay */}
      <Link
        to={`/ficha-tecnica/${sheet.id}`}
        className="absolute inset-0 z-0"
        aria-label={`Ver ${sheet.name}`}
      />
    </motion.div>
  );
}
