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
    // Recalcula custos com novo preço
    const updatedIngredients = sheet.ingredients.map(si => {
      if (si.ingredient.id === ingredientId) {
        const updatedIngredient = { ...si.ingredient, unitPrice: newPrice };
        const newCost = calculateIngredientCost(
          si.quantity,
          si.unit,
          newPrice,
          updatedIngredient.priceUnit,
          si.correctionFactor
        );
        return { ...si, ingredient: updatedIngredient, calculatedCost: newCost };
      }
      return si;
    });

    const newIngredientsCost = updatedIngredients.reduce((acc, si) => acc + si.calculatedCost, 0);
    
    const settings = getBusinessSettings();
    const monthlyTotal = calculateMonthlyFixedCosts(settings.monthlyOverheadCosts);
    const overheadPerUnit = calculateOverheadPerUnit(monthlyTotal, settings.estimatedMonthlyProduction);
    
    const effectiveOverhead = sheet.overheadCost || overheadPerUnit;
    
    const newTotalCost = calculateTotalCost(
      newIngredientsCost,
      effectiveOverhead,
      sheet.packagingCost,
      sheet.laborCostPerHour,
      sheet.prepTimeMinutes,
      sheet.cookTimeMinutes
    );

    const newCostPerUnit = calculateCostPerUnit(newTotalCost, sheet.yieldQuantity);
    const newSuggestedPrice = sheet.manualPrice || calculateSuggestedPrice(newCostPerUnit, sheet.targetMargin);
    const newMargin = calculateActualMargin(newCostPerUnit, newSuggestedPrice);

    const costIncrease = newCostPerUnit - sheet.costPerUnit;
    const costIncreasePercent = (costIncrease / sheet.costPerUnit) * 100;
    const priceIncrease = newSuggestedPrice - sheet.suggestedPrice;
    const marginChange = newMargin - sheet.actualMargin;

    // Determina severidade
    let severity: ImpactResult['severity'] = 'low';
    if (costIncreasePercent > 20 || marginChange < -10) {
      severity = 'critical';
    } else if (costIncreasePercent > 10 || marginChange < -5) {
      severity = 'high';
    } else if (costIncreasePercent > 5 || marginChange < -2) {
      severity = 'medium';
    }

    return {
      sheetId: sheet.id,
      sheetName: sheet.name,
      sheetCode: sheet.code,
      currentCost: sheet.costPerUnit,
      newCost: newCostPerUnit,
      costIncrease,
      costIncreasePercent,
      currentPrice: sheet.suggestedPrice,
      newPrice: newSuggestedPrice,
      priceIncrease,
      currentMargin: sheet.actualMargin,
      newMargin,
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

