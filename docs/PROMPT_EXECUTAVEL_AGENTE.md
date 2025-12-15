# 🤖 PROMPT EXECUTÁVEL PARA AGENTE
## Integração do Módulo de Fichas Técnicas no App Mãe

---

## 🎯 INSTRUÇÕES PARA O AGENTE

Você é um agente especializado em integração de módulos React. Sua tarefa é **INTEGRAR** o módulo de Fichas Técnicas dentro do aplicativo principal "Meu Chef Digital" usando o método **IFRAME**.

**IMPORTANTE**: 
- Execute TODOS os passos na ordem exata
- Valide cada passo antes de prosseguir
- Use os caminhos e códigos EXATOS fornecidos
- Não pule nenhuma etapa

---

## 📍 CONTEXTO DO MÓDULO

**Localização do Módulo**:
```
C:\Users\Paulo Aguiar\ficha tecnica\chef-s-secret-formula-50-1\
```

**Estrutura Relevante do Módulo**:
```
src/
├── App.tsx                          # App principal com BrowserRouter
├── contexts/
│   └── UserContext.tsx               # Recebe: { type: 'AUTH_UPDATE', user: {...}, subscription: {...} }
├── lib/
│   └── features.ts                   # Features: 'export_pdf', 'simulator', 'analytics', etc.
└── services/
    └── api.ts                        # Recebe token via postMessage: { type: 'SET_TOKEN', token: '...' }
```

**Rotas do Módulo** (base path: `/`):
- `/` - Página inicial
- `/ficha-tecnica` - Lista de fichas
- `/ficha-tecnica/nova` - Nova ficha
- `/ficha-tecnica/:id` - Editar ficha
- `/ficha-tecnica/ingredientes` - Ingredientes
- `/configuracoes/custos` - Configurações
- `/dashboard` - Dashboard (requer `analytics`)
- `/simulador` - Simulador (requer `simulator`)

**Features do Módulo** (valores exatos):
```typescript
'export_pdf'
'custom_ingredients'
'price_history'
'simulator'
'analytics'
'unlimited_sheets'
'bulk_import'
'api_access'
'white_label'
'priority_support'
```

**Planos do Módulo** (valores exatos):
```typescript
'free' | 'basic' | 'pro' | 'enterprise'
```

---

## 🔍 PASSO 0: ANÁLISE DO APP MÃE

**OBJETIVO**: Entender a estrutura do app mãe antes de começar.

### Ação 0.1: Identificar Localização
```bash
# Execute no diretório do app mãe
pwd
# Anote o caminho completo
```

### Ação 0.2: Analisar Estrutura
```bash
# Listar estrutura
ls -la

# Verificar se existe src/
ls -la src/

# Verificar componentes
ls -la src/components/

# Verificar hooks
find src/ -name "*.ts" -o -name "*.tsx" | grep -i "hook" | head -10

# Verificar sistema de autenticação
find src/ -type f \( -name "*user*" -o -name "*auth*" -o -name "*subscription*" \) | head -10
```

### Ação 0.3: Identificar Hooks de Usuário
**COMANDO**:
```bash
# Procurar hooks relacionados a usuário
grep -r "useUser\|useAuth\|useSubscription" src/ --include="*.ts" --include="*.tsx" | head -10
```

**RESULTADO ESPERADO**: Identificar onde estão:
- Hook de usuário (ex: `useUser()`, `useAuth()`)
- Hook de assinatura (ex: `useSubscription()`)
- Interface do usuário
- Interface de assinatura

### Ação 0.4: Identificar Sistema de Rotas
**COMANDO**:
```bash
# Procurar arquivo principal de rotas
grep -r "Routes\|BrowserRouter" src/ --include="*.tsx" | head -5
```

**RESULTADO ESPERADO**: Identificar:
- Arquivo principal de rotas (ex: `src/App.tsx`, `src/routes.tsx`)
- Como as rotas estão estruturadas

### Ação 0.5: Identificar Menu/Navegação
**COMANDO**:
```bash
# Procurar componente de navegação
find src/ -name "*Nav*" -o -name "*Menu*" -o -name "*Header*" | head -5
```

**RESULTADO ESPERADO**: Identificar onde adicionar link para o módulo.

---

## 📝 PASSO 1: CRIAR COMPONENTE WRAPPER

