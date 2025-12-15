# FASE 2: PERSISTÊNCIA DE DADOS
## Instruções Detalhadas de Implementação

**Tempo estimado**: 5-7 dias  
**Prioridade**: 🔴 URGENTE  
**Pré-requisitos**: Fase 1 concluída

---

## OBJETIVO

Implementar sistema de persistência de dados usando localStorage, preparado para migração futura para API.

---

## TAREFA 2.1: Criar Sistema de Storage

### Criar arquivo: `src/lib/storage.ts`

```typescript
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
} as const;

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
    console.error(`Erro ao ler ${key} do localStorage:`, error);
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
    console.error(`Erro ao salvar ${key} no localStorage:`, error);
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
    console.error(`Erro ao remover ${key} do localStorage:`, error);
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
      console.error(`Ficha ${id} não encontrada para atualização`);
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
  duplicate(id: string, newCode: string): TechnicalSheet | null {
    const original = this.getById(id);
    if (!original) return null;

    const now = new Date().toISOString().split('T')[0];
    const duplicated: TechnicalSheet = {
      ...original,
      id: `sheet-${Date.now()}`,
      code: newCode,
      name: `${original.name} (Cópia)`,
      status: 'DRAFT',
      createdAt: now,
      updatedAt: now,
    };

    this.add(duplicated);
    return duplicated;
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
// INGREDIENTES (SISTEMA + USUÁRIO)
// ============================================

export const ingredientsStorage = {
  /**
   * Retorna todos os ingredientes (sistema + usuário)
   */
  getAll(): Ingredient[] {
    const systemIngredients = mockIngredients;
    const userIngredients = userIngredientsStorage.getAll();
    return [...systemIngredients, ...userIngredients];
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
// INICIALIZAÇÃO
// ============================================

/**
 * Verifica se é a primeira vez que o app é usado
 * e inicializa com dados de exemplo se necessário
 */
export function initializeStorage(): void {
  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);

  if (!isInitialized) {
    console.log('Inicializando storage com dados de exemplo...');
    
    // Inicializa fichas com dados mock
    if (sheetsStorage.getAll().length === 0) {
      sheetsStorage.saveAll(mockSheets);
    }

    // Marca como inicializado
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    
    console.log('Storage inicializado com sucesso!');
  }
}

/**
 * Limpa todos os dados do storage (para debug/reset)
 */
export function clearAllStorage(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeItem(key);
  });
  console.log('Storage limpo com sucesso!');
}

/**
 * Exporta todos os dados para backup
 */
export function exportAllData(): string {
  const data = {
    sheets: sheetsStorage.getAll(),
    userIngredients: userIngredientsStorage.getAll(),
    settings: settingsStorage.get(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Importa dados de um backup
 */
export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    
    if (data.sheets) {
      sheetsStorage.saveAll(data.sheets);
    }
    if (data.userIngredients) {
      userIngredientsStorage.saveAll(data.userIngredients);
    }
    if (data.settings) {
      settingsStorage.save(data.settings);
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao importar dados:', error);
    return false;
  }
}
```

---

## TAREFA 2.2: Criar Hook useSheets

### Criar arquivo: `src/hooks/useSheets.ts`

