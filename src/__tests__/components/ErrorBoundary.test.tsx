import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Componente que lança erro para testar ErrorBoundary
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  it('deve renderizar children quando não há erro', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('deve exibir UI de erro quando há erro', () => {
    // Suprime console.error durante o teste
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Ops! Algo deu errado/i)).toBeInTheDocument();
    expect(screen.getByText(/Tentar Novamente/i)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('deve chamar onError callback quando fornecido', () => {
    const onError = vi.fn();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