### Ação 1.1: Criar Diretório
**COMANDO**:
```bash
# No diretório do app mãe
mkdir -p src/components/modules
```

### Ação 1.2: Criar Arquivo do Componente
**ARQUIVO**: `src/components/modules/FichasTecnicasModule.tsx`

**CÓDIGO COMPLETO** (copie EXATAMENTE):

```typescript
/**
 * Componente Wrapper para Módulo de Fichas Técnicas
 * 
 * Integra o módulo via iframe e gerencia comunicação via postMessage.
 * 
 * @module components/modules/FichasTecnicasModule
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// ============================================
// INTERFACES (DEVE corresponder ao módulo)
// ============================================

export interface FichasUser {
  id: string;
  name: string;
  email: string;
  businessId: string;
  avatar?: string;
}

export interface FichasSubscription {
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  features: string[]; // Array de features do módulo
  expiresAt: string; // ISO date: '2025-12-31'
  isActive: boolean;
  trialEndsAt?: string; // ISO date opcional
}

export interface FichasTecnicasModuleProps {
  userId: string;
  userEmail: string;
  userName: string;
  businessId: string;
  userAvatar?: string;
  subscription: FichasSubscription;
  moduleUrl?: string;
  height?: string;
  onUpgradeRequest?: () => void;
  onAnalyticsEvent?: (event: string, data: any) => void;
}

// ============================================
// CONSTANTES
// ============================================

const DEFAULT_MODULE_URL = 
  import.meta.env.VITE_FICHAS_MODULE_URL || 
  process.env.REACT_APP_FICHAS_MODULE_URL ||
  'http://localhost:8080';

// ⚠️ CRÍTICO: Ajuste em produção
const ALLOWED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:5173',
  'https://fichas.meuchef.digital', // AJUSTE conforme seu deploy
];

// ============================================
// COMPONENTE
// ============================================

export function FichasTecnicasModule({
  userId,
  userEmail,
  userName,
  businessId,
  userAvatar,
  subscription,
  moduleUrl = DEFAULT_MODULE_URL,
  height = '100vh',
  onUpgradeRequest,
  onAnalyticsEvent,
}: FichasTecnicasModuleProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preparar dados
  const userData: FichasUser = {
    id: userId,
    name: userName,
    email: userEmail,
    businessId,
    ...(userAvatar && { avatar: userAvatar }),
  };

  const subscriptionData: FichasSubscription = {
    plan: subscription.plan,
    features: subscription.features,
    expiresAt: subscription.expiresAt,
    isActive: subscription.isActive,
    ...(subscription.trialEndsAt && { trialEndsAt: subscription.trialEndsAt }),
  };

  // Enviar dados para o módulo
  const sendAuthData = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    try {
      iframe.contentWindow.postMessage(
        {
          type: 'AUTH_UPDATE',
          user: userData,
          subscription: subscriptionData,
        },
        '*' // ⚠️ Em produção, use domínio específico
      );
      console.log('[FichasTecnicasModule] Dados enviados ao módulo');
    } catch (error) {
      console.error('[FichasTecnicasModule] Erro:', error);
      setError('Erro ao comunicar com o módulo');
    }
  }, [userData, subscriptionData]);

  // Listener de mensagens
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // ⚠️ DESCOMENTAR EM PRODUÇÃO:
      // if (!ALLOWED_ORIGINS.some(origin => event.origin.includes(origin))) {
      //   console.warn('Origem não autorizada:', event.origin);
      //   return;
      // }

      const { type, ...data } = event.data || {};

      switch (type) {
        case 'REQUEST_USER_DATA':
          sendAuthData();
          break;

        case 'UPGRADE_REQUEST':
          if (onUpgradeRequest) {
            onUpgradeRequest();
          } else {
            window.location.href = '/upgrade';
          }
          break;

        case 'ANALYTICS_EVENT':
          if (onAnalyticsEvent) {
            onAnalyticsEvent(data.event, data.data);
          }
          break;

        case 'NAVIGATE':
          if (data.path) {
            // window.location.href = data.path;
            // OU use seu sistema de navegação
          }
          break;

        case 'ERROR':
          console.error('[FichasTecnicasModule] Erro do módulo:', data.message);
          setError(data.message || 'Erro no módulo');
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [sendAuthData, onUpgradeRequest, onAnalyticsEvent]);

  // Enviar dados quando iframe carregar
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      setIsReady(true);
      setError(null);
      setTimeout(() => sendAuthData(), 500);
    };

    iframe.addEventListener('load', handleLoad);
    if (iframe.contentDocument?.readyState === 'complete') {
      handleLoad();
    }

    return () => iframe.removeEventListener('load', handleLoad);
  }, [sendAuthData, moduleUrl]);

  // Re-enviar quando dados mudarem
  useEffect(() => {
    if (isReady) {
      sendAuthData();
    }
  }, [userId, userEmail, userName, businessId, subscription, isReady, sendAuthData]);

  // Render
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <div className="text-center space-y-4">
          <div className="text-destructive text-lg font-semibold">Erro ao carregar módulo</div>
          <div className="text-muted-foreground text-sm">{error}</div>
          <button
            onClick={() => {
              setError(null);
              setIsReady(false);
              if (iframeRef.current) {
                iframeRef.current.src = iframeRef.current.src;
              }
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative" style={{ minHeight: height }}>
      <iframe
        ref={iframeRef}
        src={moduleUrl}
        className="w-full h-full border-0"
        title="Módulo de Fichas Técnicas"
        allow="clipboard-read; clipboard-write"
        style={{ minHeight: height, display: isReady ? 'block' : 'none' }}
        loading="lazy"
      />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <div className="text-muted-foreground">Carregando módulo...</div>
          </div>
        </div>
      )}
    </div>
  );
}
```

