/**
 * Sistema de Feature Flags
 * 
 * Define features disponíveis e mapeia para planos de assinatura.
 * Controla acesso a funcionalidades baseado no plano do usuário.
 * 
 * @module lib/features
 */

export const FEATURES = {
  // Funcionalidades básicas
  EXPORT_PDF: 'export_pdf',
  CUSTOM_INGREDIENTS: 'custom_ingredients',
  
  // Funcionalidades avançadas
  PRICE_HISTORY: 'price_history',
  SIMULATOR: 'simulator',
  ANALYTICS: 'analytics',
  UNLIMITED_SHEETS: 'unlimited_sheets',
  
  // Funcionalidades premium
  BULK_IMPORT: 'bulk_import',
  API_ACCESS: 'api_access',
  WHITE_LABEL: 'white_label',
  PRIORITY_SUPPORT: 'priority_support',
} as const;

export type Feature = typeof FEATURES[keyof typeof FEATURES];

export type PlanType = 'free' | 'basic' | 'pro' | 'enterprise';

/**
 * Mapeamento de planos para features
 */
export const PLAN_FEATURES: Record<PlanType, Feature[]> = {
  free: [
    // Plano gratuito: funcionalidades básicas limitadas
    FEATURES.CUSTOM_INGREDIENTS,
  ],
  basic: [
    FEATURES.EXPORT_PDF,
    FEATURES.CUSTOM_INGREDIENTS,
    FEATURES.PRICE_HISTORY,
  ],
  pro: [
    FEATURES.EXPORT_PDF,
    FEATURES.PRICE_HISTORY,
    FEATURES.SIMULATOR,
    FEATURES.ANALYTICS,
    FEATURES.CUSTOM_INGREDIENTS,
    FEATURES.UNLIMITED_SHEETS,
  ],
  enterprise: [
    // Enterprise: todas as features
    ...Object.values(FEATURES),
  ],
};

/**
 * Limites por plano
 */
export const PLAN_LIMITS: Record<PlanType, {
  maxSheets: number;
  maxCustomIngredients: number;
  maxStorageMB: number;
}> = {
  free: {
    maxSheets: 5,
    maxCustomIngredients: 10,
    maxStorageMB: 10,
  },
  basic: {
    maxSheets: 50,
    maxCustomIngredients: 100,
    maxStorageMB: 100,
  },
  pro: {
    maxSheets: -1, // Ilimitado
    maxCustomIngredients: -1, // Ilimitado
    maxStorageMB: 500,
  },
  enterprise: {
    maxSheets: -1,
    maxCustomIngredients: -1,
    maxStorageMB: -1,
  },
};

/**
 * Verifica se uma feature está disponível no plano
 */
export function hasFeature(plan: PlanType | null, feature: Feature): boolean {
  if (!plan) return false;
  return PLAN_FEATURES[plan]?.includes(feature) ?? false;
}

/**
 * Retorna todas as features de um plano
 */
export function getPlanFeatures(plan: PlanType | null): Feature[] {
  if (!plan) return PLAN_FEATURES.free;
  return PLAN_FEATURES[plan] ?? [];
}

/**
 * Retorna limites de um plano
 */
export function getPlanLimits(plan: PlanType | null) {
  if (!plan) return PLAN_LIMITS.free;
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}

/**
 * Verifica se o limite de fichas foi atingido
 */
export function checkSheetLimit(plan: PlanType | null, currentCount: number): boolean {
  const limits = getPlanLimits(plan);
  if (limits.maxSheets === -1) return true; // Ilimitado
  return currentCount < limits.maxSheets;
}

/**
 * Verifica se o limite de ingredientes foi atingido
 */
export function checkIngredientLimit(plan: PlanType | null, currentCount: number): boolean {
  const limits = getPlanLimits(plan);
  if (limits.maxCustomIngredients === -1) return true; // Ilimitado
  return currentCount < limits.maxCustomIngredients;
}

