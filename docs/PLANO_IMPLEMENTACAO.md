# 📋 PLANO DE IMPLEMENTAÇÃO COMPLETO
## Módulo de Fichas Técnicas - Meu Chef Digital

**Data**: Dezembro 2024  
**Versão**: 1.0  
**Status**: Pronto para Execução

---

## 📊 VISÃO GERAL DO PLANO

| Fase | Descrição | Duração | Prioridade |
|------|-----------|---------|------------|
| 1 | Correções Críticas | 1 semana | 🔴 URGENTE |
| 2 | Persistência de Dados | 1 semana | 🔴 URGENTE |
| 3 | Funcionalidades Essenciais | 2 semanas | 🟠 ALTA |
| 4 | Melhorias de UX | 1 semana | 🟡 MÉDIA |
| 5 | Diferenciais Competitivos | 3 semanas | 🟢 ESTRATÉGICO |
| 6 | Preparação para Integração | 1 semana | 🟠 ALTA |

**Tempo Total Estimado**: 9-10 semanas

---

## 🔴 FASE 1: CORREÇÕES CRÍTICAS (Semana 1)

### 1.1 Corrigir Funções Delete e Duplicate

**Arquivo**: `src/pages/FichaTecnicaList.tsx`

**Problema Atual** (linhas 169-170):
```typescript
onDelete={(id) => console.log("Delete:", id)}
onDuplicate={(id) => console.log("Duplicate:", id)}
```

**Solução**:

#### 1.1.1 Criar Estado para Fichas
```typescript
// Adicionar no início do componente
const [sheets, setSheets] = useState<TechnicalSheet[]>(mockSheets);
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [sheetToDelete, setSheetToDelete] = useState<string | null>(null);
```

#### 1.1.2 Implementar handleDelete
```typescript
const handleDelete = (id: string) => {
  setSheetToDelete(id);
  setDeleteDialogOpen(true);
};

const confirmDelete = () => {
  if (sheetToDelete) {
    setSheets(prev => prev.filter(s => s.id !== sheetToDelete));
    deleteMockSheet(sheetToDelete);
    toast.success("Ficha técnica excluída com sucesso!");
    setDeleteDialogOpen(false);
    setSheetToDelete(null);
  }
};
```

#### 1.1.3 Implementar handleDuplicate
```typescript
const handleDuplicate = (id: string) => {
  const original = sheets.find(s => s.id === id);
  if (original) {
    const duplicated: TechnicalSheet = {
      ...original,
      id: `${Date.now()}`,
      code: generateSheetCode(),
      name: `${original.name} (Cópia)`,
      status: 'DRAFT',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setSheets(prev => [duplicated, ...prev]);
    toast.success(`Ficha "${duplicated.name}" criada como cópia!`);
  }
};
```

#### 1.1.4 Adicionar Dialog de Confirmação
```typescript
// Importar AlertDialog
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Adicionar no JSX antes do fechamento de MainLayout
<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Excluir ficha técnica?</AlertDialogTitle>
      <AlertDialogDescription>
        Esta ação não pode ser desfeita. A ficha será permanentemente excluída.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction
        onClick={confirmDelete}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        Excluir
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Critério de Aceite**:
- [ ] Ao clicar em excluir, abre diálogo de confirmação
- [ ] Ao confirmar, ficha é removida da lista
- [ ] Toast de sucesso aparece
- [ ] Ao duplicar, nova ficha aparece no topo da lista
- [ ] Nova ficha tem código único e status "Rascunho"

---

### 1.2 Corrigir Link de Edição Quebrado

**Arquivo**: `src/components/ficha-tecnica/RecipeCard.tsx`

**Problema Atual** (linha 138-139):
```typescript
<Link to={`/ficha-tecnica/${sheet.id}/editar`}>
```

**Solução**:
```typescript
<Link to={`/ficha-tecnica/${sheet.id}`}>
```

**Critério de Aceite**:
- [ ] Clicar em "Editar" abre a página de edição corretamente

---

### 1.3 Traduzir Página 404

**Arquivo**: `src/pages/NotFound.tsx`

**Código Atualizado**:
```typescript
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-4">
        <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Página não encontrada
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button asChild>
            <Link to="/">
              <Home className="h-4 w-4" />
              Ir para o início
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
```

---

### 1.4 Corrigir Imports no Index.tsx

**Arquivo**: `src/pages/Index.tsx`

**Problema**: Imports no final do arquivo (linhas 176-177)

**Solução**: Mover para o topo do arquivo junto com outros imports
```typescript
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
```

---

### 1.5 Implementar Delete de Ingrediente na Lista

**Arquivo**: `src/pages/Ingredientes.tsx`

**Adicionar estado e função**:
```typescript
const [ingredientToDelete, setIngredientToDelete] = useState<string | null>(null);
const [deleteIngredientDialogOpen, setDeleteIngredientDialogOpen] = useState(false);