**VALIDAÇÃO**:
```bash
# Verificar se arquivo foi criado
ls -la src/components/modules/FichasTecnicasModule.tsx

# Verificar se compila
npm run build 2>&1 | grep -i "error\|FichasTecnicasModule" | head -10
```

---

## 📝 PASSO 2: CRIAR HOOK DE INTEGRAÇÃO

### Ação 2.1: Criar Diretório de Hooks (se não existir)
```bash
mkdir -p src/hooks
```

### Ação 2.2: Criar Arquivo do Hook
**ARQUIVO**: `src/hooks/useFichasTecnicas.ts`

**CÓDIGO COMPLETO**:

```typescript
/**
 * Hook para facilitar integração com módulo de Fichas Técnicas
 * 
 * @module hooks/useFichasTecnicas
 */

import { useMemo } from 'react';
import type { FichasUser, FichasSubscription } from '@/components/modules/FichasTecnicasModule';

// ⚠️ AJUSTE: Substitua pelas interfaces reais do seu app
interface AppUser {
  id: string;
  name: string;
  email: string;
  businessId: string;
  avatar?: string;
}

interface AppSubscription {
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  features: string[];
  expiresAt: string;
  isActive: boolean;
  trialEndsAt?: string;
}

/**
 * Mapeia features do app mãe para features do módulo
 * 
 * ⚠️ CRÍTICO: Ajuste este mapeamento conforme seu sistema
 * 
 * Features do módulo (valores exatos):
 * - 'export_pdf'
 * - 'custom_ingredients'
 * - 'price_history'
 * - 'simulator'
 * - 'analytics'
 * - 'unlimited_sheets'
 */
function mapFeaturesToModule(appFeatures: string[]): string[] {
  // Exemplo: Se seu app usa 'pdf_export', mapeia para 'export_pdf'
  const featureMap: Record<string, string> = {
    // AJUSTE: Mapeie suas features para as do módulo
    // 'pdf_export': 'export_pdf',
    // 'custom_ing': 'custom_ingredients',
    // Se já usa os mesmos nomes, não precisa mapear
  };

  const moduleFeatures: string[] = [];

  appFeatures.forEach(feature => {
    if (featureMap[feature]) {
      moduleFeatures.push(featureMap[feature]);
    } else {
      // Se não há mapeamento, assume que é o mesmo nome
      moduleFeatures.push(feature);
    }
  });

  return moduleFeatures;
}

interface UseFichasTecnicasProps {
  user: AppUser | null;
  subscription: AppSubscription | null;
}

interface UseFichasTecnicasReturn {
  userData: FichasUser | null;
  subscriptionData: FichasSubscription | null;
  isReady: boolean;
  moduleUrl: string;
}

export function useFichasTecnicas({
  user,
  subscription,
}: UseFichasTecnicasProps): UseFichasTecnicasReturn {
  const moduleUrl = useMemo(() => {
    return (
      import.meta.env.VITE_FICHAS_MODULE_URL ||
      process.env.REACT_APP_FICHAS_MODULE_URL ||
      'http://localhost:8080'
    );
  }, []);

  const userData = useMemo<FichasUser | null>(() => {
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      businessId: user.businessId,
      ...(user.avatar && { avatar: user.avatar }),
    };
  }, [user]);

  const subscriptionData = useMemo<FichasSubscription | null>(() => {
    if (!subscription) return null;
    return {
      plan: subscription.plan,
      features: mapFeaturesToModule(subscription.features),
      expiresAt: subscription.expiresAt,
      isActive: subscription.isActive,
      ...(subscription.trialEndsAt && { trialEndsAt: subscription.trialEndsAt }),
    };
  }, [subscription]);

  const isReady = useMemo(() => {
    return !!(userData && subscriptionData && subscriptionData.isActive);
  }, [userData, subscriptionData]);

  return { userData, subscriptionData, isReady, moduleUrl };
}
```

