/**
 * Hook para gerenciamento de Ingredientes
 * 
 * Gerencia ingredientes do sistema (mockados) e do usuário (persistidos)
 * 
 * @module hooks/useIngredients
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Ingredient, mockIngredients, ingredientCategories } from '@/lib/mock-data';
import { userIngredientsStorage } from '@/lib/storage';
import { useUser } from '@/contexts/UserContext';

interface CreateIngredientInput {
  name: string;
  categoryId: string;
  unitPrice: number;
  priceUnit: string;
  defaultCorrection: number;
  description?: string;
  supplier?: string;
}

interface UseIngredientsReturn {
  // Estado
  allIngredients: Ingredient[];
  systemIngredients: Ingredient[];
  userIngredients: Ingredient[];
  isLoading: boolean;
  
  // Ações CRUD (apenas para ingredientes do usuário)
  createIngredient: (data: CreateIngredientInput) => Ingredient;
  updateIngredient: (id: string, data: Partial<Ingredient>) => boolean;
  deleteIngredient: (id: string) => boolean;
  
  // Consultas
  getIngredientById: (id: string) => Ingredient | undefined;
  getIngredientsByCategory: (categoryId: string) => Ingredient[];
  searchIngredients: (query: string) => Ingredient[];
  
  // Estatísticas
  stats: {
    totalSystem: number;
    totalUser: number;
    total: number;
  };
  
  // Utilitários
  refresh: () => void;
  categories: typeof ingredientCategories;
  isUserIngredient: (id: string) => boolean;
}

export function useIngredients(): UseIngredientsReturn {
  const { user, checkIngredientLimit } = useUser();
  const [userIngredients, setUserIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega ingredientes do usuário do storage
  useEffect(() => {
    try {
      const data = userIngredientsStorage.getAll();
      setUserIngredients(data);
    } catch (err) {
      console.error('[useIngredients] Erro ao carregar:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Recarrega dados do storage
  const refresh = useCallback(() => {
    setIsLoading(true);
    try {
      const data = userIngredientsStorage.getAll();
      setUserIngredients(data);
    } catch (err) {
      console.error('[useIngredients] Erro ao recarregar:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Todos os ingredientes combinados (sistema + usuário)
  const allIngredients = useMemo(() => {
    return [...mockIngredients, ...userIngredients];
  }, [userIngredients]);

  // Verifica se um ingrediente é do usuário
  const isUserIngredient = useCallback((id: string): boolean => {
    return userIngredients.some(i => i.id === id);
  }, [userIngredients]);

  // Criar novo ingrediente
  const createIngredient = useCallback((data: CreateIngredientInput): Ingredient => {
    // Verifica limite de ingredientes
    if (!checkIngredientLimit(userIngredients.length)) {
      throw new Error('Limite de ingredientes customizados atingido. Faça upgrade para criar mais.');
    }

    const now = new Date().toISOString().split('T')[0];
    
    const newIngredient: Ingredient = {
      id: `ing-user-${Date.now()}`,
      userId: user?.id || 'current-user',
      name: data.name,
      description: data.description,
      categoryId: data.categoryId,
      unitPrice: data.unitPrice,
      priceUnit: data.priceUnit,
      defaultCorrection: data.defaultCorrection,
      supplier: data.supplier,
      isActive: true,
      lastPriceUpdate: now,
    };

    // Salva no storage
    userIngredientsStorage.add(newIngredient);
    
    // Atualiza estado local
    setUserIngredients(prev => [...prev, newIngredient]);
    
    return newIngredient;
  }, [user, userIngredients.length, checkIngredientLimit]);

  // Atualizar ingrediente (apenas do usuário)
  const updateIngredient = useCallback((id: string, data: Partial<Ingredient>): boolean => {
    // Verifica se é ingrediente do usuário
    if (!userIngredients.some(i => i.id === id)) {
      console.error('[useIngredients] Não é possível editar ingredientes do sistema');
      return false;
    }

    const success = userIngredientsStorage.update(id, data);
    
    if (success) {
      setUserIngredients(prev => prev.map(i =>
        i.id === id
          ? { 
              ...i, 
              ...data, 
              lastPriceUpdate: new Date().toISOString().split('T')[0] 
            }
          : i
      ));
    }
    
    return success;
  }, [userIngredients]);

  // Excluir ingrediente (apenas do usuário)
  const deleteIngredient = useCallback((id: string): boolean => {
    // Verifica se é ingrediente do usuário
    if (!userIngredients.some(i => i.id === id)) {
      console.error('[useIngredients] Não é possível excluir ingredientes do sistema');
      return false;
    }

    const success = userIngredientsStorage.delete(id);
    
    if (success) {
      setUserIngredients(prev => prev.filter(i => i.id !== id));
    }
    
    return success;
  }, [userIngredients]);

  // Buscar por ID (sistema ou usuário)
  const getIngredientById = useCallback((id: string): Ingredient | undefined => {
    return allIngredients.find(i => i.id === id);
  }, [allIngredients]);

  // Filtrar por categoria
  const getIngredientsByCategory = useCallback((categoryId: string): Ingredient[] => {
    return allIngredients.filter(i => i.categoryId === categoryId);
  }, [allIngredients]);

  // Buscar por texto
  const searchIngredients = useCallback((query: string): Ingredient[] => {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return allIngredients;
    
    return allIngredients.filter(i =>
      i.name.toLowerCase().includes(lowerQuery) ||
      i.supplier?.toLowerCase().includes(lowerQuery)
    );
  }, [allIngredients]);

  // Estatísticas
  const stats = useMemo(() => ({
    totalSystem: mockIngredients.length,
    totalUser: userIngredients.length,
    total: mockIngredients.length + userIngredients.length,
  }), [userIngredients.length]);

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
    stats,
    refresh,
    categories: ingredientCategories,
    isUserIngredient,
  };
}

