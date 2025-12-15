/**
 * Hook para gerenciamento de Configurações do Negócio
 * 
 * Gerencia custos fixos, produção estimada e taxa de impostos
 * 
 * @module hooks/useSettings
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BusinessSettings, 
  OverheadCosts,
  defaultBusinessSettings,
  calculateMonthlyFixedCosts,
  calculateOverheadPerUnit,
  getOverheadBreakdown,
} from '@/lib/overhead-costs';
import { settingsStorage } from '@/lib/storage';

interface UseSettingsReturn {
  // Estado
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
  breakdown: ReturnType<typeof getOverheadBreakdown>;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<BusinessSettings>(defaultBusinessSettings);
  const [savedSettings, setSavedSettings] = useState<BusinessSettings>(defaultBusinessSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega configurações do storage
  useEffect(() => {
    try {
      const data = settingsStorage.get();
      setSettings(data);
      setSavedSettings(data);
    } catch (err) {
      console.error('[useSettings] Erro ao carregar:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verifica se há alterações não salvas
  const hasChanges = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(savedSettings);
  }, [settings, savedSettings]);

  // Atualiza um custo específico do overhead
  const updateOverheadCost = useCallback((key: keyof OverheadCosts, value: number) => {
    setSettings(prev => ({
      ...prev,
      monthlyOverheadCosts: {
        ...prev.monthlyOverheadCosts,
        [key]: Math.max(0, value), // Não permite valores negativos
      },
    }));
  }, []);

  // Atualiza produção mensal estimada
  const updateProduction = useCallback((value: number) => {
    setSettings(prev => ({
      ...prev,
      estimatedMonthlyProduction: Math.max(1, value), // Mínimo 1
    }));
  }, []);

  // Atualiza taxa de impostos
  const updateTaxRate = useCallback((value: number) => {
    setSettings(prev => ({
      ...prev,
      taxRate: Math.max(0, Math.min(100, value)), // Entre 0 e 100
    }));
  }, []);

  // Salva configurações no storage
  const saveSettings = useCallback((): boolean => {
    const success = settingsStorage.save(settings);
    if (success) {
      setSavedSettings(settings);
    }
    return success;
  }, [settings]);

  // Reseta para configurações padrão
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

  const breakdown = useMemo(() => {
    return getOverheadBreakdown(settings.monthlyOverheadCosts);
  }, [settings.monthlyOverheadCosts]);

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
    breakdown,
  };
}

