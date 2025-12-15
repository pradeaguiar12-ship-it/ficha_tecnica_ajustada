/**
 * Sistema de Persistência de Dados
 * 
 * Usa localStorage para persistir dados localmente.
 * Preparado para migração para API no futuro.
 * 
 * @module storage
 */

import { TechnicalSheet, Ingredient, mockSheets, mockIngredients } from './mock-data';
import { BusinessSettings, defaultBusinessSettings } from './overhead-costs';

// Chaves de armazenamento
const STORAGE_KEYS = {
  SHEETS: 'meu-chef-sheets',
  USER_INGREDIENTS: 'meu-chef-user-ingredients',
  SETTINGS: 'meu-chef-business-settings',
  INITIALIZED: 'meu-chef-initialized',
  VERSION: 'meu-chef-version',
} as const;

// Versão atual do schema de dados
const CURRENT_VERSION = '1.0.0';

// ============================================
// HELPERS GENÉRICOS
// ============================================

/**
 * Recupera item do localStorage com fallback
 */
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`[Storage] Erro ao ler ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Salva item no localStorage
 */
function setItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[Storage] Erro ao salvar ${key}:`, error);
    // Verifica se é erro de quota excedida
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('[Storage] Quota de armazenamento excedida!');
    }
    return false;
  }
}

/**
 * Remove item do localStorage
 */
function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`[Storage] Erro ao remover ${key}:`, error);
  }
}

// ============================================
// FICHAS TÉCNICAS
// ============================================

export const sheetsStorage = {
  /**
   * Retorna todas as fichas técnicas
   */
  getAll(): TechnicalSheet[] {
    return getItem<TechnicalSheet[]>(STORAGE_KEYS.SHEETS, []);
  },

  /**
   * Salva todas as fichas (sobrescreve)
   */
  saveAll(sheets: TechnicalSheet[]): boolean {
    return setItem(STORAGE_KEYS.SHEETS, sheets);
  },

  /**
   * Retorna uma ficha por ID
   */
  getById(id: string): TechnicalSheet | undefined {
    const sheets = this.getAll();
    return sheets.find(s => s.id === id);
  },

  /**
   * Adiciona uma nova ficha
   */
  add(sheet: TechnicalSheet): boolean {
    const sheets = this.getAll();
    sheets.unshift(sheet); // Adiciona no início
    return this.saveAll(sheets);
  },

  /**
   * Atualiza uma ficha existente
   */
  update(id: string, data: Partial<TechnicalSheet>): boolean {
    const sheets = this.getAll();
    const index = sheets.findIndex(s => s.id === id);
    
    if (index === -1) {
      console.error(`[Storage] Ficha ${id} não encontrada para atualização`);
      return false;
    }

    sheets[index] = {
      ...sheets[index],
      ...data,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    return this.saveAll(sheets);
  },

  /**
   * Remove uma ficha
   */
  delete(id: string): boolean {
    const sheets = this.getAll().filter(s => s.id !== id);
    return this.saveAll(sheets);
  },

  /**
   * Duplica uma ficha existente
   */
  duplicate(id: string, newId: string, newCode: string): TechnicalSheet | null {
    const original = this.getById(id);
    if (!original) return null;

    const now = new Date().toISOString().split('T')[0];
    const duplicated: TechnicalSheet = {
      ...original,
      id: newId,
      code: newCode,
      name: `${original.name} (Cópia)`,
      status: 'DRAFT',
      createdAt: now,
      updatedAt: now,
    };

    if (this.add(duplicated)) {
      return duplicated;
    }
    return null;
  },

  /**
   * Retorna quantidade de fichas
   */
  count(): number {
    return this.getAll().length;
  },
};

// ============================================
// INGREDIENTES DO USUÁRIO
// ============================================

export const userIngredientsStorage = {
  /**
   * Retorna todos os ingredientes customizados do usuário
   */
  getAll(): Ingredient[] {
    return getItem<Ingredient[]>(STORAGE_KEYS.USER_INGREDIENTS, []);
  },

  /**
   * Salva todos os ingredientes (sobrescreve)
   */
  saveAll(ingredients: Ingredient[]): boolean {
    return setItem(STORAGE_KEYS.USER_INGREDIENTS, ingredients);
  },

  /**
   * Retorna um ingrediente por ID
   */
  getById(id: string): Ingredient | undefined {
    return this.getAll().find(i => i.id === id);
  },

  /**
   * Adiciona um novo ingrediente
   */
  add(ingredient: Ingredient): boolean {
    const ingredients = this.getAll();
    ingredients.push(ingredient);
    return this.saveAll(ingredients);
  },

  /**
   * Atualiza um ingrediente existente
   */
  update(id: string, data: Partial<Ingredient>): boolean {
    const ingredients = this.getAll();
    const index = ingredients.findIndex(i => i.id === id);
    
    if (index === -1) return false;

    ingredients[index] = {
      ...ingredients[index],
      ...data,
      lastPriceUpdate: new Date().toISOString().split('T')[0],
    };

    return this.saveAll(ingredients);
  },

  /**
   * Remove um ingrediente
   */
  delete(id: string): boolean {
    const ingredients = this.getAll().filter(i => i.id !== id);
    return this.saveAll(ingredients);
  },

  /**
   * Retorna quantidade de ingredientes customizados
   */
  count(): number {
    return this.getAll().length;
  },
};

// ============================================
// INGREDIENTES (SISTEMA + USUÁRIO COMBINADOS)
// ============================================

export const ingredientsStorage = {
  /**
   * Retorna todos os ingredientes (sistema + usuário)
   */
  getAll(): Ingredient[] {
    const systemIngredients = mockIngredients;
    const customIngredients = userIngredientsStorage.getAll();
    return [...systemIngredients, ...customIngredients];
  },

  /**
   * Retorna apenas ingredientes do sistema
   */
  getSystem(): Ingredient[] {
    return mockIngredients;
  },

  /**
   * Retorna apenas ingredientes do usuário
   */
  getUser(): Ingredient[] {
    return userIngredientsStorage.getAll();
  },

  /**
   * Busca ingrediente por ID (sistema ou usuário)
   */
  getById(id: string): Ingredient | undefined {
    // Primeiro busca no sistema
    const systemIng = mockIngredients.find(i => i.id === id);
    if (systemIng) return systemIng;

    // Depois nos customizados
    return userIngredientsStorage.getById(id);
  },
};

// ============================================
// CONFIGURAÇÕES DO NEGÓCIO
// ============================================

export const settingsStorage = {
  /**
   * Retorna as configurações salvas
   */
  get(): BusinessSettings {
    return getItem<BusinessSettings>(STORAGE_KEYS.SETTINGS, defaultBusinessSettings);
  },

  /**
   * Salva as configurações
   */
  save(settings: BusinessSettings): boolean {
    return setItem(STORAGE_KEYS.SETTINGS, settings);
  },

  /**
   * Atualiza parcialmente as configurações
   */
  update(data: Partial<BusinessSettings>): boolean {
    const current = this.get();
    return this.save({ ...current, ...data });
  },

  /**
   * Reseta para configurações padrão
   */
  reset(): boolean {
    return this.save(defaultBusinessSettings);
  },
};

// ============================================
// INICIALIZAÇÃO E UTILITÁRIOS
// ============================================

/**
 * Verifica se é a primeira vez que o app é usado
 * e inicializa com dados de exemplo se necessário
 */
export function initializeStorage(): void {
  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  const storedVersion = localStorage.getItem(STORAGE_KEYS.VERSION);

  // Se nunca foi inicializado ou versão mudou
  if (!isInitialized || storedVersion !== CURRENT_VERSION) {
    console.log('[Storage] Inicializando storage com dados de exemplo...');
    
    // Inicializa fichas com dados mock apenas se estiver vazio
    if (sheetsStorage.getAll().length === 0) {
      sheetsStorage.saveAll(mockSheets);
      console.log(`[Storage] ${mockSheets.length} fichas de exemplo carregadas`);
    }

    // Marca como inicializado
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
    
    console.log('[Storage] Inicialização concluída!');
  } else {
    console.log('[Storage] Storage já inicializado');
  }
}

/**
 * Limpa todos os dados do storage (para debug/reset)
 */
export function clearAllStorage(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeItem(key);
  });
  console.log('[Storage] Todos os dados foram limpos');
}