**VALIDAÇÃO**:
```bash
ls -la src/hooks/useFichasTecnicas.ts
```

---

## 📝 PASSO 3: CRIAR PÁGINA DE INTEGRAÇÃO

### Ação 3.1: Criar Arquivo da Página
**ARQUIVO**: `src/pages/FichasTecnicasPage.tsx`

**CÓDIGO COMPLETO**:

```typescript
/**
 * Página de Integração do Módulo de Fichas Técnicas
 * 
 * @module pages/FichasTecnicasPage
 */

import { Navigate } from 'react-router-dom';
import { FichasTecnicasModule } from '@/components/modules/FichasTecnicasModule';
import { useFichasTecnicas } from '@/hooks/useFichasTecnicas';

// ⚠️ AJUSTE: Importe seus hooks reais
// Exemplo:
// import { useUser } from '@/hooks/useUser';
// import { useSubscription } from '@/hooks/useSubscription';

export function FichasTecnicasPage() {
  // ⚠️ AJUSTE: Use seus hooks reais de usuário e assinatura
  // const { user } = useUser();
  // const { subscription } = useSubscription();

  // ⚠️ TEMPORÁRIO: Para teste, use dados mock
  // REMOVA após integrar com seus hooks reais
  const user = {
    id: 'user-123',
    name: 'Usuário Teste',
    email: 'teste@example.com',
    businessId: 'business-456',
  };

  const subscription = {
    plan: 'pro' as const,
    features: ['export_pdf', 'simulator', 'analytics', 'custom_ingredients', 'unlimited_sheets'],
    expiresAt: '2025-12-31',
    isActive: true,
  };

  const { userData, subscriptionData, isReady, moduleUrl } = useFichasTecnicas({
    user,
    subscription,
  });

  // Redireciona se não autenticado
  if (!user || !subscription) {
    return <Navigate to="/login" replace />;
  }

  // Loading state
  if (!isReady || !userData || !subscriptionData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <div className="text-muted-foreground">Carregando módulo...</div>
        </div>
      </div>
    );
  }

  return (
    <FichasTecnicasModule
      userId={userData.id}
      userEmail={userData.email}
      userName={userData.name}
      businessId={userData.businessId}
      userAvatar={userData.avatar}
      subscription={subscriptionData}
      moduleUrl={moduleUrl}
      onUpgradeRequest={() => {
        // ⚠️ AJUSTE: Use seu sistema de navegação
        window.location.href = '/upgrade';
        // OU: navigate('/upgrade');
      }}
      onAnalyticsEvent={(event, data) => {
        // ⚠️ AJUSTE: Integre com seu sistema de analytics
        console.log('[Analytics]', event, data);
        // Exemplo: analytics.track(event, data);
      }}
    />
  );
}
```

**VALIDAÇÃO**:
```bash
ls -la src/pages/FichasTecnicasPage.tsx
```

---

## 📝 PASSO 4: ADICIONAR ROTA NO APP MÃE

### Ação 4.1: Localizar Arquivo de Rotas
**COMANDO**:
```bash
# Encontrar arquivo principal de rotas
grep -r "Routes\|BrowserRouter" src/ --include="*.tsx" -l | head -1
```

**ARQUIVO TÍPICO**: `src/App.tsx` ou `src/routes.tsx` ou `src/main.tsx`

### Ação 4.2: Adicionar Import
**LOCALIZAÇÃO**: No topo do arquivo, após outros imports

