/**
 * Utilitários de Toast com Undo
 * 
 * Fornece funções para exibir toasts com ação de desfazer.
 * 
 * @module lib/toast-utils
 */

import { toast } from 'sonner';

interface ToastWithUndoOptions {
  message: string;
  undoAction: () => void;
  duration?: number;
}

/**
 * Exibe um toast com opção de desfazer
 */
export function toastWithUndo({
  message,
  undoAction,
  duration = 5000,
}: ToastWithUndoOptions) {
  const toastId = toast.success(message, {
    duration,
    action: {
      label: 'Desfazer',
      onClick: () => {
        undoAction();
        toast.dismiss(toastId);
        toast.info('Ação desfeita');
      },
    },
  });

  return toastId;
}

/**
 * Toast de exclusão com undo
 */
export function toastDeleteWithUndo(
  itemName: string,
  undoAction: () => void
) {
  return toastWithUndo({
    message: `${itemName} excluído com sucesso`,
    undoAction,
  });
}

/**
 * Toast de salvamento com indicador
 */
export function toastSave(status: 'saving' | 'saved' | 'error', message?: string) {
  switch (status) {
    case 'saving':
      return toast.loading(message || 'Salvando...', { id: 'save-status' });
    case 'saved':
      return toast.success(message || 'Salvo com sucesso!', {
        id: 'save-status',
        duration: 2000,
      });
    case 'error':
      return toast.error(message || 'Erro ao salvar. Tente novamente.', {
        id: 'save-status',
      });
  }
}

/**
 * Toast de sucesso com animação
 */
export function toastSuccess(message: string, duration = 3000) {
  return toast.success(message, {
    duration,
    style: {
      animation: 'slide-in-right 0.3s ease-out',
    },
  });
}

/**
 * Toast de erro com detalhes
 */
export function toastError(message: string, error?: Error) {
  return toast.error(message, {
    description: error?.message,
    duration: 5000,
  });
}

