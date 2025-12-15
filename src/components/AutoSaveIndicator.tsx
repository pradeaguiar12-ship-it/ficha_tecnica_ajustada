/**
 * Indicador de Salvamento Automático
 * 
 * Mostra o status de salvamento automático em formulários.
 * 
 * @module components/AutoSaveIndicator
 */

import { useEffect, useState } from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AutoSaveIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date;
  className?: string;
}

export function AutoSaveIndicator({
  status,
  lastSaved,
  className,
}: AutoSaveIndicatorProps) {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (status === 'saved') {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: Loader2,
          text: 'Salvando...',
          color: 'text-muted-foreground',
          animate: true,
        };
      case 'saved':
        return {
          icon: Check,
          text: showSaved ? 'Salvo' : lastSaved ? `Salvo ${formatLastSaved(lastSaved)}` : 'Salvo',
          color: 'text-emerald-600',
          animate: false,
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Erro ao salvar',
          color: 'text-destructive',
          animate: false,
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          'flex items-center gap-2 text-xs',
          config.color,
          className
        )}
      >
        <Icon
          className={cn(
            'h-3.5 w-3.5',
            config.animate && 'animate-spin'
          )}
        />
        <span>{config.text}</span>
      </motion.div>
    </AnimatePresence>
  );
}

function formatLastSaved(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 10) return 'agora';
  if (seconds < 60) return `há ${seconds}s`;
  if (minutes < 60) return `há ${minutes}min`;
  if (hours < 24) return `há ${hours}h`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

/**
 * Hook para gerenciar status de salvamento automático
 */
export function useAutoSave<T>(
  data: T,
  saveFn: (data: T) => Promise<void> | void,
  delay: number = 1000
) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | undefined>();

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setStatus('saving');
        await saveFn(data);
        setStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        setStatus('error');
        console.error('Erro ao salvar automaticamente:', error);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [data, saveFn, delay]);

  return { status, lastSaved };
}