const handleDeleteIngredient = (id: string) => {
  setIngredientToDelete(id);
  setDeleteIngredientDialogOpen(true);
};

const confirmDeleteIngredient = () => {
  if (ingredientToDelete) {
    // Remover do estado local
    toast.success("Ingrediente excluído com sucesso!");
    setDeleteIngredientDialogOpen(false);
    setIngredientToDelete(null);
  }
};
```

**Atualizar botão de delete** (linha 231-237):
```typescript
<Button
  variant="ghost"
  size="icon-sm"
  className="text-destructive hover:text-destructive"
  onClick={() => handleDeleteIngredient(ing.id)}
>
  <Trash2 className="h-4 w-4" />
</Button>
```

---

## 🔴 FASE 2: PERSISTÊNCIA DE DADOS (Semana 2)

### 2.1 Criar Sistema de Storage

**Criar arquivo**: `src/lib/storage.ts`

```typescript
// Sistema de persistência com localStorage
// Preparado para migrar para API futuramente

const STORAGE_KEYS = {
  SHEETS: 'meu-chef-sheets',
  INGREDIENTS: 'meu-chef-ingredients',
  SETTINGS: 'meu-chef-settings',
} as const;

// Helpers
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
  }
}

// Fichas Técnicas
export const sheetsStorage = {
  getAll: (): TechnicalSheet[] => getItem(STORAGE_KEYS.SHEETS, []),
  
  save: (sheets: TechnicalSheet[]): void => setItem(STORAGE_KEYS.SHEETS, sheets),
  
  add: (sheet: TechnicalSheet): void => {
    const sheets = sheetsStorage.getAll();
    sheets.unshift(sheet);
    sheetsStorage.save(sheets);
  },
  
  update: (id: string, data: Partial<TechnicalSheet>): void => {
    const sheets = sheetsStorage.getAll();
    const index = sheets.findIndex(s => s.id === id);
    if (index !== -1) {
      sheets[index] = { ...sheets[index], ...data, updatedAt: new Date().toISOString().split('T')[0] };
      sheetsStorage.save(sheets);
    }
  },
  
  delete: (id: string): void => {
    const sheets = sheetsStorage.getAll().filter(s => s.id !== id);
    sheetsStorage.save(sheets);
  },
  
  getById: (id: string): TechnicalSheet | undefined => {
    return sheetsStorage.getAll().find(s => s.id === id);
  },
};

// Ingredientes Customizados
export const ingredientsStorage = {
  getAll: (): Ingredient[] => getItem(STORAGE_KEYS.INGREDIENTS, []),
  save: (ingredients: Ingredient[]): void => setItem(STORAGE_KEYS.INGREDIENTS, ingredients),
  add: (ingredient: Ingredient): void => {
    const ingredients = ingredientsStorage.getAll();
    ingredients.push(ingredient);
    ingredientsStorage.save(ingredients);
  },
  update: (id: string, data: Partial<Ingredient>): void => {
    const ingredients = ingredientsStorage.getAll();
    const index = ingredients.findIndex(i => i.id === id);
    if (index !== -1) {
      ingredients[index] = { ...ingredients[index], ...data };
      ingredientsStorage.save(ingredients);
    }
  },
  delete: (id: string): void => {
    const ingredients = ingredientsStorage.getAll().filter(i => i.id !== id);
    ingredientsStorage.save(ingredients);
  },
};

// Configurações de Negócio
export const settingsStorage = {
  get: (): BusinessSettings => getItem(STORAGE_KEYS.SETTINGS, defaultBusinessSettings),
  save: (settings: BusinessSettings): void => setItem(STORAGE_KEYS.SETTINGS, settings),
};

