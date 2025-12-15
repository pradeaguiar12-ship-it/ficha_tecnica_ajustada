/**
 * API Service Layer
 * 
 * Camada de abstração para comunicação com API.
 * Preparado para substituir localStorage quando a API estiver disponível.
 * 
 * @module services/api
 */

import { TechnicalSheet, Ingredient } from '@/lib/mock-data';
import { BusinessSettings } from '@/lib/overhead-costs';
import { sheetsStorage, userIngredientsStorage, settingsStorage } from '@/lib/storage';

// ============================================
// CONFIGURAÇÃO
// ============================================

const API_BASE = import.meta.env.VITE_API_URL || '';
const USE_API = import.meta.env.VITE_USE_API === 'true';

// ============================================
// API SERVICE CLASS
// ============================================

class ApiService {
  private token: string | null = null;
  private userId: string | null = null;

  /**
   * Define token de autenticação
   */
  setToken(token: string) {
    this.token = token;
  }

  /**
   * Define ID do usuário
   */
  setUserId(userId: string) {
    this.userId = userId;
  }

  /**
   * Faz requisição HTTP
   */
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    // Se API não está habilitada, usa localStorage
    if (!USE_API || !API_BASE) {
      throw new Error('API não configurada - usando localStorage');
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...(this.userId && { 'X-User-Id': this.userId }),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`API Error: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Fallback para localStorage quando API não está disponível
   */
  private useLocalStorage<T>(
    storageFn: () => T,
    operation: string
  ): T {
    console.log(`[API] Usando localStorage para: ${operation}`);
    return storageFn();
  }

  // ============================================
  // FICHAS TÉCNICAS
  // ============================================

  sheets = {
    getAll: async (): Promise<TechnicalSheet[]> => {
      if (USE_API && API_BASE) {
        return this.request<TechnicalSheet[]>('/sheets');
      }
      return this.useLocalStorage(() => sheetsStorage.getAll(), 'getAll sheets');
    },

    getById: async (id: string): Promise<TechnicalSheet | undefined> => {
      if (USE_API && API_BASE) {
        return this.request<TechnicalSheet>(`/sheets/${id}`);
      }
      return this.useLocalStorage(() => sheetsStorage.getById(id), `getById sheet ${id}`);
    },

    create: async (data: Partial<TechnicalSheet>): Promise<TechnicalSheet> => {
      if (USE_API && API_BASE) {
        return this.request<TechnicalSheet>('/sheets', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }
      // Fallback: criar via storage
      const newSheet = {
        ...data,
        id: `sheet-${Date.now()}`,
        userId: this.userId || 'current-user',
      } as TechnicalSheet;
      sheetsStorage.add(newSheet);
      return newSheet;
    },

    update: async (id: string, data: Partial<TechnicalSheet>): Promise<TechnicalSheet> => {
      if (USE_API && API_BASE) {
        return this.request<TechnicalSheet>(`/sheets/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        });
      }
      // Fallback: atualizar via storage
      sheetsStorage.update(id, data);
      const updated = sheetsStorage.getById(id);
      if (!updated) throw new Error('Ficha não encontrada');
      return updated;
    },

    delete: async (id: string): Promise<void> => {
      if (USE_API && API_BASE) {
        return this.request<void>(`/sheets/${id}`, {
          method: 'DELETE',
        });
      }
      // Fallback: deletar via storage
      sheetsStorage.delete(id);
    },
  };

  // ============================================
  // INGREDIENTES
  // ============================================

  ingredients = {
    getAll: async (): Promise<Ingredient[]> => {
      if (USE_API && API_BASE) {
        return this.request<Ingredient[]>('/ingredients');
      }
      return this.useLocalStorage(() => userIngredientsStorage.getAll(), 'getAll ingredients');
    },

    create: async (data: Partial<Ingredient>): Promise<Ingredient> => {
      if (USE_API && API_BASE) {
        return this.request<Ingredient>('/ingredients', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }
      // Fallback: criar via storage
      const newIngredient = {
        ...data,
        id: `ing-user-${Date.now()}`,
        userId: this.userId || 'current-user',
      } as Ingredient;
      userIngredientsStorage.add(newIngredient);
      return newIngredient;
    },

    update: async (id: string, data: Partial<Ingredient>): Promise<Ingredient> => {
      if (USE_API && API_BASE) {
        return this.request<Ingredient>(`/ingredients/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        });
      }
      // Fallback: atualizar via storage
      userIngredientsStorage.update(id, data);
      const updated = userIngredientsStorage.getById(id);
      if (!updated) throw new Error('Ingrediente não encontrado');
      return updated;
    },

    delete: async (id: string): Promise<void> => {
      if (USE_API && API_BASE) {
        return this.request<void>(`/ingredients/${id}`, {
          method: 'DELETE',
        });
      }
      // Fallback: deletar via storage
      userIngredientsStorage.delete(id);
    },
  };

  // ============================================
  // CONFIGURAÇÕES
  // ============================================

  settings = {
    get: async (): Promise<BusinessSettings> => {
      if (USE_API && API_BASE) {
        return this.request<BusinessSettings>('/settings');
      }
      return this.useLocalStorage(() => settingsStorage.get(), 'get settings');
    },

    update: async (data: Partial<BusinessSettings>): Promise<BusinessSettings> => {
      if (USE_API && API_BASE) {
        return this.request<BusinessSettings>('/settings', {
          method: 'PATCH',
          body: JSON.stringify(data),
        });
      }
      // Fallback: atualizar via storage
      settingsStorage.update(data);
      return settingsStorage.get();
    },
  };
}

// ============================================
// EXPORT
// ============================================

export const api = new ApiService();

