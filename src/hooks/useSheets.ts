/**
 * Hook para gerenciamento de Fichas Técnicas
 * 
 * Abstrai a lógica de CRUD e fornece estado reativo
 * com persistência automática no localStorage
 * 
 * @module hooks/useSheets
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { TechnicalSheet, recipeCategories } from '@/lib/mock-data';
import { sheetsStorage } from '@/lib/storage';
import { generateSheetCode } from '@/lib/calculations';
import { useUser } from '@/contexts/UserContext';

interface SheetStats {
  total: number;
  active: number;
  draft: number;
  archived: number;
  avgMargin: number;
  lowMarginCount: number;
}

interface CreateSheetInput {
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
  imageUrl?: string;
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

interface UseSheetsReturn {
  // Estado
  sheets: TechnicalSheet[];
  isLoading: boolean;
  error: string | null;
  
  // Ações CRUD
  createSheet: (data: CreateSheetInput) => TechnicalSheet;
  updateSheet: (id: string, data: Partial<TechnicalSheet>) => boolean;
  deleteSheet: (id: string) => boolean;
  duplicateSheet: (id: string) => TechnicalSheet | null;
  
  // Consultas
  getSheetById: (id: string) => TechnicalSheet | undefined;
  getSheetsByCategory: (categoryId: string) => TechnicalSheet[];
  getSheetsByStatus: (status: TechnicalSheet['status']) => TechnicalSheet[];
  searchSheets: (query: string) => TechnicalSheet[];
  
  // Estatísticas
  stats: SheetStats;
  
  // Utilitários
  refresh: () => void;
}

export function useSheets(): UseSheetsReturn {
  const { user, checkSheetLimit } = useUser();
  const [sheets, setSheets] = useState<TechnicalSheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega dados iniciais do storage
  useEffect(() => {
    try {
      const data = sheetsStorage.getAll();
      setSheets(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar fichas técnicas');
      console.error('[useSheets] Erro ao carregar:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Recarrega dados do storage
  const refresh = useCallback(() => {
    setIsLoading(true);
    setError(null);
    try {
      const data = sheetsStorage.getAll();
      setSheets(data);
    } catch (err) {
      setError('Erro ao recarregar dados');
      console.error('[useSheets] Erro ao recarregar:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Criar nova ficha
  const createSheet = useCallback((data: CreateSheetInput): TechnicalSheet => {
    const now = new Date().toISOString().split('T')[0];
    const category = recipeCategories.find(c => c.id === data.categoryId);
    
    // Verifica limite de fichas
    if (!checkSheetLimit(sheets.length)) {
      throw new Error('Limite de fichas técnicas atingido. Faça upgrade para criar mais fichas.');
    }

    const newSheet: TechnicalSheet = {
      ...data,
      id: `sheet-${Date.now()}`,
      userId: user?.id || 'current-user',
      code: generateSheetCode(),
      category,
      status: data.status || 'DRAFT',
      isPublic: false,
      createdAt: now,
      updatedAt: now,
    };

    // Salva no storage
    sheetsStorage.add(newSheet);
    
    // Atualiza estado local
    setSheets(prev => [newSheet, ...prev]);
    
    return newSheet;
  }, []);

  // Atualizar ficha existente
  const updateSheet = useCallback((id: string, data: Partial<TechnicalSheet>): boolean => {
    // Se mudou a categoria, atualiza o objeto category também
    let updateData = { ...data };
    if (data.categoryId) {
      const category = recipeCategories.find(c => c.id === data.categoryId);
      updateData = { ...updateData, category };
    }

    const success = sheetsStorage.update(id, updateData);
    
    if (success) {
      setSheets(prev => prev.map(s => 
        s.id === id 
          ? { 
              ...s, 
              ...updateData, 
              updatedAt: new Date().toISOString().split('T')[0] 
            }
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
    const original = sheets.find(s => s.id === id);
    if (!original) return null;

    const now = new Date().toISOString().split('T')[0];
    const newId = `sheet-${Date.now()}`;
    const newCode = generateSheetCode();
    
    const duplicated: TechnicalSheet = {
      ...original,
      id: newId,
      code: newCode,
      name: `${original.name} (Cópia)`,
      status: 'DRAFT',
      createdAt: now,
      updatedAt: now,
    };

    // Salva no storage
    sheetsStorage.add(duplicated);
    
    // Atualiza estado local
    setSheets(prev => [duplicated, ...prev]);
    
    return duplicated;
  }, [sheets]);

  // Buscar por ID (do estado local para performance)
  const getSheetById = useCallback((id: string): TechnicalSheet | undefined => {
    return sheets.find(s => s.id === id);
  }, [sheets]);

  // Filtrar por categoria
  const getSheetsByCategory = useCallback((categoryId: string): TechnicalSheet[] => {
    return sheets.filter(s => s.categoryId === categoryId);
  }, [sheets]);

  // Filtrar por status
  const getSheetsByStatus = useCallback((status: TechnicalSheet['status']): TechnicalSheet[] => {
    return sheets.filter(s => s.status === status);
  }, [sheets]);

  // Buscar por texto (nome ou código)
  const searchSheets = useCallback((query: string): TechnicalSheet[] => {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return sheets;
    
    return sheets.filter(s =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.code.toLowerCase().includes(lowerQuery) ||
      s.description?.toLowerCase().includes(lowerQuery)
    );
  }, [sheets]);

  // Calcula estatísticas
  const stats = useMemo((): SheetStats => {
    const total = sheets.length;
    const active = sheets.filter(s => s.status === 'ACTIVE').length;
    const draft = sheets.filter(s => s.status === 'DRAFT').length;
    const archived = sheets.filter(s => s.status === 'ARCHIVED').length;
    const avgMargin = total > 0
      ? sheets.reduce((acc, s) => acc + s.actualMargin, 0) / total
      : 0;
    const lowMarginCount = sheets.filter(s => s.actualMargin < 20).length;

    return { 
      total, 
      active, 
      draft, 
      archived, 
      avgMargin: Math.round(avgMargin * 10) / 10,
      lowMarginCount,
    };
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
    getSheetsByCategory,
    getSheetsByStatus,
    searchSheets,
    stats,
    refresh,
  };
}