```typescript
/**
 * Hook para gerenciamento de Fichas Técnicas
 * 
 * Abstrai a lógica de CRUD e fornece estado reativo
 * 
 * @module hooks/useSheets
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { TechnicalSheet } from '@/lib/mock-data';
import { sheetsStorage } from '@/lib/storage';
import { generateSheetCode } from '@/lib/calculations';

interface UseSheetsReturn {
  // Estado
  sheets: TechnicalSheet[];
  isLoading: boolean;
  error: string | null;
  
  // Ações
  createSheet: (data: CreateSheetData) => TechnicalSheet;
  updateSheet: (id: string, data: Partial<TechnicalSheet>) => boolean;
  deleteSheet: (id: string) => boolean;
  duplicateSheet: (id: string) => TechnicalSheet | null;
  
  // Consultas
  getSheetById: (id: string) => TechnicalSheet | undefined;
  
  // Estatísticas
  stats: SheetStats;
  
  // Utilitários
  refresh: () => void;
}

interface CreateSheetData {
  name: string;
  description?: string;
  categoryId: string;
  yieldQuantity: number;
  yieldUnit: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  restTimeMinutes: number;
  instructions?: string;
  tips?: string;
  overheadCost: number;
  packagingCost: number;
  laborCostPerHour: number;
  targetMargin: number;
  manualPrice?: number;
  totalIngredientCost: number;
  totalCost: number;
  costPerUnit: number;
  suggestedPrice: number;
  actualMargin: number;
  ingredients: TechnicalSheet['ingredients'];
  status?: TechnicalSheet['status'];
}

interface SheetStats {
  total: number;
  active: number;
  draft: number;
  archived: number;
  avgMargin: number;
}

export function useSheets(): UseSheetsReturn {
  const [sheets, setSheets] = useState<TechnicalSheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega dados iniciais
  useEffect(() => {
    try {
      const data = sheetsStorage.getAll();
      setSheets(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar fichas técnicas');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Recarrega dados
  const refresh = useCallback(() => {
    setIsLoading(true);
    try {
      const data = sheetsStorage.getAll();
      setSheets(data);
      setError(null);
    } catch (err) {
      setError('Erro ao recarregar dados');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Criar ficha
  const createSheet = useCallback((data: CreateSheetData): TechnicalSheet => {
    const now = new Date().toISOString().split('T')[0];
    
    const newSheet: TechnicalSheet = {
      ...data,
      id: `sheet-${Date.now()}`,
      userId: 'current-user', // Será substituído pelo contexto do usuário
      code: generateSheetCode(),
      status: data.status || 'DRAFT',
      isPublic: false,
      createdAt: now,
      updatedAt: now,
    };

    sheetsStorage.add(newSheet);
    setSheets(prev => [newSheet, ...prev]);
    
    return newSheet;
  }, []);

  // Atualizar ficha
  const updateSheet = useCallback((id: string, data: Partial<TechnicalSheet>): boolean => {
    const success = sheetsStorage.update(id, data);
    
    if (success) {
      setSheets(prev => prev.map(s => 
        s.id === id 
          ? { ...s, ...data, updatedAt: new Date().toISOString().split('T')[0] }
          : s
      ));
    }
    
    return success;
  }, []);

  // Excluir ficha
  const deleteSheet = useCallback((id: string): boolean => {
    const success = sheetsStorage.delete(id);
    
    if (success) {
      setSheets(prev => prev.filter(s => s.id !== id));
    }
    
    return success;
  }, []);

  // Duplicar ficha
  const duplicateSheet = useCallback((id: string): TechnicalSheet | null => {
    const newCode = generateSheetCode();
    const duplicated = sheetsStorage.duplicate(id, newCode);
    
    if (duplicated) {
      setSheets(prev => [duplicated, ...prev]);
    }
    
    return duplicated;
  }, []);

  // Buscar por ID
  const getSheetById = useCallback((id: string): TechnicalSheet | undefined => {
    return sheets.find(s => s.id === id);
  }, [sheets]);

  // Estatísticas
  const stats = useMemo((): SheetStats => {
    const total = sheets.length;
    const active = sheets.filter(s => s.status === 'ACTIVE').length;
    const draft = sheets.filter(s => s.status === 'DRAFT').length;
    const archived = sheets.filter(s => s.status === 'ARCHIVED').length;
    const avgMargin = total > 0
      ? sheets.reduce((acc, s) => acc + s.actualMargin, 0) / total
      : 0;

    return { total, active, draft, archived, avgMargin };
  }, [sheets]);

  return {
    sheets,
    isLoading,
    error,
    createSheet,
    updateSheet,
    deleteSheet,
    duplicateSheet,
    getSheetById,
    stats,
    refresh,
  };
}
```

---

## TAREFA 2.3: Criar Hook useIngredients

### Criar arquivo: `src/hooks/useIngredients.ts`