/**
 * Exporta todos os dados para backup (JSON)
 */
export function exportAllData(): string {
  const data = {
    version: CURRENT_VERSION,
    exportedAt: new Date().toISOString(),
    sheets: sheetsStorage.getAll(),
    userIngredients: userIngredientsStorage.getAll(),
    settings: settingsStorage.get(),
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Importa dados de um backup
 */
export function importData(jsonString: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString);
    
    if (!data.version) {
      return { success: false, message: 'Arquivo de backup inválido: versão não encontrada' };
    }

    let imported = 0;

    if (data.sheets && Array.isArray(data.sheets)) {
      sheetsStorage.saveAll(data.sheets);
      imported += data.sheets.length;
    }
    
    if (data.userIngredients && Array.isArray(data.userIngredients)) {
      userIngredientsStorage.saveAll(data.userIngredients);
      imported += data.userIngredients.length;
    }
    
    if (data.settings) {
      settingsStorage.save(data.settings);
    }
    
    return { 
      success: true, 
      message: `Importação concluída! ${imported} itens restaurados.` 
    };
  } catch (error) {
    console.error('[Storage] Erro ao importar dados:', error);
    return { 
      success: false, 
      message: 'Erro ao processar arquivo de backup. Verifique se o formato está correto.' 
    };
  }
}

/**
 * Retorna estatísticas do storage
 */
export function getStorageStats(): {
  sheetsCount: number;
  userIngredientsCount: number;
  systemIngredientsCount: number;
  estimatedSize: string;
} {
  const sheets = sheetsStorage.getAll();
  const userIngredients = userIngredientsStorage.getAll();
  
  // Estima o tamanho em bytes
  const dataString = JSON.stringify({
    sheets,
    userIngredients,
    settings: settingsStorage.get(),
  });
  const sizeInBytes = new Blob([dataString]).size;
  const sizeFormatted = sizeInBytes < 1024 
    ? `${sizeInBytes} bytes`
    : `${(sizeInBytes / 1024).toFixed(2)} KB`;

  return {
    sheetsCount: sheets.length,
    userIngredientsCount: userIngredients.length,
    systemIngredientsCount: mockIngredients.length,
    estimatedSize: sizeFormatted,
  };
}

