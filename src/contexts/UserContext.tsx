/**
 * Contexto de Usuário
 * 
 * Gerencia informações do usuário e assinatura.
 * Comunica com o app mãe via postMessage ou props.
 * 
 * @module contexts/UserContext
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { hasFeature, getPlanFeatures, getPlanLimits, PlanType, Feature } from '@/lib/features';

// ============================================
// INTERFACES
// ============================================

export interface User {
  id: string;
  name: string;
  email: string;
  businessId: string;
  avatar?: string;
}

export interface Subscription {
  plan: PlanType;
  features: Feature[];
  expiresAt: string;
  isActive: boolean;
  trialEndsAt?: string;
}

export interface UserContextType {
  user: User | null;
  subscription: Subscription | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isStandaloneMode: boolean; // Indica se está em modo standalone (sem app mãe)
  hasFeature: (feature: Feature) => boolean;
  getPlanLimits: () => ReturnType<typeof getPlanLimits>;
  checkSheetLimit: (currentCount: number) => boolean;
  checkIngredientLimit: (currentCount: number) => boolean;
  updateUser: (user: User | null) => void;
  updateSubscription: (subscription: Subscription | null) => void;
}

// ============================================
// CONTEXT
// ============================================

const UserContext = createContext<UserContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

interface UserProviderProps {
  children: ReactNode;
  initialUser?: User | null;
  initialSubscription?: Subscription | null;
  enablePostMessage?: boolean;
}

export function UserProvider({
  children,
  initialUser = null,
  initialSubscription = null,
  enablePostMessage = true,
}: UserProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [subscription, setSubscription] = useState<Subscription | null>(initialSubscription);
  const [isLoading, setIsLoading] = useState(true);

  // Listener para mensagens do app mãe
  useEffect(() => {
    if (!enablePostMessage || typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      // Valida origem (ajuste conforme necessário)
      // if (event.origin !== 'https://app-mae.com') return;

      if (event.data?.type === 'USER_UPDATE') {
        setUser(event.data.user);
      }

      if (event.data?.type === 'SUBSCRIPTION_UPDATE') {
        setSubscription(event.data.subscription);
      }

      if (event.data?.type === 'AUTH_UPDATE') {
        setUser(event.data.user);
        setSubscription(event.data.subscription);
      }
    };

    window.addEventListener('message', handleMessage);
    setIsLoading(false);

    // Solicita dados iniciais do app mãe
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'REQUEST_USER_DATA' }, '*');
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [enablePostMessage]);

  // Detecta se está em modo standalone (não integrado com app mãe)
  const isStandaloneMode = useCallback((): boolean => {
    // Se não está em iframe e não há subscription, está em modo standalone
    if (typeof window === 'undefined') return false;
    const isInIframe = window.parent !== window;
    return !isInIframe && !subscription;
  }, [subscription]);

  // Verifica se tem uma feature
  const checkFeature = useCallback((feature: Feature): boolean => {
    // Em modo standalone, permite todas as features
    if (isStandaloneMode()) return true;
    
    // Se não há subscription e está em iframe, bloqueia (aguardando dados do app mãe)
    if (!subscription) return false;
    
    return hasFeature(subscription.plan, feature);
  }, [subscription, isStandaloneMode]);

  // Retorna limites do plano
  const getLimits = useCallback(() => {
    // Em modo standalone, retorna limites ilimitados
    if (isStandaloneMode()) {
      return {
        maxSheets: -1,
        maxCustomIngredients: -1,
        maxStorageMB: -1,
      };
    }
    return getPlanLimits(subscription?.plan ?? null);
  }, [subscription, isStandaloneMode]);

  // Verifica limite de fichas
  const checkSheetLimitFn = useCallback((currentCount: number): boolean => {
    const limits = getLimits();
    if (limits.maxSheets === -1) return true;
    return currentCount < limits.maxSheets;
  }, [getLimits]);

  // Verifica limite de ingredientes
  const checkIngredientLimitFn = useCallback((currentCount: number): boolean => {
    const limits = getLimits();
    if (limits.maxCustomIngredients === -1) return true;
    return currentCount < limits.maxCustomIngredients;
  }, [getLimits]);

  const standaloneMode = isStandaloneMode();

  const value: UserContextType = {
    user,
    subscription,
    isAuthenticated: standaloneMode || (!!user && !!subscription?.isActive),
    isLoading,
    isStandaloneMode: standaloneMode,
    hasFeature: checkFeature,
    getPlanLimits: getLimits,
    checkSheetLimit: checkSheetLimitFn,
    checkIngredientLimit: checkIngredientLimitFn,
    updateUser: setUser,
    updateSubscription: setSubscription,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}

