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

// ============================================
// PRODUCTION SHEET CALCULATIONS
// ============================================

/**
 * Calculate the unit cost of a production sheet (base/pre-prep)
 * @param totalIngredientCost - Total cost of all ingredients
 * @param yieldFinal - Final yield after losses (e.g., 2400 ml)
 * @returns Cost per unit (R$/g, R$/ml, etc) with 4 decimal places for precision
 */
export function calculateProductionUnitCost(
  totalIngredientCost: number,
  yieldFinal: number
): number {
  if (yieldFinal <= 0) return 0;
  // Use 4 decimal places for better precision (e.g., R$ 0.0150/ml)
  return Math.round((totalIngredientCost / yieldFinal) * 10000) / 10000;
}

/**
 * Calculate the cost of using a production base in a recipe
 * @param quantity - Amount used (e.g., 80 ml)
 * @param unitCost - Cost per unit of the base (e.g., 0.12 R$/ml)
 * @returns Total cost (e.g., 9.60)
 */
export function calculateProductionIngredientCost(
  quantity: number,
  unitCost: number
): number {
  return Math.round(quantity * unitCost * 100) / 100;
}

/**
 * Format production unit cost for display
 * @param unitCost - Cost per unit
 * @param unit - Unit type (g, ml, un, portion)
 * @returns Formatted string like "R$ 0,015 / ml"
 */
export function formatProductionUnitCost(unitCost: number, unit: string): string {
  const unitLabels: Record<string, string> = {
    'g': 'g',
    'ml': 'ml',
    'un': 'un',
    'portion': 'porção',
  };

  return `${formatCurrency(unitCost)} / ${unitLabels[unit] || unit}`;
}

/**
 * Generate sheet code with appropriate prefix
 * @param sheetType - 'dish' or 'production'
 * @returns Code like "FT-A1B2C3" for dishes or "BP-A1B2C3" for production
 */
export function generateSheetCodeWithType(sheetType: 'dish' | 'production' = 'dish'): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const prefix = sheetType === 'production' ? 'BP-' : 'FT-';
  let code = prefix;
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