**CÓDIGO A ADICIONAR**:
```typescript
import { FichasTecnicasPage } from '@/pages/FichasTecnicasPage';
// OU se não criou a página:
// import { FichasTecnicasModule } from '@/components/modules/FichasTecnicasModule';
```

### Ação 4.3: Adicionar Rota
**LOCALIZAÇÃO**: Dentro de `<Routes>`, ANTES da rota catch-all `*`

**CÓDIGO A ADICIONAR**:
```typescript
<Route
  path="/fichas-tecnicas/*"
  element={<FichasTecnicasPage />}
/>
```

**EXEMPLO COMPLETO** (se usar App.tsx):
```typescript
<Routes>
  {/* Suas rotas existentes */}
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/settings" element={<Settings />} />
  
  {/* NOVA ROTA - Adicione aqui */}
  <Route
    path="/fichas-tecnicas/*"
    element={<FichasTecnicasPage />}
  />
  
  {/* Rota catch-all deve ser a última */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

**VALIDAÇÃO**:
```bash
# Verificar se compila
npm run build 2>&1 | grep -i "error\|FichasTecnicas" | head -10
```

---

## 📝 PASSO 5: CONFIGURAR VARIÁVEIS DE AMBIENTE

### Ação 5.1: Criar/Modificar .env
**ARQUIVO**: `.env` (na raiz do app mãe)

**CÓDIGO A ADICIONAR**:
```env
# URL do módulo de Fichas Técnicas
# Desenvolvimento
VITE_FICHAS_MODULE_URL=http://localhost:8080

# Produção (descomente e ajuste quando fizer deploy)
# VITE_FICHAS_MODULE_URL=https://fichas.meuchef.digital
```

**VALIDAÇÃO**:
```bash
# Verificar se arquivo existe e tem a variável
grep "VITE_FICHAS_MODULE_URL" .env
```

---

## 📝 PASSO 6: ADICIONAR LINK NO MENU

### Ação 6.1: Localizar Componente de Menu
**COMANDO**:
```bash
# Encontrar componente de navegação
find src/ -name "*Nav*" -o -name "*Menu*" -o -name "*Header*" | grep -v node_modules | head -3
```

### Ação 6.2: Adicionar Item no Menu
**LOCALIZAÇÃO**: Onde estão os outros itens de navegação

**CÓDIGO A ADICIONAR**:
```typescript
// Import (se necessário)
import { FileText } from 'lucide-react'; // ou seu sistema de ícones

// No array de itens do menu ou JSX:
{
  href: '/fichas-tecnicas',
  label: 'Fichas Técnicas',
  icon: FileText, // ou seu componente de ícone
}
```

**EXEMPLO** (se menu é array):
```typescript
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart },
  { href: '/settings', label: 'Configurações', icon: Settings },
  // ADICIONE AQUI:
  { href: '/fichas-tecnicas', label: 'Fichas Técnicas', icon: FileText },
];
```

**VALIDAÇÃO**:
```bash
# Verificar se link foi adicionado
grep -r "fichas-tecnicas" src/components/ --include="*.tsx" | head -3
```

---

## 📝 PASSO 7: INTEGRAR COM HOOKS REAIS DO APP MÃE

### Ação 7.1: Identificar Hooks Reais
**COMANDO**:
```bash
# Encontrar hooks de usuário
grep -r "export.*useUser\|export.*useAuth" src/ --include="*.ts" --include="*.tsx" | head -5

# Encontrar hooks de assinatura
grep -r "export.*useSubscription\|export.*usePlan" src/ --include="*.ts" --include="*.tsx" | head -5
```

### Ação 7.2: Modificar FichasTecnicasPage.tsx
**ARQUIVO**: `src/pages/FichasTecnicasPage.tsx`

**AÇÃO**: Substituir dados mock pelos hooks reais:

```typescript
// REMOVER dados mock:
// const user = { id: '...', ... };
// const subscription = { plan: '...', ... };

// ADICIONAR imports reais:
import { useUser } from '@/hooks/useUser'; // Ajuste o caminho
import { useSubscription } from '@/hooks/useSubscription'; // Ajuste o caminho

