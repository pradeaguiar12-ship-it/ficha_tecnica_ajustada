/**
 * Feature Guard Component
 * 
 * Protege componentes/páginas baseado em feature flags.
 * Mostra mensagem ou redireciona se a feature não estiver disponível.
 * 
 * @module components/FeatureGuard
 */

import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Feature } from '@/lib/features';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';

interface FeatureGuardProps {
  feature: Feature;
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
  showUpgradeMessage?: boolean;
}

export function FeatureGuard({
  feature,
  children,
  fallback,
  redirectTo,
  showUpgradeMessage = true,
}: FeatureGuardProps) {
  const { hasFeature, subscription, isStandaloneMode } = useUser();
  const navigate = useNavigate();

  // Em modo standalone, sempre permite acesso
  if (isStandaloneMode || hasFeature(feature)) {
    return <>{children}</>;
  }

  // Redireciona se especificado
  if (redirectTo) {
    navigate(redirectTo);
    return null;
  }

  // Fallback customizado
  if (fallback) {
    return <>{fallback}</>;
  }

  // Mensagem padrão de upgrade (apenas se não estiver em modo standalone)
  if (showUpgradeMessage && !isStandaloneMode) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle>Funcionalidade Premium</CardTitle>
                  <CardDescription>
                    Esta funcionalidade não está disponível no seu plano atual
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Para acessar esta funcionalidade, faça upgrade para um plano superior.
              </p>
              {subscription && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Plano Atual</p>
                  <p className="font-semibold capitalize">{subscription.plan}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate(-1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button variant="gradient" onClick={() => {
                  // Envia mensagem para o app mãe solicitar upgrade
                  if (window.parent !== window) {
                    window.parent.postMessage({ type: 'UPGRADE_REQUEST' }, '*');
                  } else {
                    // Se não está em iframe, apenas volta
                    navigate(-1);
                  }
                }}>
                  Fazer Upgrade
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return null;
}

