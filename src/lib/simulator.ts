/**
 * Lógica do Simulador de Cenários
 * 
 * Calcula o impacto de variações de preços de ingredientes
 * em todas as fichas técnicas que os utilizam.
 * 
 * @module lib/simulator
 */

import { TechnicalSheet, Ingredient } from './mock-data';
import {
  calculateIngredientCost,
  calculateTotalCost,
  calculateCostPerUnit,
  calculateSuggestedPrice,
  calculateActualMargin,
} from './calculations';
import { getBusinessSettings, calculateOverheadPerUnit, calculateMonthlyFixedCosts } from './overhead-costs';

export interface SimulationScenario {
  ingredientId: string;
  ingredientName: string;
  priceVariation: number; // Percentual (-50 a +200)
  newPrice: number;
}

export interface ImpactResult {
  sheetId: string;
  sheetName: string;
  sheetCode: string;
  currentCost: number;
  newCost: number;
  costIncrease: number;
  costIncreasePercent: number;
  currentPrice: number;
  newPrice: number;
  priceIncrease: number;
  currentMargin: number;
  newMargin: number;
  marginChange: number;
  isAffected: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SimulationResult {
  scenario: SimulationScenario;
  totalSheetsAffected: number;
  totalCostIncrease: number;
  averageCostIncrease: number;
  averageMarginDecrease: number;
  impacts: ImpactResult[];
  recommendations: string[];
}

/**
 * Simula variação de preço de um ingrediente
 */
export function simulatePriceChange(
  sheets: TechnicalSheet[],
  ingredientId: string,
  priceVariation: number
): SimulationResult {
  // Encontra o ingrediente
  const allIngredients = sheets.flatMap(s => s.ingredients.map(si => si.ingredient));
  const ingredient = allIngredients.find(ing => ing.id === ingredientId);

  if (!ingredient) {
    throw new Error(`Ingrediente ${ingredientId} não encontrado`);
  }

  // Calcula novo preço
  const newPrice = ingredient.unitPrice * (1 + priceVariation / 100);

  const scenario: SimulationScenario = {
    ingredientId,
    ingredientName: ingredient.name,
    priceVariation,
    newPrice,
  };

  // Busca todas as fichas que usam este ingrediente
  const affectedSheets = sheets.filter(sheet =>
    sheet.ingredients.some(si => si.ingredient.id === ingredientId)
  );

  // Calcula impacto em cada ficha
  const impacts: ImpactResult[] = affectedSheets.map(sheet => {
    // Get business settings for overhead calculation
    const settings = getBusinessSettings();
    const monthlyTotal = calculateMonthlyFixedCosts(settings.monthlyOverheadCosts);
    const overheadPerUnit = calculateOverheadPerUnit(monthlyTotal, settings.estimatedMonthlyProduction);
    const effectiveOverhead = sheet.overheadCost || overheadPerUnit;

    // ===== RECALCULATE CURRENT COST (with original prices) =====
    const currentIngredientsCost = sheet.ingredients.reduce((acc, si) => {
      const cost = calculateIngredientCost(
        si.quantity,
        si.unit,
        si.ingredient.unitPrice, // Original price
        si.ingredient.priceUnit,
        si.correctionFactor
      );
      return acc + cost;
    }, 0);

    const currentTotalCost = calculateTotalCost(
      currentIngredientsCost,
      effectiveOverhead,
      sheet.packagingCost,
      sheet.laborCostPerHour,
      sheet.prepTimeMinutes,
      sheet.cookTimeMinutes
    );

    const currentCostPerUnit = calculateCostPerUnit(currentTotalCost, sheet.yieldQuantity);
    const currentSuggestedPrice = sheet.manualPrice || calculateSuggestedPrice(currentCostPerUnit, sheet.targetMargin);
    const currentMargin = calculateActualMargin(currentCostPerUnit, currentSuggestedPrice);

    // ===== RECALCULATE NEW COST (with updated price for target ingredient) =====
    const newIngredientsCost = sheet.ingredients.reduce((acc, si) => {
      const priceToUse = si.ingredient.id === ingredientId ? newPrice : si.ingredient.unitPrice;
      const priceUnitToUse = si.ingredient.priceUnit;
      const cost = calculateIngredientCost(
        si.quantity,
        si.unit,
        priceToUse,
        priceUnitToUse,
        si.correctionFactor
      );
      return acc + cost;
    }, 0);

    const newTotalCost = calculateTotalCost(
      newIngredientsCost,
      effectiveOverhead,
      sheet.packagingCost,
      sheet.laborCostPerHour,
      sheet.prepTimeMinutes,
      sheet.cookTimeMinutes
    );

    const newCostPerUnit = calculateCostPerUnit(newTotalCost, sheet.yieldQuantity);

    // IMPORTANT: For simulation, we want to show:
    // 1. What happens to margin if we KEEP the current price
    // 2. What new price we'd need to MAINTAIN the target margin

    // Calculate new margin IF WE KEEP THE CURRENT PRICE (this is the real impact)
    const newMarginIfKeepPrice = calculateActualMargin(newCostPerUnit, currentSuggestedPrice);

    // Calculate new suggested price to MAINTAIN target margin (for reference)
    const newSuggestedPriceToMaintainMargin = calculateSuggestedPrice(newCostPerUnit, sheet.targetMargin);

    // ===== CALCULATE DIFFERENCES =====
    const costIncrease = newCostPerUnit - currentCostPerUnit;
    const costIncreasePercent = currentCostPerUnit > 0 ? (costIncrease / currentCostPerUnit) * 100 : 0;
    const priceIncrease = newSuggestedPriceToMaintainMargin - currentSuggestedPrice; // How much more we'd need to charge
    const marginChange = newMarginIfKeepPrice - currentMargin; // Actual margin impact

    // Determina severidade based on ACTUAL impact direction
    // If price increased and cost increased, that's the expected bad scenario
    let severity: ImpactResult['severity'] = 'low';
    const absCostPercent = Math.abs(costIncreasePercent);
    const absMarginChange = Math.abs(marginChange);

    if (absCostPercent > 20 || absMarginChange > 10) {
      severity = 'critical';
    } else if (absCostPercent > 10 || absMarginChange > 5) {
      severity = 'high';
    } else if (absCostPercent > 5 || absMarginChange > 2) {
      severity = 'medium';
    }

    return {
      sheetId: sheet.id,
      sheetName: sheet.name,
      sheetCode: sheet.code,
      currentCost: currentCostPerUnit,
      newCost: newCostPerUnit,
      costIncrease,
      costIncreasePercent,
      currentPrice: currentSuggestedPrice,
      newPrice: newSuggestedPriceToMaintainMargin,
      priceIncrease,
      currentMargin: currentMargin,
      newMargin: newMarginIfKeepPrice,
      marginChange,
      isAffected: true,
      severity,
    };
  });

  // Calcula estatísticas gerais
  const totalCostIncrease = impacts.reduce((acc, imp) => acc + imp.costIncrease, 0);
  const averageCostIncrease = impacts.length > 0 ? totalCostIncrease / impacts.length : 0;
  const averageMarginDecrease = impacts.length > 0
    ? impacts.reduce((acc, imp) => acc + imp.marginChange, 0) / impacts.length
    : 0;

  // Gera recomendações
  const recommendations: string[] = [];

  if (priceVariation > 0) {
    recommendations.push(`Preço aumentará em ${priceVariation.toFixed(1)}%`);
  } else {
    recommendations.push(`Preço diminuirá em ${Math.abs(priceVariation).toFixed(1)}%`);
  }

  const criticalSheets = impacts.filter(imp => imp.severity === 'critical');
  if (criticalSheets.length > 0) {
    recommendations.push(
      `${criticalSheets.length} ficha(s) terão impacto crítico (margem reduzida significativamente)`
    );
  }

  const highImpactSheets = impacts.filter(imp => imp.severity === 'high' || imp.severity === 'critical');
  if (highImpactSheets.length > 0) {
    recommendations.push(
      `Considere revisar preços de ${highImpactSheets.length} ficha(s) afetadas`
    );
  }

  if (averageMarginDecrease < -5) {
    recommendations.push('Margem média será reduzida significativamente - considere ajustar preços');
  }

  return {
    scenario,
    totalSheetsAffected: impacts.length,
    totalCostIncrease,
    averageCostIncrease,
    averageMarginDecrease,
    impacts,
    recommendations,
  };
}

/**
 * Encontra ingredientes substitutos similares
 */
export function findSubstituteIngredients(
  targetIngredient: Ingredient,
  allIngredients: Ingredient[]
): Ingredient[] {
  // Filtra ingredientes da mesma categoria
  const sameCategory = allIngredients.filter(
    ing => ing.categoryId === targetIngredient.categoryId && ing.id !== targetIngredient.id
  );

  // Ordena por similaridade de preço (mais próximo primeiro)
  return sameCategory
    .sort((a, b) => {
      const diffA = Math.abs(a.unitPrice - targetIngredient.unitPrice);
      const diffB = Math.abs(b.unitPrice - targetIngredient.unitPrice);
      return diffA - diffB;
    })
    .slice(0, 5); // Top 5 mais similares
}

/**
 * Simula múltiplos cenários
 */
export function simulateMultipleScenarios(
  sheets: TechnicalSheet[],
  scenarios: SimulationScenario[]
): SimulationResult[] {
  return scenarios.map(scenario =>
    simulatePriceChange(sheets, scenario.ingredientId, scenario.priceVariation)
  );
}