// USAR hooks reais:
export function FichasTecnicasPage() {
  const { user } = useUser();
  const { subscription } = useSubscription();
  
  // ... resto do código
}
```

### Ação 7.3: Ajustar Mapeamento de Features
**ARQUIVO**: `src/hooks/useFichasTecnicas.ts`

**AÇÃO**: Ajustar função `mapFeaturesToModule` conforme suas features:

```typescript
function mapFeaturesToModule(appFeatures: string[]): string[] {
  // ⚠️ AJUSTE: Mapeie suas features para as do módulo
  const featureMap: Record<string, string> = {
    // Exemplo:
    // 'meu_app_pdf': 'export_pdf',
    // 'meu_app_simulador': 'simulator',
    // Se já usa os mesmos nomes, deixe vazio
  };

  // ... resto da função
}
```

**VALIDAÇÃO**:
```bash
# Verificar se compila
npm run build 2>&1 | grep -i "error" | head -10
```

---

## 📝 PASSO 8: TESTAR INTEGRAÇÃO LOCAL

### Ação 8.1: Iniciar Módulo (Terminal 1)
**COMANDO**:
```bash
cd "C:\Users\Paulo Aguiar\ficha tecnica\chef-s-secret-formula-50-1"
npm run dev
```

**RESULTADO ESPERADO**: Módulo rodando em `http://localhost:8080`

### Ação 8.2: Iniciar App Mãe (Terminal 2)
**COMANDO**:
```bash
# No diretório do app mãe
npm run dev
```

### Ação 8.3: Testar Carregamento
**AÇÃO**:
1. Acesse `http://localhost:[PORTA_DO_APP_MAE]/fichas-tecnicas`
2. Abra DevTools → Console
3. Verifique mensagens:
   - `[FichasTecnicasModule] Dados enviados ao módulo`
   - Não deve haver erros

### Ação 8.4: Testar Autenticação
**AÇÃO**:
1. No console do módulo (iframe), verifique se usuário está logado
2. Tente criar uma ficha técnica
3. Deve funcionar normalmente

### Ação 8.5: Testar Feature Flags
**AÇÃO**:
1. Com plano "free", tente acessar `/dashboard` no módulo
2. Deve mostrar tela de upgrade
3. Com plano "pro", deve funcionar

### Ação 8.6: Testar Comunicação
**AÇÃO**:
1. No console do módulo, execute:
   ```javascript
   window.parent.postMessage({ type: 'UPGRADE_REQUEST' }, '*');
   ```
2. App mãe deve redirecionar para `/upgrade`

**VALIDAÇÃO**:
- [ ] Módulo carrega
- [ ] Dados são enviados
- [ ] Feature flags funcionam
- [ ] Comunicação funciona

---

## 📝 PASSO 9: CONFIGURAR PARA PRODUÇÃO

### Ação 9.1: Build do Módulo
**COMANDO**:
```bash
cd "C:\Users\Paulo Aguiar\ficha tecnica\chef-s-secret-formula-50-1"
npm run build
```

**RESULTADO**: Pasta `dist/` criada

### Ação 9.2: Deploy do Módulo
**ESCOLHA UMA OPÇÃO**:

**Opção A: Mesmo domínio**
```bash
# Copiar dist/ para servidor em /fichas-tecnicas/
# URL: https://app.meuchef.digital/fichas-tecnicas/
```

**Opção B: Subdomínio**
```bash
# Deploy em subdomínio
# URL: https://fichas.meuchef.digital/
```

**Opção C: Vercel**
```bash
cd "C:\Users\Paulo Aguiar\ficha tecnica\chef-s-secret-formula-50-1"
vercel deploy --prod
```

### Ação 9.3: Atualizar Variáveis de Ambiente
**ARQUIVO**: `.env.production` (app mãe)

**CÓDIGO**:
```env
VITE_FICHAS_MODULE_URL=https://fichas.meuchef.digital
# OU se mesmo domínio:
# VITE_FICHAS_MODULE_URL=https://app.meuchef.digital/fichas-tecnicas
```

### Ação 9.4: Ativar Validação de Origem
**ARQUIVO**: `src/components/modules/FichasTecnicasModule.tsx`

**AÇÃO**: Descomentar validação:

```typescript
const handleMessage = (event: MessageEvent) => {
  // ✅ DESCOMENTAR ESTA LINHA:
  if (!ALLOWED_ORIGINS.some(origin => event.origin.includes(origin))) {
    console.warn('[FichasTecnicasModule] Mensagem de origem não autorizada:', event.origin);
    return;
  }
  // ... resto do código
};
```