```typescript
/**
 * Hook para gerenciamento de Ingredientes
 * 
 * @module hooks/useIngredients
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Ingredient, mockIngredients, ingredientCategories } from '@/lib/mock-data';
import { userIngredientsStorage, ingredientsStorage } from '@/lib/storage';

interface UseIngredientsReturn {
  // Estado
  allIngredients: Ingredient[];
  systemIngredients: Ingredient[];
  userIngredients: Ingredient[];
  isLoading: boolean;
  
  // Ações (apenas para ingredientes do usuário)
  createIngredient: (data: CreateIngredientData) => Ingredient;
  updateIngredient: (id: string, data: Partial<Ingredient>) => boolean;
  deleteIngredient: (id: string) => boolean;
  
  // Consultas
  getIngredientById: (id: string) => Ingredient | undefined;
  getIngredientsByCategory: (categoryId: string) => Ingredient[];
  searchIngredients: (query: string) => Ingredient[];
  
  // Utilitários
  refresh: () => void;
  categories: typeof ingredientCategories;
}

interface CreateIngredientData {
  name: string;
  categoryId: string;
  unitPrice: number;
  priceUnit: string;
  defaultCorrection: number;
  description?: string;
  supplier?: string;
}

export function useIngredients(): UseIngredientsReturn {
  const [userIngredients, setUserIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega ingredientes do usuário
  useEffect(() => {
    const data = userIngredientsStorage.getAll();
    setUserIngredients(data);
    setIsLoading(false);
  }, []);

  // Recarrega dados
  const refresh = useCallback(() => {
    setIsLoading(true);
    const data = userIngredientsStorage.getAll();
    setUserIngredients(data);
    setIsLoading(false);
  }, []);

  // Todos os ingredientes combinados
  const allIngredients = useMemo(() => {
    return [...mockIngredients, ...userIngredients];
  }, [userIngredients]);

  // Criar ingrediente
  const createIngredient = useCallback((data: CreateIngredientData): Ingredient => {
    const newIngredient: Ingredient = {
      ...data,
      id: `ing-user-${Date.now()}`,
      userId: 'current-user',
      isActive: true,
      lastPriceUpdate: new Date().toISOString().split('T')[0],
    };

    userIngredientsStorage.add(newIngredient);
    setUserIngredients(prev => [...prev, newIngredient]);
    
    return newIngredient;
  }, []);

  // Atualizar ingrediente
  const updateIngredient = useCallback((id: string, data: Partial<Ingredient>): boolean => {
    // Só pode atualizar ingredientes do usuário
    const isUserIngredient = userIngredients.some(i => i.id === id);
    if (!isUserIngredient) {
      console.error('Não é possível editar ingredientes do sistema');
      return false;
    }

    const success = userIngredientsStorage.update(id, data);
    
    if (success) {
      setUserIngredients(prev => prev.map(i =>
        i.id === id
          ? { ...i, ...data, lastPriceUpdate: new Date().toISOString().split('T')[0] }
          : i
      ));
    }
    
    return success;
  }, [userIngredients]);

  // Excluir ingrediente
  const deleteIngredient = useCallback((id: string): boolean => {
    const success = userIngredientsStorage.delete(id);
    
    if (success) {
      setUserIngredients(prev => prev.filter(i => i.id !== id));
    }
    
    return success;
  }, []);

  // Buscar por ID
  const getIngredientById = useCallback((id: string): Ingredient | undefined => {
    return allIngredients.find(i => i.id === id);
  }, [allIngredients]);

  // Filtrar por categoria
  const getIngredientsByCategory = useCallback((categoryId: string): Ingredient[] => {
    return allIngredients.filter(i => i.categoryId === categoryId);
  }, [allIngredients]);

  // Buscar por texto
  const searchIngredients = useCallback((query: string): Ingredient[] => {
    const lowerQuery = query.toLowerCase();
    return allIngredients.filter(i =>
      i.name.toLowerCase().includes(lowerQuery)
    );
  }, [allIngredients]);

  return {
    allIngredients,
    systemIngredients: mockIngredients,
    userIngredients,
    isLoading,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    getIngredientById,
    getIngredientsByCategory,
    searchIngredients,
    refresh,
    categories: ingredientCategories,
  };
}
```

---

## TAREFA 2.4: Criar Hook useSettings

### Criar arquivo: `src/hooks/useSettings.ts`

