/**
 * Schemas de Validação com Zod
 * 
 * Define schemas para validação de formulários de fichas técnicas,
 * ingredientes e configurações de custos.
 * 
 * @module lib/validations
 */

import { z } from 'zod';

// ============================================
// SCHEMAS DE FICHA TÉCNICA
// ============================================

export const sheetFormSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome não pode ter mais de 100 caracteres')
    .trim(),
  
  description: z
    .string()
    .max(500, 'Descrição não pode ter mais de 500 caracteres')
    .optional()
    .or(z.literal('')),
  
  categoryId: z
    .string()
    .min(1, 'Selecione uma categoria'),
  
  yieldQuantity: z
    .number()
    .min(1, 'Rendimento deve ser maior que zero')
    .max(10000, 'Rendimento não pode ser maior que 10.000'),
  
  yieldUnit: z
    .string()
    .min(1, 'Selecione uma unidade'),
  
  prepTimeMinutes: z
    .number()
    .min(0, 'Tempo de preparo não pode ser negativo')
    .max(1440, 'Tempo de preparo não pode ser maior que 24 horas'),
  
  cookTimeMinutes: z
    .number()
    .min(0, 'Tempo de cozimento não pode ser negativo')
    .max(1440, 'Tempo de cozimento não pode ser maior que 24 horas'),
  
  restTimeMinutes: z
    .number()
    .min(0, 'Tempo de descanso não pode ser negativo')
    .max(1440, 'Tempo de descanso não pode ser maior que 24 horas'),
  
  instructions: z
    .string()
    .max(5000, 'Instruções não podem ter mais de 5.000 caracteres')
    .optional()
    .or(z.literal('')),
  
  tips: z
    .string()
    .max(1000, 'Dicas não podem ter mais de 1.000 caracteres')
    .optional()
    .or(z.literal('')),
  
  useGlobalOverhead: z.boolean(),
  
  overheadCost: z
    .number()
    .min(0, 'Custo de overhead não pode ser negativo')
    .max(10000, 'Custo de overhead muito alto'),
  
  packagingCost: z
    .number()
    .min(0, 'Custo de embalagem não pode ser negativo')
    .max(1000, 'Custo de embalagem muito alto'),
  
  laborCostPerHour: z
    .number()
    .min(0, 'Custo de mão de obra não pode ser negativo')
    .max(1000, 'Custo de mão de obra muito alto'),
  
  targetMargin: z
    .number()
    .min(0, 'Margem não pode ser negativa')
    .max(100, 'Margem não pode ser maior que 100%'),
  
  useManualPrice: z.boolean(),
  
  manualPrice: z
    .number()
    .min(0, 'Preço manual não pode ser negativo')
    .max(10000, 'Preço manual muito alto')
    .optional(),
});

export type SheetFormData = z.infer<typeof sheetFormSchema>;

// Schema para validação de ingredientes da receita
export const recipeIngredientSchema = z.object({
  id: z.string(),
  ingredientId: z.string().min(1, 'Ingrediente é obrigatório'),
  quantity: z
    .number()
    .min(0.01, 'Quantidade deve ser maior que zero')
    .max(100000, 'Quantidade muito alta'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  correctionFactor: z
    .number()
    .min(1, 'Fator de correção deve ser no mínimo 1')
    .max(5, 'Fator de correção muito alto'),
});

export const sheetIngredientsSchema = z
  .array(recipeIngredientSchema)
  .min(1, 'Adicione pelo menos um ingrediente');

// ============================================
// SCHEMAS DE INGREDIENTE
// ============================================

export const ingredientFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome não pode ter mais de 100 caracteres')
    .trim(),
  
  description: z
    .string()
    .max(500, 'Descrição não pode ter mais de 500 caracteres')
    .optional()
    .or(z.literal('')),
  
  categoryId: z
    .string()
    .min(1, 'Selecione uma categoria'),
  
  unitPrice: z
    .number()
    .min(0.01, 'Preço deve ser maior que zero')
    .max(100000, 'Preço muito alto'),
  
  priceUnit: z
    .string()
    .min(1, 'Selecione uma unidade de preço'),
  
  defaultCorrection: z
    .number()
    .min(1, 'Fator de correção deve ser no mínimo 1')
    .max(3, 'Fator de correção não pode ser maior que 3'),
  
  supplier: z
    .string()
    .max(200, 'Nome do fornecedor não pode ter mais de 200 caracteres')
    .optional()
    .or(z.literal('')),
});

export type IngredientFormData = z.infer<typeof ingredientFormSchema>;

// ============================================
// SCHEMAS DE CONFIGURAÇÕES DE CUSTOS
// ============================================

export const overheadCostSchema = z.object({
  rent: z.number().min(0).max(100000),
  utilities: z.number().min(0).max(100000),
  insurance: z.number().min(0).max(100000),
  licenses: z.number().min(0).max(100000),
  accounting: z.number().min(0).max(100000),
  marketing: z.number().min(0).max(100000),
  equipment: z.number().min(0).max(100000),
  maintenance: z.number().min(0).max(100000),
  other: z.number().min(0).max(100000),
});

export const businessSettingsSchema = z.object({
  monthlyOverheadCosts: overheadCostSchema,
  estimatedMonthlyProduction: z
    .number()
    .min(1, 'Produção mensal deve ser maior que zero')
    .max(1000000, 'Produção mensal muito alta'),
  taxRate: z
    .number()
    .min(0, 'Taxa de impostos não pode ser negativa')
    .max(100, 'Taxa de impostos não pode ser maior que 100%'),
});

export type BusinessSettingsFormData = z.infer<typeof businessSettingsSchema>;

// ============================================
// VALIDAÇÕES CUSTOMIZADAS
// ============================================

/**
 * Valida se pelo menos um ingrediente foi adicionado
 */
export function validateHasIngredients(ingredients: unknown[]): boolean {
  return ingredients.length > 0;
}

/**
 * Valida se o tempo total não excede 24 horas
 */
export function validateTotalTime(
  prep: number,
  cook: number,
  rest: number
): { valid: boolean; error?: string } {
  const total = prep + cook + rest;
  if (total > 1440) {
    return {
      valid: false,
      error: 'Tempo total não pode exceder 24 horas (1440 minutos)',
    };
  }
  return { valid: true };
}

/**
 * Valida se a margem está em um range razoável
 */
export function validateMargin(margin: number): { valid: boolean; error?: string } {
  if (margin < 0) {
    return { valid: false, error: 'Margem não pode ser negativa' };
  }
  if (margin > 100) {
    return { valid: false, error: 'Margem não pode ser maior que 100%' };
  }
  if (margin < 10) {
    return {
      valid: true,
      error: 'Atenção: Margem abaixo de 10% pode não ser sustentável',
    };
  }
  return { valid: true };
}

// ============================================
// HELPERS DE VALIDAÇÃO
// ============================================

/**
 * Valida um formulário e retorna erros formatados
 */
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: boolean; data?: T; errors?: Record<string, string> } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _form: 'Erro de validação desconhecido' } };
  }
}

/**
 * Valida um campo específico
 */
export function validateField<T>(
  schema: z.ZodSchema<T>,
  fieldName: string,
  value: unknown
): { valid: boolean; error?: string } {
  try {
    const fieldSchema = (schema as any).shape?.[fieldName];
    if (fieldSchema) {
      fieldSchema.parse(value);
      return { valid: true };
    }
    return { valid: true }; // Campo não encontrado, assume válido
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0]?.message };
    }
    return { valid: false, error: 'Erro de validação' };
  }
}