**E ATUALIZAR ALLOWED_ORIGINS**:
```typescript
const ALLOWED_ORIGINS = [
  'https://fichas.meuchef.digital', // URL de produção
  'https://app.meuchef.digital', // Se mesmo domínio
];
```

**VALIDAÇÃO**:
- [ ] Módulo buildado
- [ ] Módulo deployado
- [ ] URL de produção configurada
- [ ] Validação de origem ativada

---

## 📝 PASSO 10: VALIDAÇÃO FINAL

### Checklist de Validação

**Funcionalidade**:
- [ ] Módulo carrega no iframe
- [ ] Dados do usuário são enviados
- [ ] Assinatura é enviada corretamente
- [ ] Feature flags funcionam
- [ ] Limites por plano funcionam
- [ ] Navegação funciona

**Comunicação**:
- [ ] PostMessage funciona (app mãe → módulo)
- [ ] PostMessage funciona (módulo → app mãe)
- [ ] Validação de origem configurada
- [ ] Erros são tratados

**Integração**:
- [ ] Rota adicionada
- [ ] Link no menu funciona
- [ ] Proteção de autenticação funciona
- [ ] Loading states funcionam

**Produção**:
- [ ] Módulo buildado
- [ ] Módulo deployado
- [ ] URL de produção configurada
- [ ] CORS configurado (se necessário)
- [ ] Validação de origem ativada

---

## 🐛 TROUBLESHOOTING ESPECÍFICO

### Erro: "Cannot find module '@/components/modules/FichasTecnicasModule'"
**Solução**:
1. Verifique se arquivo existe: `ls src/components/modules/FichasTecnicasModule.tsx`
2. Verifique path alias no `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

### Erro: "Iframe não carrega"
**Solução**:
1. Verifique URL: `echo $VITE_FICHAS_MODULE_URL`
2. Teste URL diretamente no navegador
3. Verifique CORS no servidor do módulo
4. Verifique console do navegador

### Erro: "PostMessage não funciona"
**Solução**:
1. Verifique se iframe carregou: `iframe.contentWindow`
2. Adicione logs:
   ```typescript
   console.log('Enviando:', { type: 'AUTH_UPDATE', user, subscription });
   ```
3. Verifique formato da mensagem
4. Verifique origem (descomente validação)

### Erro: "Feature flags não funcionam"
**Solução**:
1. Verifique mapeamento de features
2. Verifique formato da subscription:
   ```typescript
   console.log('Subscription:', subscription);
   ```
3. Verifique features do módulo: `src/lib/features.ts`
4. Teste com diferentes planos

---

## 📋 RESUMO DE ARQUIVOS CRIADOS

1. ✅ `src/components/modules/FichasTecnicasModule.tsx`
2. ✅ `src/hooks/useFichasTecnicas.ts`
3. ✅ `src/pages/FichasTecnicasPage.tsx`
4. ✅ `.env` (modificado)
5. ✅ `src/App.tsx` (modificado - rota adicionada)
6. ✅ Menu/Navegação (modificado - link adicionado)

---

## 🎯 ORDEM DE EXECUÇÃO (CRÍTICO)

Execute EXATAMENTE nesta ordem:

1. ✅ Passo 0: Análise do app mãe
2. ✅ Passo 1: Criar componente wrapper
3. ✅ Passo 2: Criar hook de integração
4. ✅ Passo 3: Criar página de integração
5. ✅ Passo 4: Adicionar rota
6. ✅ Passo 5: Configurar variáveis de ambiente
7. ✅ Passo 6: Adicionar link no menu
8. ✅ Passo 7: Integrar com hooks reais
9. ✅ Passo 8: Testar localmente
10. ✅ Passo 9: Configurar produção
11. ✅ Passo 10: Validação final

---

## ⚠️ PONTOS CRÍTICOS

1. **Validação de Origem**: SEMPRE ative em produção
2. **Mapeamento de Features**: Ajuste conforme seu sistema
3. **Formato de Dados**: Deve corresponder exatamente às interfaces do módulo
4. **URL do Módulo**: Configure corretamente para cada ambiente
5. **Hooks Reais**: Substitua dados mock pelos hooks reais do app mãe

---

**FIM DO PROMPT**

Execute cada passo na ordem, validando antes de prosseguir.