// Inicialização - carrega dados mock se não houver dados salvos
export function initializeStorage(): void {
  if (sheetsStorage.getAll().length === 0) {
    sheetsStorage.save(mockSheets);
  }
}
```

### 2.2 Criar Hook useSheets

**Criar arquivo**: `src/hooks/useSheets.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { TechnicalSheet } from '@/lib/mock-data';
import { sheetsStorage } from '@/lib/storage';
import { generateSheetCode } from '@/lib/calculations';

export function useSheets() {
  const [sheets, setSheets] = useState<TechnicalSheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados
  useEffect(() => {
    const data = sheetsStorage.getAll();
    setSheets(data);
    setIsLoading(false);
  }, []);

  // Criar ficha
  const createSheet = useCallback((data: Omit<TechnicalSheet, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => {
    const newSheet: TechnicalSheet = {
      ...data,
      id: `sheet-${Date.now()}`,
      code: generateSheetCode(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    sheetsStorage.add(newSheet);
    setSheets(prev => [newSheet, ...prev]);
    return newSheet;
  }, []);

  // Atualizar ficha
  const updateSheet = useCallback((id: string, data: Partial<TechnicalSheet>) => {
    sheetsStorage.update(id, data);
    setSheets(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  }, []);

  // Excluir ficha
  const deleteSheet = useCallback((id: string) => {
    sheetsStorage.delete(id);
    setSheets(prev => prev.filter(s => s.id !== id));
  }, []);

  // Duplicar ficha
  const duplicateSheet = useCallback((id: string) => {
    const original = sheets.find(s => s.id === id);
    if (original) {
      const duplicated = createSheet({
        ...original,
        name: `${original.name} (Cópia)`,
        status: 'DRAFT',
      });
      return duplicated;
    }
    return null;
  }, [sheets, createSheet]);

  // Buscar por ID
  const getSheetById = useCallback((id: string) => {
    return sheets.find(s => s.id === id);
  }, [sheets]);

  return {
    sheets,
    isLoading,
    createSheet,
    updateSheet,
    deleteSheet,
    duplicateSheet,
    getSheetById,
  };
}
```

### 2.3 Criar Hook useIngredients

**Criar arquivo**: `src/hooks/useIngredients.ts`

```typescript
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Ingredient, mockIngredients } from '@/lib/mock-data';
import { ingredientsStorage } from '@/lib/storage';

export function useIngredients() {
  const [customIngredients, setCustomIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const data = ingredientsStorage.getAll();
    setCustomIngredients(data);
    setIsLoading(false);
  }, []);

  // Todos os ingredientes (sistema + customizados)
  const allIngredients = useMemo(() => {
    return [...mockIngredients, ...customIngredients];
  }, [customIngredients]);

  // Apenas do sistema
  const systemIngredients = useMemo(() => {
    return mockIngredients;
  }, []);

  // Apenas customizados
  const userIngredients = useMemo(() => {
    return customIngredients;
  }, [customIngredients]);

  // Criar ingrediente
  const createIngredient = useCallback((data: Omit<Ingredient, 'id' | 'userId' | 'isActive' | 'lastPriceUpdate'>) => {
    const newIngredient: Ingredient = {
      ...data,
      id: `ing-${Date.now()}`,
      userId: 'current-user', // Será substituído pelo ID real do app mãe
      isActive: true,
      lastPriceUpdate: new Date().toISOString().split('T')[0],
    };
    ingredientsStorage.add(newIngredient);
    setCustomIngredients(prev => [...prev, newIngredient]);
    return newIngredient;
  }, []);

  // Atualizar ingrediente
  const updateIngredient = useCallback((id: string, data: Partial<Ingredient>) => {
    ingredientsStorage.update(id, {
      ...data,
      lastPriceUpdate: new Date().toISOString().split('T')[0],
    });
    setCustomIngredients(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  }, []);

  // Excluir ingrediente
  const deleteIngredient = useCallback((id: string) => {
    ingredientsStorage.delete(id);
    setCustomIngredients(prev => prev.filter(i => i.id !== id));
  }, []);

  return {
    allIngredients,
    systemIngredients,
    userIngredients,
    isLoading,
    createIngredient,
    updateIngredient,
    deleteIngredient,
  };
}
```

### 2.4 Inicializar Storage no App

**Arquivo**: `src/App.tsx`

```typescript
import { useEffect } from 'react';
import { initializeStorage } from '@/lib/storage';

const App = () => {
  useEffect(() => {
    initializeStorage();
  }, []);

  return (
    // ... resto do código
  );
};
```

---

## 🟠 FASE 3: FUNCIONALIDADES ESSENCIAIS (Semanas 3-4)

### 3.1 Exportação PDF

**Instalar dependência**:
```bash
npm install @react-pdf/renderer
```

**Criar arquivo**: `src/lib/pdf-generator.tsx`

Detalhes no arquivo separado: `docs/FASE3_PDF.md`

### 3.2 Escalabilidade de Receitas

**Funcionalidade**: Permitir ajustar quantidade de porções e recalcular ingredientes automaticamente.

**Implementação**: Adicionar controle no CostSummaryCard ou criar modal dedicado.

### 3.3 Histórico de Preços

**Criar interface**:
```typescript
interface PriceHistory {
  ingredientId: string;
  price: number;
  date: string;
  source?: string;
}
```

### 3.4 Drag & Drop Funcional

**Instalar**:
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 3.5 Validação com Zod

**Criar arquivo**: `src/lib/validations.ts`

```typescript
import { z } from 'zod';

export const sheetFormSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
  yieldQuantity: z.number().min(1, 'Rendimento deve ser maior que zero'),
  yieldUnit: z.string(),
  prepTimeMinutes: z.number().min(0),
  cookTimeMinutes: z.number().min(0),
  restTimeMinutes: z.number().min(0),
  targetMargin: z.number().min(0).max(100),
});

export const ingredientFormSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
  unitPrice: z.number().min(0.01, 'Preço deve ser maior que zero'),
  priceUnit: z.string(),
  defaultCorrection: z.number().min(1).max(3),
});
```

---

## 🟡 FASE 4: MELHORIAS DE UX (Semana 5)

### 4.1 Busca Global (Cmd+K)

**Instalar**:
```bash
npm install cmdk
# (já está instalado)
```

**Criar componente**: `src/components/CommandMenu.tsx`

### 4.2 Onboarding para Novos Usuários

**Criar arquivo**: `src/components/Onboarding.tsx`

### 4.3 Loading States Consistentes

**Criar componente**: `src/components/ui/skeleton-cards.tsx`

### 4.4 Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Cmd+K` | Busca global |
| `Cmd+N` | Nova ficha |
| `Cmd+S` | Salvar |
| `Esc` | Fechar modal |

