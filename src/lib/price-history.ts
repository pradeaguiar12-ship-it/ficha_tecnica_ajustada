/**
 * Sistema de Histórico de Preços
 * 
 * Gerencia o histórico de preços de ingredientes para análise
 * de tendências e variações de custo.
 * 
 * @module lib/price-history
 */

import { Ingredient } from './mock-data';

// ============================================
// INTERFACES
// ============================================

export interface PriceHistoryEntry {
  id: string;
  ingredientId: string;
  price: number;
  priceUnit: string;
  date: string;
  source?: string; // 'manual' | 'import' | 'api'
  notes?: string;
}

// ============================================
// STORAGE KEYS
// ============================================

const STORAGE_KEY = 'meu-chef-price-history';

// ============================================
// FUNÇÕES DE STORAGE
// ============================================

/**
 * Retorna todo o histórico de preços
 */
export function getPriceHistory(): PriceHistoryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as PriceHistoryEntry[];
  } catch (error) {
    console.error('[PriceHistory] Erro ao ler histórico:', error);
    return [];
  }
}

/**
 * Salva histórico completo
 */
function savePriceHistory(history: PriceHistoryEntry[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error('[PriceHistory] Erro ao salvar histórico:', error);
    return false;
  }
}

/**
 * Retorna histórico de um ingrediente específico
 */
export function getIngredientPriceHistory(ingredientId: string): PriceHistoryEntry[] {
  const history = getPriceHistory();
  return history
    .filter((entry) => entry.ingredientId === ingredientId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Adiciona uma entrada ao histórico
 */
export function addPriceHistoryEntry(
  ingredientId: string,
  price: number,
  priceUnit: string,
  source: PriceHistoryEntry['source'] = 'manual',
  notes?: string
): boolean {
  const history = getPriceHistory();
  
  const newEntry: PriceHistoryEntry = {
    id: `ph-${Date.now()}`,
    ingredientId,
    price,
    priceUnit,
    date: new Date().toISOString().split('T')[0],
    source,
    notes,
  };

  history.unshift(newEntry);
  
  // Limita a 1000 entradas por ingrediente (evita storage overflow)
  const ingredientEntries = history.filter((e) => e.ingredientId === ingredientId);
  if (ingredientEntries.length > 1000) {
    const toKeep = ingredientEntries.slice(0, 1000);
    const toRemove = ingredientEntries.slice(1000);
    const otherEntries = history.filter((e) => e.ingredientId !== ingredientId);
    return savePriceHistory([...otherEntries, ...toKeep]);
  }

  return savePriceHistory(history);
}

/**
 * Atualiza preço de ingrediente e registra no histórico
 */
export function updateIngredientPrice(
  ingredient: Ingredient,
  newPrice: number,
  notes?: string
): void {
  // Só registra se o preço mudou
  if (ingredient.unitPrice !== newPrice) {
    addPriceHistoryEntry(
      ingredient.id,
      ingredient.unitPrice, // Preço antigo
      ingredient.priceUnit,
      'manual',
      notes || 'Preço atualizado'
    );
  }
}

/**
 * Retorna variação de preço em percentual
 */
export function getPriceVariation(
  ingredientId: string,
  days: number = 30
): { variation: number; trend: 'up' | 'down' | 'stable'; entries: PriceHistoryEntry[] } {
  const history = getIngredientPriceHistory(ingredientId);
  
  if (history.length < 2) {
    return { variation: 0, trend: 'stable', entries: history };
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentEntries = history.filter(
    (entry) => new Date(entry.date) >= cutoffDate
  );

  if (recentEntries.length < 2) {
    return { variation: 0, trend: 'stable', entries: history };
  }

  const oldest = recentEntries[recentEntries.length - 1];
  const newest = recentEntries[0];

  const variation = ((newest.price - oldest.price) / oldest.price) * 100;
  const trend = variation > 1 ? 'up' : variation < -1 ? 'down' : 'stable';

  return { variation: Math.round(variation * 10) / 10, trend, entries: recentEntries };
}

/**
 * Retorna preço médio em um período
 */
export function getAveragePrice(
  ingredientId: string,
  days: number = 30
): number | null {
  const history = getIngredientPriceHistory(ingredientId);
  
  if (history.length === 0) return null;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentEntries = history.filter(
    (entry) => new Date(entry.date) >= cutoffDate
  );

  if (recentEntries.length === 0) return null;

  const sum = recentEntries.reduce((acc, entry) => acc + entry.price, 0);
  return sum / recentEntries.length;
}

/**
 * Retorna preço mais alto e mais baixo
 */
export function getPriceRange(ingredientId: string): {
  min: number;
  max: number;
  minDate: string;
  maxDate: string;
} | null {
  const history = getIngredientPriceHistory(ingredientId);
  
  if (history.length === 0) return null;

  const prices = history.map((entry) => ({
    price: entry.price,
    date: entry.date,
  }));

  const min = Math.min(...prices.map((p) => p.price));
  const max = Math.max(...prices.map((p) => p.price));

  const minEntry = prices.find((p) => p.price === min);
  const maxEntry = prices.find((p) => p.price === max);

  return {
    min,
    max,
    minDate: minEntry?.date || '',
    maxDate: maxEntry?.date || '',
  };
}

/**
 * Limpa histórico antigo (mais de X dias)
 */
export function cleanOldHistory(daysToKeep: number = 365): number {
  const history = getPriceHistory();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const filtered = history.filter(
    (entry) => new Date(entry.date) >= cutoffDate
  );

  const removed = history.length - filtered.length;
  savePriceHistory(filtered);

  return removed;
}

/**
 * Exporta histórico para backup
 */
export function exportPriceHistory(): string {
  const history = getPriceHistory();
  return JSON.stringify(history, null, 2);
}

/**
 * Importa histórico de backup
 */
export function importPriceHistory(jsonString: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!Array.isArray(data)) {
      return { success: false, message: 'Formato de backup inválido' };
    }

    // Valida estrutura
    const valid = data.every(
      (entry) =>
        entry.id &&
        entry.ingredientId &&
        typeof entry.price === 'number' &&
        entry.date
    );

    if (!valid) {
      return { success: false, message: 'Dados de histórico inválidos' };
    }

    savePriceHistory(data);
    return { success: true, message: `${data.length} entradas importadas com sucesso` };
  } catch (error) {
    console.error('[PriceHistory] Erro ao importar:', error);
    return { success: false, message: 'Erro ao processar arquivo de backup' };
  }
}

