import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Building2,
  Zap,
  FileText,
  Shield,
  Megaphone,
  MoreHorizontal,
  Calculator,
  TrendingUp,
  Info,
  Download,
  Upload,
  AlertTriangle,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  OverheadCosts,
  overheadCostLabels,
} from "@/lib/overhead-costs";
import { formatCurrency } from "@/lib/calculations";
import { useSettings } from "@/hooks/useSettings";
import { exportAllData, importData } from "@/lib/storage";
import { toast } from "sonner";

const categoryIcons: Record<string, React.ReactNode> = {
  "Ocupação": <Building2 className="h-4 w-4" />,
  "Utilidades": <Zap className="h-4 w-4" />,
  "Administrativo": <FileText className="h-4 w-4" />,
  "Proteção": <Shield className="h-4 w-4" />,
  "Marketing": <Megaphone className="h-4 w-4" />,
  "Outros": <MoreHorizontal className="h-4 w-4" />,
};

const categoryColors: Record<string, string> = {
  "Ocupação": "bg-blue-500",
  "Utilidades": "bg-amber-500",
  "Administrativo": "bg-purple-500",
  "Proteção": "bg-emerald-500",
  "Marketing": "bg-pink-500",
  "Outros": "bg-slate-500",
};

export default function ConfiguracoesCustos() {
  // Hook de configurações com persistência
  const {
    settings,
    isLoading,
    hasChanges,
    updateOverheadCost,
    updateProduction,
    updateTaxRate,
    saveSettings,
    monthlyTotal,
    overheadPerUnit,
  } = useSettings();

  // Group fields by category
  const fieldsByCategory = useMemo(() => {
    const groups: Record<string, { key: keyof OverheadCosts; label: string; hint?: string }[]> = {};
    Object.entries(overheadCostLabels).forEach(([key, { label, category, hint }]) => {
      if (!groups[category]) groups[category] = [];
      groups[category].push({ key: key as keyof OverheadCosts, label, hint });
    });
    return groups;
  }, []);

  const handleSave = () => {
    const success = saveSettings();
    if (success) {
      toast.success("Configurações de custos salvas com sucesso!");
    } else {
      toast.error("Erro ao salvar configurações. Tente novamente.");
    }
  };

  // Calculate category totals
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    Object.entries(overheadCostLabels).forEach(([key, { category }]) => {
      const value = settings.monthlyOverheadCosts[key as keyof OverheadCosts];
      totals[category] = (totals[category] || 0) + value;
    });
    return totals;
  }, [settings.monthlyOverheadCosts]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </MainLayout>
    );
  }

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
              <h1 className="text-2xl font-bold text-foreground">Configurações de Custos</h1>
              <p className="text-sm text-muted-foreground">
                Configure os custos fixos mensais do seu negócio
              </p>
            </div>
          </div>
          <Button variant="gradient" onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4" />
            Salvar Configurações
            {hasChanges && (
              <Badge variant="secondary" className="ml-2 bg-white/20">
                Alterado
              </Badge>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Production Settings */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calculator className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Produção Mensal</h3>
                  <p className="text-sm text-muted-foreground">
                    Estimativa para calcular o custo por porção
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Porções por mês (estimativa)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={settings.estimatedMonthlyProduction}
                    onChange={(e) => updateProduction(parseInt(e.target.value) || 1)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Total de porções/unidades vendidas por mês
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Taxa de Impostos (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={settings.taxRate}
                    onChange={(e) => updateTaxRate(parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Aplicado sobre o preço de venda (MEI: ~6%)
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Cost Categories */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <h3 className="font-semibold text-foreground mb-4">Custos Fixos Mensais</h3>

              <Accordion type="multiple" defaultValue={["Ocupação", "Utilidades"]} className="space-y-2">
                {Object.entries(fieldsByCategory).map(([category, fields]) => (
                  <AccordionItem
                    key={category}
                    value={category}
                    className="border border-border rounded-xl px-4 data-[state=open]:bg-muted/30"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-8 w-8 rounded-lg ${categoryColors[category]} flex items-center justify-center text-white`}
                        >
                          {categoryIcons[category]}
                        </div>
                        <span className="font-medium">{category}</span>
                        {categoryTotals[category] > 0 && (
                          <Badge variant="secondary" className="ml-auto mr-2">
                            {formatCurrency(categoryTotals[category])}
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {fields.map(({ key, label, hint }) => (
                          <div key={key} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label>{label}</Label>
                              {hint && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">{hint}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                R$
                              </span>
                              <Input
                                type="number"
                                min="0"
                                step="10"
                                className="pl-10"
                                value={settings.monthlyOverheadCosts[key] || ""}
                                onChange={(e) =>
                                  updateOverheadCost(key, parseFloat(e.target.value) || 0)
                                }
                                placeholder="0,00"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>

          {/* Summary Card */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
            {/* Main Summary */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl gradient-hero p-6 text-white shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white/70 text-sm font-medium mb-1">Overhead por Porção</p>
                  <p className="text-4xl font-bold tracking-tight">
                    {formatCurrency(overheadPerUnit)}
                  </p>
                  <p className="text-white/60 text-xs mt-1">custo fixo por unidade</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>

              <div className="pt-4 border-t border-white/20 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Total Mensal</span>
                  <span className="font-semibold">{formatCurrency(monthlyTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Produção Estimada</span>
                  <span className="font-semibold">{settings.estimatedMonthlyProduction} porções</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Taxa de Impostos</span>
                  <span className="font-semibold">{settings.taxRate}%</span>
                </div>
              </div>
            </motion.div>

            {/* Category Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-card border border-border p-5"
            >
              <h4 className="font-semibold text-foreground mb-4">Distribuição por Categoria</h4>
              <div className="space-y-3">
                {Object.entries(categoryTotals)
                  .filter(([_, value]) => value > 0)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, value]) => {
                    const percentage = monthlyTotal > 0 ? (value / monthlyTotal) * 100 : 0;
                    return (
                      <div key={category} className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${categoryColors[category]}`} />
                            <span className="text-muted-foreground">{category}</span>
                          </div>
                          <span className="font-medium">{formatCurrency(value)}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${categoryColors[category]}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>

              {monthlyTotal === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  Configure os custos acima para ver a distribuição
                </p>
              )}
            </motion.div>

            {/* Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl bg-blue-50 border border-blue-200 p-4"
            >
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Como funciona?</p>
                  <p className="text-blue-600">
                    O custo fixo por porção é calculado dividindo o total de custos mensais pela
                    produção estimada. Este valor é automaticamente incluído nas suas fichas técnicas.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Backup Section - Beta */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl bg-amber-50 border border-amber-200 p-4"
            >
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 mb-1">Beta: Dados Locais</p>
                  <p className="text-amber-700 text-xs">
                    Seus dados ficam salvos neste navegador. Se você limpar o navegador, os dados podem ser perdidos.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 border-amber-300 hover:bg-amber-100"
                  onClick={() => {
                    const data = exportAllData();
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `meu-chef-backup-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success("Backup exportado com sucesso. Guarde este arquivo em local seguro.");
                  }}
                >
                  <Download className="h-4 w-4" />
                  Exportar Backup (JSON)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 border-amber-300 hover:bg-amber-100"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const result = importData(ev.target?.result as string);
                          if (result.success) {
                            toast.success(result.message);
                            window.location.reload();
                          } else {
                            toast.error(result.message);
                          }
                        };
                        reader.readAsText(file);
                      }
                    };
                    input.click();
                  }}
                >
                  <Upload className="h-4 w-4" />
                  Importar Backup (JSON)
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
