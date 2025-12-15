// Unit conversions for ingredients
const UNIT_CONVERSIONS: Record<string, number> = {
  g: 1,
  kg: 1000,
  mg: 0.001,
  ml: 1,
  L: 1000,
  unidade: 1,
  'dúzia': 12,
  colher_sopa: 15,
  colher_cha: 5,
  xicara: 240,
};

// Calculate ingredient cost
export function calculateIngredientCost(
  quantity: number,
  unit: string,
  unitPrice: number,
  priceUnit: string,
  correctionFactor: number = 1.0
): number {
  const quantityInBase = quantity * (UNIT_CONVERSIONS[unit] || 1);
  const pricePerBase = unitPrice / (UNIT_CONVERSIONS[priceUnit] || 1);
  const rawCost = quantityInBase * pricePerBase;
  return Math.round(rawCost * correctionFactor * 100) / 100;
}

// Calculate total recipe cost
export function calculateTotalCost(
  ingredientsCost: number,
  overheadCost: number = 0,
  packagingCost: number = 0,
  laborCostPerHour: number = 0,
  prepMinutes: number = 0,
  cookMinutes: number = 0
): number {
  const laborCost = (laborCostPerHour * (prepMinutes + cookMinutes)) / 60;
  return Math.round((ingredientsCost + overheadCost + packagingCost + laborCost) * 100) / 100;
}

// Calculate cost per unit/portion
export function calculateCostPerUnit(totalCost: number, yieldQuantity: number): number {
  return yieldQuantity > 0 ? Math.round((totalCost / yieldQuantity) * 100) / 100 : 0;
}

// Calculate suggested selling price
export function calculateSuggestedPrice(costPerUnit: number, targetMargin: number): number {
  if (targetMargin >= 100) return costPerUnit * 10;
  if (targetMargin <= 0) return costPerUnit;
  return Math.round((costPerUnit / (1 - targetMargin / 100)) * 100) / 100;
}

// Calculate actual margin
export function calculateActualMargin(costPerUnit: number, sellingPrice: number): number {
  if (sellingPrice <= 0) return 0;
  return Math.round(((sellingPrice - costPerUnit) / sellingPrice) * 10000) / 100;
}

// Format currency (Brazilian Real)
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Format percentage
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Generate unique code for technical sheets
export function generateSheetCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'FT-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Format time in minutes to readable string
export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

// Get margin quality indicator
export function getMarginQuality(margin: number): {
  label: string;
  color: 'success' | 'warning' | 'destructive';
} {
  if (margin >= 30) return { label: 'Excelente', color: 'success' };
  if (margin >= 20) return { label: 'Boa', color: 'warning' };
  return { label: 'Baixa', color: 'destructive' };
}
