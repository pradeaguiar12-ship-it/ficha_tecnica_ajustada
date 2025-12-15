/**
 * Hook de Atalhos de Teclado
 * 
 * Gerencia atalhos de teclado globais do aplicativo.
 * 
 * @module hooks/useKeyboardShortcuts
 */

import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description?: string;
}

export interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  shortcuts: KeyboardShortcut[];
}

/**
 * Hook para gerenciar atalhos de teclado
 */
export function useKeyboardShortcuts({
  enabled = true,
  shortcuts,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignora se estiver digitando em input, textarea ou contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Permite alguns atalhos mesmo em inputs (ex: Cmd+S para salvar)
        const allowedInInputs = ['s', 'k'];
        if (!allowedInInputs.includes(e.key.toLowerCase())) {
          return;
        }
      }

      for (const shortcut of shortcuts) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const metaMatch = shortcut.metaKey ? e.metaKey || e.ctrlKey : true;
        const shiftMatch = shortcut.shiftKey === undefined ? true : e.shiftKey === shortcut.shiftKey;
        const altMatch = shortcut.altKey === undefined ? true : e.altKey === shortcut.altKey;

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled, shortcuts]);
}

/**
 * Hook simplificado para atalhos comuns
 */
export function useCommonShortcuts() {
  const navigate = useNavigate();

  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'n',
        metaKey: true,
        action: () => navigate('/ficha-tecnica/nova'),
        description: 'Nova ficha técnica',
      },
      {
        key: 'i',
        metaKey: true,
        action: () => navigate('/ficha-tecnica/ingredientes'),
        description: 'Gerenciar ingredientes',
      },
      {
        key: ',',
        metaKey: true,
        action: () => navigate('/configuracoes/custos'),
        description: 'Configurações',
      },
      {
        key: 'h',
        metaKey: true,
        action: () => navigate('/'),
        description: 'Ir para home',
      },
    ],
  });
}

