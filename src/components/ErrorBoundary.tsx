/**
 * Error Boundary Component
 * 
 * Captura erros JavaScript em qualquer lugar da árvore de componentes filhos,
 * registra esses erros e exibe uma UI de fallback.
 * 
 * @module components/ErrorBoundary
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log do erro para serviço de monitoramento (ex: Sentry)
    console.error('[ErrorBoundary] Erro capturado:', error, errorInfo);

    // Chama callback se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Atualiza estado com informações do erro
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Fallback customizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI padrão de erro
      return (
        <MainLayout>
          <div className="flex items-center justify-center min-h-[60vh] p-4">
            <Card className="max-w-2xl w-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <CardTitle>Ops! Algo deu errado</CardTitle>
                    <CardDescription>
                      Ocorreu um erro inesperado. Nossa equipe foi notificada.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm font-mono text-destructive mb-2">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <details className="text-xs text-muted-foreground">
                        <summary className="cursor-pointer mb-2">Stack Trace</summary>
                        <pre className="overflow-auto max-h-40">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={this.handleReset} variant="outline" className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar Novamente
                  </Button>
                  <Button onClick={this.handleReload} variant="outline" className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Recarregar Página
                  </Button>
                  <Button
                    onClick={() => (window.location.href = '/')}
                    variant="default"
                    className="flex-1"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Ir para Início
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Se o problema persistir, entre em contato com o suporte.
                </p>
              </CardContent>
            </Card>
          </div>
        </MainLayout>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook para usar Error Boundary em componentes funcionais
 * (Usar o componente ErrorBoundary diretamente é recomendado)
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