```typescript
/**
 * Hook para gerenciamento de Configurações do Negócio
 * 
 * @module hooks/useSettings
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BusinessSettings, 
  OverheadCosts,
  defaultBusinessSettings 
} from '@/lib/overhead-costs';
import { settingsStorage } from '@/lib/storage';
import { 
  calculateMonthlyFixedCosts, 
  calculateOverheadPerUnit 
} from '@/lib/overhead-costs';

interface UseSettingsReturn {
  settings: BusinessSettings;
  isLoading: boolean;
  hasChanges: boolean;
  
  // Ações
  updateOverheadCost: (key: keyof OverheadCosts, value: number) => void;
  updateProduction: (value: number) => void;
  updateTaxRate: (value: number) => void;
  saveSettings: () => boolean;
  resetSettings: () => void;
  
  // Cálculos derivados
  monthlyTotal: number;
  overheadPerUnit: number;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<BusinessSettings>(defaultBusinessSettings);
  const [savedSettings, setSavedSettings] = useState<BusinessSettings>(defaultBusinessSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega configurações salvas
  useEffect(() => {
    const data = settingsStorage.get();
    setSettings(data);
    setSavedSettings(data);
    setIsLoading(false);
  }, []);

  // Verifica se há alterações não salvas
  const hasChanges = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(savedSettings);
  }, [settings, savedSettings]);

  // Atualiza um custo específico
  const updateOverheadCost = useCallback((key: keyof OverheadCosts, value: number) => {
    setSettings(prev => ({
      ...prev,
      monthlyOverheadCosts: {
        ...prev.monthlyOverheadCosts,
        [key]: value,
      },
    }));
  }, []);

  // Atualiza produção mensal
  const updateProduction = useCallback((value: number) => {
    setSettings(prev => ({
      ...prev,
      estimatedMonthlyProduction: Math.max(1, value),
    }));
  }, []);

  // Atualiza taxa de impostos
  const updateTaxRate = useCallback((value: number) => {
    setSettings(prev => ({
      ...prev,
      taxRate: Math.max(0, Math.min(100, value)),
    }));
  }, []);

  // Salva configurações
  const saveSettings = useCallback((): boolean => {
    const success = settingsStorage.save(settings);
    if (success) {
      setSavedSettings(settings);
    }
    return success;
  }, [settings]);

  // Reseta para padrão
  const resetSettings = useCallback(() => {
    setSettings(defaultBusinessSettings);
    settingsStorage.reset();
    setSavedSettings(defaultBusinessSettings);
  }, []);

  // Cálculos derivados
  const monthlyTotal = useMemo(() => {
    return calculateMonthlyFixedCosts(settings.monthlyOverheadCosts);
  }, [settings.monthlyOverheadCosts]);

  const overheadPerUnit = useMemo(() => {
    return calculateOverheadPerUnit(monthlyTotal, settings.estimatedMonthlyProduction);
  }, [monthlyTotal, settings.estimatedMonthlyProduction]);

  return {
    settings,
    isLoading,
    hasChanges,
    updateOverheadCost,
    updateProduction,
    updateTaxRate,
    saveSettings,
    resetSettings,
    monthlyTotal,
    overheadPerUnit,
  };
}
```

---

## TAREFA 2.5: Atualizar App.tsx

### Modificar arquivo: `src/App.tsx`

```typescript
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { initializeStorage } from "@/lib/storage";

// Pages
import Index from "./pages/Index";
import FichaTecnicaList from "./pages/FichaTecnicaList";
import FichaTecnicaNova from "./pages/FichaTecnicaNova";
import FichaTecnicaEdit from "./pages/FichaTecnicaEdit";
import Ingredientes from "./pages/Ingredientes";
import ConfiguracoesCustos from "./pages/ConfiguracoesCustos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Inicializa o storage na montagem do app
  useEffect(() => {
    initializeStorage();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/ficha-tecnica" element={<FichaTecnicaList />} />
            <Route path="/ficha-tecnica/nova" element={<FichaTecnicaNova />} />
            <Route path="/ficha-tecnica/:id" element={<FichaTecnicaEdit />} />
            <Route path="/ficha-tecnica/ingredientes" element={<Ingredientes />} />
            <Route path="/configuracoes/custos" element={<ConfiguracoesCustos />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
```

---

## TESTES DE VALIDAÇÃO FASE 2

### Teste 1: Persistência de Fichas
1. [ ] Criar nova ficha técnica
2. [ ] Recarregar a página (F5)
3. [ ] Verificar se a ficha ainda aparece na lista
4. [ ] Editar a ficha
5. [ ] Recarregar novamente
6. [ ] Verificar se edições foram mantidas

### Teste 2: Persistência de Ingredientes
1. [ ] Criar novo ingrediente em "Meus Ingredientes"
2. [ ] Recarregar a página
3. [ ] Verificar se o ingrediente ainda aparece
4. [ ] Editar preço do ingrediente
5. [ ] Verificar se alteração foi salva

### Teste 3: Persistência de Configurações
1. [ ] Alterar custos fixos em Configurações
2. [ ] Salvar configurações
3. [ ] Recarregar a página
4. [ ] Verificar se valores foram mantidos

### Teste 4: Console
1. [ ] Abrir DevTools > Application > Local Storage
2. [ ] Verificar se existem as chaves:
   - `meu-chef-sheets`
   - `meu-chef-user-ingredients`
   - `meu-chef-business-settings`
   - `meu-chef-initialized`

---

## ARQUIVOS CRIADOS NESTA FASE

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/storage.ts` | Sistema de persistência |
| `src/hooks/useSheets.ts` | Hook para fichas técnicas |
| `src/hooks/useIngredients.ts` | Hook para ingredientes |
| `src/hooks/useSettings.ts` | Hook para configurações |

## ARQUIVOS MODIFICADOS

| Arquivo | Modificação |
|---------|-------------|
| `src/App.tsx` | Adicionada inicialização do storage |

