/**
 * Utilitários PWA
 * 
 * Gerencia registro do Service Worker e funcionalidades offline.
 * 
 * @module lib/pwa
 */

/**
 * Registra o Service Worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('[PWA] Service Workers não são suportados neste navegador');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[PWA] Service Worker registrado com sucesso:', registration.scope);

    // Verifica atualizações periodicamente
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[PWA] Nova versão disponível!');
            // Aqui você pode mostrar uma notificação para o usuário
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('[PWA] Erro ao registrar Service Worker:', error);
    return null;
  }
}

/**
 * Verifica se está online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Hook para monitorar status online/offline
 */
export function useOnlineStatus(callback: (isOnline: boolean) => void) {
  if (typeof window === 'undefined') return;

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Solicita instalação do PWA
 */
export async function promptInstall(): Promise<boolean> {
  // Verifica se há evento de beforeinstallprompt
  const deferredPrompt = (window as any).deferredPrompt;
  
  if (!deferredPrompt) {
    return false;
  }

  try {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('[PWA] Usuário aceitou instalar o app');
      return true;
    } else {
      console.log('[PWA] Usuário recusou instalar o app');
      return false;
    }
  } catch (error) {
    console.error('[PWA] Erro ao solicitar instalação:', error);
    return false;
  }
}

/**
 * Verifica se o app está instalado
 */
export function isInstalled(): boolean {
  // Verifica se está rodando como PWA instalado
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Verifica se está no iOS e foi adicionado à tela inicial
  if ((window.navigator as any).standalone === true) {
    return true;
  }

  return false;
}
