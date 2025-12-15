// Overhead costs configuration and calculations

export interface OverheadCosts {
  // Ocupação
  rent: number;              // Aluguel
  propertyTax: number;       // IPTU
  condoFee: number;          // Condomínio
  
  // Utilidades
  electricity: number;       // Energia elétrica
  water: number;             // Água
  gas: number;               // Gás
  internet: number;          // Internet/Telefone
  
  // Administrativo
  accounting: number;        // Contabilidade
  licenses: number;          // Licenças e alvarás
  
  // Proteção
  insurance: number;         // Seguros
  maintenance: number;       // Manutenção
  
  // Marketing
  marketing: number;         // Marketing
  
  // Outros
  depreciation: number;      // Depreciação
  other: number;             // Outros custos
}

export interface BusinessSettings {
  monthlyOverheadCosts: OverheadCosts;
  estimatedMonthlyProduction: number;  // Porções/mês
  taxRate: number;                      // Taxa de impostos (%)
}

export const defaultOverheadCosts: OverheadCosts = {
  rent: 0,
  propertyTax: 0,
  condoFee: 0,
  electricity: 0,
  water: 0,
  gas: 0,
  internet: 0,
  accounting: 0,
  licenses: 0,
  insurance: 0,
  maintenance: 0,
  marketing: 0,
  depreciation: 0,
  other: 0,
};

export const defaultBusinessSettings: BusinessSettings = {
  monthlyOverheadCosts: defaultOverheadCosts,
  estimatedMonthlyProduction: 500,
  taxRate: 6,
};

// Mock storage - simulates database
let businessSettings: BusinessSettings = { ...defaultBusinessSettings };

export function getBusinessSettings(): BusinessSettings {
  return { ...businessSettings };
}

export function updateBusinessSettings(settings: Partial<BusinessSettings>): void {
  businessSettings = { ...businessSettings, ...settings };
}

// Calculate total monthly fixed costs
export function calculateMonthlyFixedCosts(costs: OverheadCosts): number {
  return (
    costs.rent +
    costs.propertyTax +
    costs.condoFee +
    costs.electricity +
    costs.water +
    costs.gas +
    costs.internet +
    costs.accounting +
    costs.licenses +
    costs.insurance +
    costs.maintenance +
    costs.marketing +
    costs.depreciation +
    costs.other
  );
}

// Calculate overhead per unit/portion
export function calculateOverheadPerUnit(
  monthlyFixedCosts: number,
  monthlyProduction: number
): number {
  if (monthlyProduction <= 0) return 0;
  return Math.round((monthlyFixedCosts / monthlyProduction) * 100) / 100;
}

// Get overhead breakdown by category
export interface OverheadBreakdownCategory {
  label: string;
  value: number;
  color: string;
  items: { label: string; value: number }[];
}

export function getOverheadBreakdown(costs: OverheadCosts): OverheadBreakdownCategory[] {
  return [
    {
      label: "Ocupação",
      value: costs.rent + costs.propertyTax + costs.condoFee,
      color: "bg-blue-500",
      items: [
        { label: "Aluguel", value: costs.rent },
        { label: "IPTU", value: costs.propertyTax },
        { label: "Condomínio", value: costs.condoFee },
      ].filter(i => i.value > 0),
    },
    {
      label: "Utilidades",
      value: costs.electricity + costs.water + costs.gas + costs.internet,
      color: "bg-amber-500",
      items: [
        { label: "Energia", value: costs.electricity },
        { label: "Água", value: costs.water },
        { label: "Gás", value: costs.gas },
        { label: "Internet", value: costs.internet },
      ].filter(i => i.value > 0),
    },
    {
      label: "Administrativo",
      value: costs.accounting + costs.licenses,
      color: "bg-purple-500",
      items: [
        { label: "Contabilidade", value: costs.accounting },
        { label: "Licenças", value: costs.licenses },
      ].filter(i => i.value > 0),
    },
    {
      label: "Proteção",
      value: costs.insurance + costs.maintenance,
      color: "bg-emerald-500",
      items: [
        { label: "Seguros", value: costs.insurance },
        { label: "Manutenção", value: costs.maintenance },
      ].filter(i => i.value > 0),
    },
    {
      label: "Marketing",
      value: costs.marketing,
      color: "bg-pink-500",
      items: [
        { label: "Marketing", value: costs.marketing },
      ].filter(i => i.value > 0),
    },
    {
      label: "Outros",
      value: costs.depreciation + costs.other,
      color: "bg-slate-500",
      items: [
        { label: "Depreciação", value: costs.depreciation },
        { label: "Outros", value: costs.other },
      ].filter(i => i.value > 0),
    },
  ].filter(cat => cat.value > 0);
}

// Cost category labels for forms
export const overheadCostLabels: Record<keyof OverheadCosts, { label: string; category: string; hint?: string }> = {
  rent: { label: "Aluguel", category: "Ocupação", hint: "Valor mensal do aluguel" },
  propertyTax: { label: "IPTU", category: "Ocupação", hint: "Valor mensal (anual ÷ 12)" },
  condoFee: { label: "Condomínio", category: "Ocupação" },
  electricity: { label: "Energia Elétrica", category: "Utilidades", hint: "Média mensal" },
  water: { label: "Água", category: "Utilidades", hint: "Média mensal" },
  gas: { label: "Gás", category: "Utilidades", hint: "Botijão ou encanado" },
  internet: { label: "Internet/Telefone", category: "Utilidades" },
  accounting: { label: "Contabilidade", category: "Administrativo" },
  licenses: { label: "Licenças e Alvarás", category: "Administrativo", hint: "Valor mensal (anual ÷ 12)" },
  insurance: { label: "Seguros", category: "Proteção", hint: "Valor mensal" },
  maintenance: { label: "Manutenção", category: "Proteção", hint: "Equipamentos e estrutura" },
  marketing: { label: "Marketing", category: "Marketing", hint: "Publicidade e divulgação" },
  depreciation: { label: "Depreciação", category: "Outros", hint: "Equipamentos e móveis" },
  other: { label: "Outros Custos", category: "Outros" },
};