### 4.5 Feedback Melhorado

- Toast com undo para exclusões
- Animações de sucesso
- Indicadores de salvamento automático

---

## 🟢 FASE 5: DIFERENCIAIS COMPETITIVOS (Semanas 6-8)

### 5.1 Simulador de Cenários

**Criar página**: `src/pages/Simulador.tsx`

**Funcionalidades**:
- "E se o preço do ingrediente X subir Y%?"
- Impacto em todas as fichas que usam o ingrediente
- Sugestão de ingredientes substitutos

### 5.2 Modo Offline (PWA)

**Configurar Service Worker e manifest**

### 5.3 Dashboard Analítico

**Criar página**: `src/pages/Dashboard.tsx`

**Métricas**:
- Margem média por categoria
- Ingredientes mais caros
- Fichas com margem baixa
- Tendência de custos

---

## 🟠 FASE 6: PREPARAÇÃO PARA INTEGRAÇÃO (Semana 9)

### 6.1 Contexto de Usuário

**Criar arquivo**: `src/contexts/UserContext.tsx`

```typescript
import { createContext, useContext, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  businessId: string;
}

interface Subscription {
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  features: string[];
  expiresAt: string;
}

interface UserContextType {
  user: User | null;
  subscription: Subscription | null;
  isAuthenticated: boolean;
  hasFeature: (feature: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  // Será populado pelo app mãe via props ou postMessage
  const value: UserContextType = {
    user: null,
    subscription: null,
    isAuthenticated: false,
    hasFeature: (feature: string) => false,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
```

### 6.2 Feature Flags

**Criar arquivo**: `src/lib/features.ts`

