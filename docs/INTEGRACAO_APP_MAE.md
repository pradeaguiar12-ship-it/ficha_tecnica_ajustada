# 🔗 Guia de Integração com App Mãe

## Visão Geral

Este módulo de Fichas Técnicas foi preparado para integração com o aplicativo principal "Meu Chef Digital". Este documento descreve como integrar o módulo e como ele se comunica com o app mãe.

---

## 📡 Comunicação com App Mãe

### Método 1: PostMessage (Recomendado)

O módulo escuta mensagens do app mãe via `window.postMessage`:

```typescript
// App mãe envia dados do usuário
window.postMessage({
  type: 'USER_UPDATE',
  user: {
    id: 'user-123',
    name: 'Chef Edil',
    email: 'chef@example.com',
    businessId: 'business-456',
  }
}, '*');

// App mãe envia dados de assinatura
window.postMessage({
  type: 'SUBSCRIPTION_UPDATE',
  subscription: {
    plan: 'pro',
    features: ['export_pdf', 'simulator', 'analytics'],
    expiresAt: '2025-12-31',
    isActive: true,
  }
}, '*');

// Ou tudo de uma vez
window.postMessage({
  type: 'AUTH_UPDATE',
  user: { /* ... */ },
  subscription: { /* ... */ },
}, '*');
```

### Método 2: Props (Se embedado como componente)

```tsx
<UserProvider
  initialUser={user}
  initialSubscription={subscription}
  enablePostMessage={false}
>
  <App />
</UserProvider>
```

---

## 🔑 Feature Flags

O módulo usa feature flags para controlar acesso a funcionalidades baseado no plano:

```typescript
import { FEATURES } from '@/lib/features';

// Features disponíveis:
FEATURES.EXPORT_PDF          // Exportar PDF
FEATURES.CUSTOM_INGREDIENTS  // Ingredientes customizados
FEATURES.PRICE_HISTORY       // Histórico de preços
FEATURES.SIMULATOR           // Simulador de cenários
FEATURES.ANALYTICS           // Dashboard analítico
FEATURES.UNLIMITED_SHEETS    // Fichas ilimitadas
```

### Mapeamento de Planos

| Plano | Features |
|-------|----------|
| Free | `CUSTOM_INGREDIENTS` |
| Basic | `EXPORT_PDF`, `CUSTOM_INGREDIENTS`, `PRICE_HISTORY` |
| Pro | Todas do Basic + `SIMULATOR`, `ANALYTICS`, `UNLIMITED_SHEETS` |
| Enterprise | Todas as features |

---

## 🔐 Limites por Plano

| Plano | Max Fichas | Max Ingredientes | Storage |
|-------|------------|------------------|---------|
| Free | 5 | 10 | 10 MB |
| Basic | 50 | 100 | 100 MB |
| Pro | Ilimitado | Ilimitado | 500 MB |
| Enterprise | Ilimitado | Ilimitado | Ilimitado |

---

## 📡 API Service Layer

O módulo está preparado para usar API HTTP quando disponível:

### Configuração

```env
VITE_API_URL=https://api.meuchef.digital
VITE_USE_API=true
```

### Endpoints Esperados

```
GET    /sheets              - Lista todas as fichas
GET    /sheets/:id          - Busca ficha por ID
POST   /sheets              - Cria nova ficha
PATCH  /sheets/:id          - Atualiza ficha
DELETE /sheets/:id          - Exclui ficha

GET    /ingredients         - Lista ingredientes do usuário
POST   /ingredients         - Cria ingrediente
PATCH  /ingredients/:id     - Atualiza ingrediente
DELETE /ingredients/:id     - Exclui ingrediente

GET    /settings            - Busca configurações
PATCH  /settings             - Atualiza configurações
```

### Headers Esperados

```
Authorization: Bearer <token>
X-User-Id: <user-id>
Content-Type: application/json
```

---

## 🎯 Eventos Enviados ao App Mãe

O módulo pode enviar eventos para o app mãe:

```typescript
// Solicitar dados do usuário
window.parent.postMessage({ type: 'REQUEST_USER_DATA' }, '*');

// Solicitar upgrade
window.parent.postMessage({ type: 'UPGRADE_REQUEST' }, '*');

// Eventos de analytics (opcional)
window.parent.postMessage({
  type: 'ANALYTICS_EVENT',
  event: 'sheet_created',
  data: { sheetId: '...', category: '...' }
}, '*');
```

---

## 🛡️ Proteção de Rotas

Rotas protegidas por feature flags:

- `/dashboard` - Requer `FEATURES.ANALYTICS`
- `/simulador` - Requer `FEATURES.SIMULATOR`

Se o usuário não tiver acesso, verá uma tela de upgrade.

---

## 📝 Exemplo de Integração Completa

```typescript
// No app mãe
import { UserProvider } from '@fichas-tecnicas/contexts/UserContext';

function AppMae() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    // Carrega dados do usuário
    loadUserData().then(({ user, subscription }) => {
      setUser(user);
      setSubscription(subscription);
      
      // Envia para o módulo via postMessage
      const iframe = document.getElementById('fichas-module');
      iframe?.contentWindow?.postMessage({
        type: 'AUTH_UPDATE',
        user,
        subscription,
      }, '*');
    });
  }, []);

  return (
    <div>
      {/* Seu app principal */}
      <iframe
        id="fichas-module"
        src="/fichas-tecnicas"
        style={{ width: '100%', height: '100vh', border: 'none' }}
      />
    </div>
  );
}
```

---

## 🔄 Migração de localStorage para API

O módulo funciona com localStorage por padrão. Para migrar para API:

1. Configure `VITE_API_URL` e `VITE_USE_API=true`
2. O módulo automaticamente usará a API quando disponível
3. Fallback para localStorage se API falhar

---

## 📊 Analytics Events (Opcional)

Se quiser rastrear eventos no app mãe:

```typescript
// No módulo, eventos são enviados via postMessage
window.parent.postMessage({
  type: 'ANALYTICS_EVENT',
  event: 'sheet_created',
  data: { sheetId, category, cost, margin }
}, '*');
```

---

## 🚀 Próximos Passos

1. **Configurar API**: Defina `VITE_API_URL` quando a API estiver pronta
2. **Implementar postMessage**: Configure comunicação no app mãe
3. **Testar Feature Flags**: Verifique que funcionalidades são bloqueadas corretamente
4. **Configurar Analytics**: Implemente tracking de eventos se necessário

---

**Última atualização**: Dezembro 2024

