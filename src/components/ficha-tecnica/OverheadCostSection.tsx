import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Settings, Info, Building2, Zap, FileText, Shield, Megaphone, MoreHorizontal } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getBusinessSettings,
  calculateMonthlyFixedCosts,
  calculateOverheadPerUnit,
  getOverheadBreakdown,
} from "@/lib/overhead-costs";
import { formatCurrency } from "@/lib/calculations";

interface OverheadCostSectionProps {
  useGlobalOverhead: boolean;
  manualOverhead: number;
  packagingCost: number;
  laborCostPerHour: number;
  onUseGlobalChange: (value: boolean) => void;
  onManualOverheadChange: (value: number) => void;
  onPackagingChange: (value: number) => void;
  onLaborChange: (value: number) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  "Ocupação": <Building2 className="h-3 w-3" />,
  "Utilidades": <Zap className="h-3 w-3" />,
  "Administrativo": <FileText className="h-3 w-3" />,
  "Proteção": <Shield className="h-3 w-3" />,
  "Marketing": <Megaphone className="h-3 w-3" />,
  "Outros": <MoreHorizontal className="h-3 w-3" />,
};

export function OverheadCostSection({
  useGlobalOverhead,
  manualOverhead,
  packagingCost,
  laborCostPerHour,
  onUseGlobalChange,
  onManualOverheadChange,
  onPackagingChange,
  onLaborChange,
}: OverheadCostSectionProps) {
  const settings = getBusinessSettings();
  const monthlyTotal = calculateMonthlyFixedCosts(settings.monthlyOverheadCosts);
  const globalOverheadPerUnit = calculateOverheadPerUnit(monthlyTotal, settings.estimatedMonthlyProduction);
  const breakdown = getOverheadBreakdown(settings.monthlyOverheadCosts);

  const currentOverhead = useGlobalOverhead ? globalOverheadPerUnit : manualOverhead;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Custos Indiretos</h3>
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link to="/configuracoes/custos">
              <Settings className="h-3.5 w-3.5 mr-1" />
              Configurar Custos
            </Link>
          </Button>
        </div>

        {/* Global Overhead Toggle */}
        <div className="rounded-xl bg-muted/50 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Label className="font-medium">Usar custos globais</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        Usa o overhead calculado automaticamente com base nos custos fixos
                        mensais configurados e sua produção estimada.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(globalOverheadPerUnit)}/porção baseado em {settings.estimatedMonthlyProduction} porções/mês
                </p>
              </div>
            </div>
            <Switch
              checked={useGlobalOverhead}
              onCheckedChange={onUseGlobalChange}
            />
          </div>

          {/* Breakdown preview when using global */}
          {useGlobalOverhead && breakdown.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-border"
            >
              <p className="text-xs font-medium text-muted-foreground mb-2">Composição do overhead:</p>
              <div className="flex flex-wrap gap-2">
                {breakdown.map((cat) => (
                  <Badge
                    key={cat.label}
                    variant="secondary"
                    className="text-xs flex items-center gap-1"
                  >
                    {categoryIcons[cat.label]}
                    {cat.label}: {formatCurrency(cat.value / settings.estimatedMonthlyProduction)}/porção
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}

          {useGlobalOverhead && breakdown.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 pt-4 border-t border-border"
            >
              <p className="text-sm text-amber-600 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Nenhum custo fixo configurado.{" "}
                <Link to="/configuracoes/custos" className="underline font-medium">
                  Configurar agora
                </Link>
              </p>
            </motion.div>
          )}
        </div>

        {/* Manual override or other costs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {!useGlobalOverhead && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Overhead Manual (R$)</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Custos fixos rateados por porção</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                type="number"
                min="0"
                step="0.50"
                value={manualOverhead}
                onChange={(e) => onManualOverheadChange(parseFloat(e.target.value) || 0)}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>Embalagem (R$)</Label>
            <Input
              type="number"
              min="0"
              step="0.50"
              value={packagingCost}
              onChange={(e) => onPackagingChange(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label>Mão de Obra (R$/hora)</Label>
            <Input
              type="number"
              min="0"
              step="5"
              value={laborCostPerHour}
              onChange={(e) => onLaborChange(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overhead por porção</span>
          <span className="text-lg font-bold text-primary">{formatCurrency(currentOverhead)}</span>
        </div>
      </div>
    </div>
  );
}