```typescript
export const FEATURES = {
  EXPORT_PDF: 'export_pdf',
  PRICE_HISTORY: 'price_history',
  SIMULATOR: 'simulator',
  ANALYTICS: 'analytics',
  UNLIMITED_SHEETS: 'unlimited_sheets',
  CUSTOM_INGREDIENTS: 'custom_ingredients',
} as const;

export const PLAN_FEATURES: Record<string, string[]> = {
  free: [],
  basic: [FEATURES.EXPORT_PDF, FEATURES.CUSTOM_INGREDIENTS],
  pro: [
    FEATURES.EXPORT_PDF,
    FEATURES.PRICE_HISTORY,
    FEATURES.SIMULATOR,
    FEATURES.CUSTOM_INGREDIENTS,
    FEATURES.UNLIMITED_SHEETS,
  ],
  enterprise: Object.values(FEATURES),
};
```

### 6.3 API Service Layer

**Criar arquivo**: `src/services/api.ts`

```typescript
// Preparado para substituir localStorage por chamadas HTTP

const API_BASE = import.meta.env.VITE_API_URL || '';

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Sheets
  sheets = {
    getAll: () => this.request<TechnicalSheet[]>('/sheets'),
    getById: (id: string) => this.request<TechnicalSheet>(`/sheets/${id}`),
    create: (data: Partial<TechnicalSheet>) => 
      this.request<TechnicalSheet>('/sheets', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<TechnicalSheet>) =>
      this.request<TechnicalSheet>(`/sheets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) =>
      this.request<void>(`/sheets/${id}`, { method: 'DELETE' }),
  };

  // Ingredients
  ingredients = {
    getAll: () => this.request<Ingredient[]>('/ingredients'),
    create: (data: Partial<Ingredient>) =>
      this.request<Ingredient>('/ingredients', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Ingredient>) =>
      this.request<Ingredient>(`/ingredients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) =>
      this.request<void>(`/ingredients/${id}`, { method: 'DELETE' }),
  };
}

export const api = new ApiService();
```

---

## ✅ CHECKLIST DE CONCLUSÃO

### Fase 1 - Correções Críticas
- [ ] Delete de fichas funcionando
- [ ] Duplicate de fichas funcionando
- [ ] Link de edição corrigido
- [ ] Página 404 traduzida
- [ ] Imports organizados
- [ ] Delete de ingredientes funcionando

### Fase 2 - Persistência
- [ ] Storage service criado
- [ ] Hook useSheets implementado
- [ ] Hook useIngredients implementado
- [ ] Dados persistem após reload

### Fase 3 - Funcionalidades
- [ ] Exportação PDF
- [ ] Escalabilidade de receitas
- [ ] Histórico de preços
- [ ] Drag & drop funcional
- [ ] Validação com Zod

### Fase 4 - UX
- [ ] Busca global (Cmd+K)
- [ ] Onboarding
- [ ] Loading states
- [ ] Atalhos de teclado
- [ ] Toast com undo

### Fase 5 - Diferenciais
- [ ] Simulador de cenários
- [ ] Modo offline (PWA)
- [ ] Dashboard analítico

### Fase 6 - Integração
- [ ] UserContext
- [ ] Feature flags
- [ ] API service layer

---

## 📁 ESTRUTURA FINAL DE ARQUIVOS

```
src/
├── components/
│   ├── ficha-tecnica/
│   ├── layout/
│   ├── ui/
│   ├── CommandMenu.tsx (NOVO)
│   └── Onboarding.tsx (NOVO)
├── contexts/
│   └── UserContext.tsx (NOVO)
├── hooks/
│   ├── useSheets.ts (NOVO)
│   ├── useIngredients.ts (NOVO)
│   ├── useSettings.ts (NOVO)
│   └── use-mobile.tsx
├── lib/
│   ├── calculations.ts
│   ├── mock-data.ts
│   ├── overhead-costs.ts
│   ├── storage.ts (NOVO)
│   ├── validations.ts (NOVO)
│   ├── features.ts (NOVO)
│   ├── pdf-generator.tsx (NOVO)
│   └── utils.ts
├── pages/
│   ├── Simulador.tsx (NOVO)
│   ├── Dashboard.tsx (NOVO)
│   └── ... (existentes)
├── services/
│   └── api.ts (NOVO)
└── App.tsx
```

---

**Documento criado por**: Análise automatizada  
**Próximo passo**: Iniciar Fase 1 - Correções Críticas

