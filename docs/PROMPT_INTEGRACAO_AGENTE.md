# 🤖 PROMPT PARA AGENTE: Integração do Módulo de Fichas Técnicas no App Mãe

## 📋 CONTEXTO E OBJETIVO

Você é um agente especializado em integração de módulos React. Sua tarefa é integrar o módulo de Fichas Técnicas (que está no repositório `chef-s-secret-formula-50-1`) dentro do aplicativo principal "Meu Chef Digital".

**Método escolhido**: Iframe (Método 1) - Mais simples e recomendado para início.

---

## 🎯 TAREFA PRINCIPAL

Criar um componente wrapper no app mãe que:
1. Renderiza o módulo em um iframe
2. Envia dados do usuário e assinatura via postMessage
3. Recebe e processa mensagens do módulo
4. Integra com o sistema de rotas do app mãe

---

## 📁 ESTRUTURA DO MÓDULO (REFERÊNCIA)

O módulo está localizado em:
```
C:\Users\Paulo Aguiar\ficha tecnica\chef-s-secret-formula-50-1\
```

**Estrutura relevante do módulo**:
```
src/
├── App.tsx                    # App principal com rotas
├── contexts/
│   └── UserContext.tsx        # Contexto que recebe dados via postMessage
├── lib/
│   └── features.ts            # Feature flags e limites por plano
└── services/
    └── api.ts                 # API service (preparado para token)
```

**Rotas do módulo**:
- `/` - Página inicial
- `/ficha-tecnica` - Lista de fichas
- `/ficha-tecnica/nova` - Nova ficha
- `/ficha-tecnica/:id` - Editar ficha
- `/ficha-tecnica/ingredientes` - Ingredientes
- `/configuracoes/custos` - Configurações
- `/dashboard` - Dashboard (requer FEATURES.ANALYTICS)
- `/simulador` - Simulador (requer FEATURES.SIMULATOR)

---

## 🔧 PASSO 1: IDENTIFICAR ESTRUTURA DO APP MÃE

**AÇÃO**: Analise a estrutura do app mãe para entender:
1. Onde está localizado o repositório do app mãe
2. Qual a estrutura de pastas (`src/`, `components/`, etc.)
3. Como o roteamento está configurado
4. Onde estão os hooks de usuário e assinatura
5. Qual sistema de autenticação está sendo usado

**COMANDOS PARA EXECUTAR**:
```bash
# Listar estrutura do diretório atual (app mãe)
ls -la

# Verificar se existe src/
ls -la src/

# Verificar estrutura de componentes
ls -la src/components/

# Verificar rotas
grep -r "Routes\|Route" src/ --include="*.tsx" --include="*.ts" | head -20

# Verificar hooks de usuário
find src/ -name "*user*" -o -name "*auth*" -o -name "*subscription*" | head -10
```

**RESULTADO ESPERADO**: Identificar caminhos exatos e estrutura do app mãe.

---

## 🔧 PASSO 2: CRIAR COMPONENTE WRAPPER

**ARQUIVO A CRIAR**: `src/components/modules/FichasTecnicasModule.tsx`

**CÓDIGO COMPLETO** (copie exatamente):

```typescript
/**
 * Componente Wrapper para Módulo de Fichas Técnicas
 * 
 * Integra o módulo de Fichas Técnicas via iframe e gerencia
 * comunicação via postMessage com o app mãe.
 * 
 * @module components/modules/FichasTecnicasModule
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// ============================================
// INTERFACES
// ============================================

/**
 * Interface para dados do usuário
 * DEVE corresponder exatamente à interface do módulo:
 * src/contexts/UserContext.tsx -> User interface
 */
export interface FichasUser {
  id: string;
  name: string;
  email: string;
  businessId: string;
  avatar?: string;
}

/**
 * Interface para assinatura
 * DEVE corresponder exatamente à interface do módulo:
 * src/contexts/UserContext.tsx -> Subscription interface
 */
export interface FichasSubscription {
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  features: string[]; // Array de features do módulo (ex: ['export_pdf', 'simulator'])
  expiresAt: string; // ISO date string (ex: '2025-12-31')
  isActive: boolean;
  trialEndsAt?: string; // ISO date string opcional
}

/**
 * Props do componente
 */
export interface FichasTecnicasModuleProps {
  /**
   * Dados do usuário do app mãe
   * OBRIGATÓRIO: Deve vir do seu sistema de autenticação
   */
  userId: string;
  userEmail: string;
  userName: string;
  businessId: string;
  userAvatar?: string;

  /**
   * Dados de assinatura do app mãe
   * OBRIGATÓRIO: Deve vir do seu sistema de assinatura
   */
  subscription: FichasSubscription;

  /**
   * URL do módulo deployado
   * OPCIONAL: Se não fornecido, usa variável de ambiente
   */
  moduleUrl?: string;

  /**
   * Altura do iframe
   * OPCIONAL: Padrão '100vh'
   */
  height?: string;

  /**
   * Callback quando módulo solicita upgrade
   * OPCIONAL: Se não fornecido, redireciona para /upgrade
   */
  onUpgradeRequest?: () => void;

  /**
   * Callback para eventos de analytics
   * OPCIONAL: Para rastrear eventos do módulo
   */
  onAnalyticsEvent?: (event: string, data: any) => void;
}

// ============================================
// CONSTANTES
// ============================================

/**
 * URL padrão do módulo
 * Pode ser sobrescrita via prop ou variável de ambiente
 */
const DEFAULT_MODULE_URL = 
  import.meta.env.VITE_FICHAS_MODULE_URL || 
  process.env.REACT_APP_FICHAS_MODULE_URL ||
  'http://localhost:8080'; // Dev padrão

/**
 * Origens permitidas para postMessage
 * CRÍTICO: Em produção, liste apenas domínios confiáveis
 */
const ALLOWED_ORIGINS = [
  'http://localhost:8080', // Dev
  'http://localhost:5173', // Dev alternativo
  'https://fichas.meuchef.digital', // Produção (ajuste conforme necessário)
  // Adicione outros domínios conforme necessário
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

  // ============================================
  // PREPARAR DADOS PARA O MÓDULO
  // ============================================

  /**
   * Prepara objeto user no formato esperado pelo módulo
   */
  const userData: FichasUser = {
    id: userId,
    name: userName,
    email: userEmail,
    businessId,
    ...(userAvatar && { avatar: userAvatar }),
  };

  /**
   * Prepara subscription no formato esperado pelo módulo
   * IMPORTANTE: O módulo espera features como array de strings
   * que correspondem a FEATURES do módulo
   */
  const subscriptionData: FichasSubscription = {
    plan: subscription.plan,
    features: subscription.features, // Já deve estar no formato correto
    expiresAt: subscription.expiresAt,
    isActive: subscription.isActive,
    ...(subscription.trialEndsAt && { trialEndsAt: subscription.trialEndsAt }),
  };

  // ============================================
  // ENVIAR DADOS PARA O MÓDULO
  // ============================================

  /**
   * Envia dados de autenticação para o módulo via postMessage
   */
  const sendAuthData = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) {
      console.warn('[FichasTecnicasModule] Iframe não está pronto');
      return;
    }

    try {
      // Envia dados completos de autenticação
      iframe.contentWindow.postMessage(
        {
          type: 'AUTH_UPDATE',
          user: userData,
          subscription: subscriptionData,
        },
        '*' // ⚠️ Em produção, use o domínio específico do módulo
      );

      console.log('[FichasTecnicasModule] Dados de autenticação enviados ao módulo');
    } catch (error) {
      console.error('[FichasTecnicasModule] Erro ao enviar dados:', error);
      setError('Erro ao comunicar com o módulo');
    }
  }, [userData, subscriptionData]);

  // ============================================
  // LISTENER DE MENSAGENS DO MÓDULO
  // ============================================

  useEffect(() => {
    /**
     * Handler para mensagens recebidas do módulo
     */
    const handleMessage = (event: MessageEvent) => {
      // ⚠️ CRÍTICO: Validação de origem em produção
      // Descomente e ajuste em produção:
      // if (!ALLOWED_ORIGINS.some(origin => event.origin.includes(origin))) {
      //   console.warn('[FichasTecnicasModule] Mensagem de origem não autorizada:', event.origin);
      //   return;
      // }

      const { type, ...data } = event.data || {};

      switch (type) {
        case 'REQUEST_USER_DATA':
          // Módulo está solicitando dados do usuário
          console.log('[FichasTecnicasModule] Módulo solicitou dados do usuário');
          sendAuthData();
          break;

        case 'UPGRADE_REQUEST':
          // Módulo está solicitando upgrade
          console.log('[FichasTecnicasModule] Módulo solicitou upgrade');
          if (onUpgradeRequest) {
            onUpgradeRequest();
          } else {
            // Fallback: redireciona para página de upgrade
            window.location.href = '/upgrade';
          }
          break;

        case 'ANALYTICS_EVENT':
          // Módulo está enviando evento de analytics
          console.log('[FichasTecnicasModule] Evento de analytics:', data.event, data.data);
          if (onAnalyticsEvent) {
            onAnalyticsEvent(data.event, data.data);
          }
          // Aqui você pode integrar com seu sistema de analytics
          // Exemplo: analytics.track(data.event, data.data);
          break;

        case 'NAVIGATE':
          // Módulo quer navegar no app mãe (opcional)
          if (data.path) {
            console.log('[FichasTecnicasModule] Navegação solicitada:', data.path);
            // window.location.href = data.path;
            // Ou use seu sistema de roteamento:
            // navigate(data.path);
          }
          break;

        case 'ERROR':
          // Módulo reportou um erro
          console.error('[FichasTecnicasModule] Erro reportado pelo módulo:', data.message);
          setError(data.message || 'Erro no módulo');
          break;

        default:
          // Mensagem desconhecida (pode ser ignorada)
          if (type) {
            console.debug('[FichasTecnicasModule] Mensagem desconhecida:', type, data);
          }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [sendAuthData, onUpgradeRequest, onAnalyticsEvent]);

  // ============================================
  // ENVIAR DADOS QUANDO IFRAME CARREGAR
  // ============================================

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      console.log('[FichasTecnicasModule] Iframe carregado, enviando dados...');
      setIsReady(true);
      setError(null);
      
      // Aguarda um pouco para garantir que o módulo está pronto
      setTimeout(() => {
        sendAuthData();
      }, 500);
    };

    const handleError = () => {
      console.error('[FichasTecnicasModule] Erro ao carregar iframe');
      setError('Erro ao carregar o módulo. Verifique a URL.');
      setIsReady(false);
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    // Se o iframe já está carregado, envia dados imediatamente
    if (iframe.contentDocument?.readyState === 'complete') {
      handleLoad();
    }

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, [sendAuthData, moduleUrl]);

  // ============================================
  // RE-ENVIAR DADOS QUANDO MUDAR
  // ============================================

  useEffect(() => {
    // Re-envia dados quando user ou subscription mudarem
    if (isReady) {
      sendAuthData();
    }
  }, [userId, userEmail, userName, businessId, subscription, isReady, sendAuthData]);

  // ============================================
  // RENDER
  // ============================================

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <div className="text-center space-y-4">
          <div className="text-destructive text-lg font-semibold">
            Erro ao carregar módulo
          </div>
          <div className="text-muted-foreground text-sm">
            {error}
          </div>
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
        style={{
          minHeight: height,
          display: isReady ? 'block' : 'none',
        }}
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
- ✅ Arquivo criado em `src/components/modules/FichasTecnicasModule.tsx`
- ✅ Imports corretos
- ✅ Interfaces definidas
- ✅ Lógica de postMessage implementada
- ✅ Validação de origem (comentada para dev, pronta para produção)

---

## 🔧 PASSO 3: CRIAR HOOK DE INTEGRAÇÃO (OPCIONAL MAS RECOMENDADO)

**ARQUIVO A CRIAR**: `src/hooks/useFichasTecnicas.ts`

**CÓDIGO COMPLETO**:

```typescript
/**
 * Hook para facilitar integração com módulo de Fichas Técnicas
 * 
 * Abstrai a lógica de preparação de dados do usuário e assinatura
 * para o formato esperado pelo módulo.
 * 
 * @module hooks/useFichasTecnicas
 */

import { useMemo } from 'react';
import type { FichasUser, FichasSubscription } from '@/components/modules/FichasTecnicasModule';

// ============================================
// INTERFACES DO APP MÃE
// ============================================

/**
 * Interface do usuário do app mãe
 * AJUSTE: Substitua pelos tipos reais do seu app
 */
interface AppUser {
  id: string;
  name: string;
  email: string;
  businessId: string;
  avatar?: string;
  // Adicione outros campos conforme necessário
}

/**
 * Interface da assinatura do app mãe
 * AJUSTE: Substitua pelos tipos reais do seu app
 */
interface AppSubscription {
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  features: string[]; // Features do seu sistema
  expiresAt: string;
  isActive: boolean;
  trialEndsAt?: string;
}

// ============================================
// MAPEAMENTO DE FEATURES
// ============================================

/**
 * Mapeia features do app mãe para features do módulo
 * 
 * IMPORTANTE: O módulo espera estas features exatas:
 * - 'export_pdf'
 * - 'custom_ingredients'
 * - 'price_history'
 * - 'simulator'
 * - 'analytics'
 * - 'unlimited_sheets'
 * 
 * AJUSTE: Mapeie as features do seu sistema para as do módulo
 */
function mapFeaturesToModule(
  appFeatures: string[]
): string[] {
  // Exemplo de mapeamento (AJUSTE conforme seu sistema)
  const featureMap: Record<string, string> = {
    // Se seu app usa nomes diferentes, mapeie aqui
    'pdf_export': 'export_pdf',
    'ingredients_custom': 'custom_ingredients',
    'price_tracking': 'price_history',
    'scenario_simulator': 'simulator',
    'analytics_dashboard': 'analytics',
    'unlimited_recipes': 'unlimited_sheets',
  };

  // Features do módulo que devem ser incluídas
  const moduleFeatures: string[] = [];

  appFeatures.forEach(feature => {
    // Se há mapeamento, usa o valor mapeado
    if (featureMap[feature]) {
      moduleFeatures.push(featureMap[feature]);
    } else {
      // Se não há mapeamento, assume que é o mesmo nome
      moduleFeatures.push(feature);
    }
  });

  return moduleFeatures;
}

// ============================================
// HOOK
// ============================================

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
  // URL do módulo (ajuste conforme necessário)
  const moduleUrl = useMemo(() => {
    return (
      import.meta.env.VITE_FICHAS_MODULE_URL ||
      process.env.REACT_APP_FICHAS_MODULE_URL ||
      'http://localhost:8080'
    );
  }, []);

  // Prepara dados do usuário
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

  // Prepara dados de assinatura
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

  return {
    userData,
    subscriptionData,
    isReady,
    moduleUrl,
  };
}
```

**VALIDAÇÃO**:
- ✅ Arquivo criado em `src/hooks/useFichasTecnicas.ts`
- ✅ Mapeamento de features implementado
- ✅ Validação de dados pronta

---

## 🔧 PASSO 4: ADICIONAR ROTA NO APP MÃE

**ARQUIVO A MODIFICAR**: `src/App.tsx` (ou onde estão suas rotas principais)

**LOCALIZAÇÃO EXATA**: Procure por `<Routes>` ou `BrowserRouter`

**CÓDIGO A ADICIONAR**:

```typescript
// 1. ADICIONAR IMPORTS no topo do arquivo
import { FichasTecnicasModule } from '@/components/modules/FichasTecnicasModule';
// OU se criou o hook:
import { useFichasTecnicas } from '@/hooks/useFichasTecnicas';
import { useUser } from '@/hooks/useUser'; // Seu hook de usuário
import { useSubscription } from '@/hooks/useSubscription'; // Seu hook de assinatura

// 2. DENTRO DO COMPONENTE DE ROTAS, adicionar:
<Route
  path="/fichas-tecnicas/*"
  element={
    // Opção A: Usando hook (recomendado)
    <FichasTecnicasRoute />
    
    // Opção B: Direto (se preferir)
    // <FichasTecnicasModule
    //   userId={user.id}
    //   userEmail={user.email}
    //   userName={user.name}
    //   businessId={user.businessId}
    //   subscription={subscription}
    // />
  }
/>
```

**COMPONENTE DE ROTA** (criar se usar hook):

**ARQUIVO A CRIAR**: `src/pages/FichasTecnicasPage.tsx`

```typescript
import { Navigate } from 'react-router-dom';
import { FichasTecnicasModule } from '@/components/modules/FichasTecnicasModule';
import { useFichasTecnicas } from '@/hooks/useFichasTecnicas';
import { useUser } from '@/hooks/useUser'; // Seu hook
import { useSubscription } from '@/hooks/useSubscription'; // Seu hook

export function FichasTecnicasPage() {
  const { user } = useUser();
  const { subscription } = useSubscription();

  const { userData, subscriptionData, isReady, moduleUrl } = useFichasTecnicas({
    user,
    subscription,
  });

  // Redireciona para login se não autenticado
  if (!user || !subscription) {
    return <Navigate to="/login" replace />;
  }

  // Aguarda dados estarem prontos
  if (!isReady || !userData || !subscriptionData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <div className="text-muted-foreground">Carregando...</div>
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
        // Redireciona para página de upgrade
        window.location.href = '/upgrade';
        // OU use seu sistema de navegação:
        // navigate('/upgrade');
      }}
      onAnalyticsEvent={(event, data) => {
        // Integre com seu sistema de analytics
        console.log('Analytics:', event, data);
        // Exemplo: analytics.track(event, data);
      }}
    />
  );
}
```

**VALIDAÇÃO**:
- ✅ Rota adicionada em `src/App.tsx`
- ✅ Componente de página criado (se necessário)
- ✅ Proteção de autenticação implementada
- ✅ Loading state implementado

---

## 🔧 PASSO 5: CONFIGURAR VARIÁVEIS DE AMBIENTE

**ARQUIVO A CRIAR/MODIFICAR**: `.env` ou `.env.local` (na raiz do app mãe)

**CONTEÚDO**:

```env
# URL do módulo de Fichas Técnicas
# Desenvolvimento
VITE_FICHAS_MODULE_URL=http://localhost:8080

# Produção (ajuste conforme seu deploy)
# VITE_FICHAS_MODULE_URL=https://fichas.meuchef.digital
```

**VALIDAÇÃO**:
- ✅ Arquivo `.env` criado/modificado
- ✅ Variável `VITE_FICHAS_MODULE_URL` definida
- ✅ URL correta para ambiente atual

---

## 🔧 PASSO 6: ADICIONAR LINK NO MENU/NAVEGAÇÃO

**ARQUIVO A MODIFICAR**: Onde está seu menu de navegação (ex: `src/components/Header.tsx`, `src/components/Navbar.tsx`)

**CÓDIGO A ADICIONAR**:

```tsx
// Adicionar item no menu
<Link to="/fichas-tecnicas">
  <FileText className="h-4 w-4" />
  Fichas Técnicas
</Link>
```

**VALIDAÇÃO**:
- ✅ Link adicionado no menu
- ✅ Rota correta (`/fichas-tecnicas`)
- ✅ Ícone apropriado (se usar)

---

## 🔧 PASSO 7: TESTAR INTEGRAÇÃO LOCAL

**COMANDOS PARA EXECUTAR**:

```bash
# Terminal 1: App Mãe
cd [CAMINHO_DO_APP_MAE]
npm run dev

# Terminal 2: Módulo (se testando localmente)
cd "C:\Users\Paulo Aguiar\ficha tecnica\chef-s-secret-formula-50-1"
npm run dev
```

**TESTES A REALIZAR**:

1. **Teste de Carregamento**:
   - [ ] Acesse `/fichas-tecnicas` no app mãe
   - [ ] Iframe deve carregar o módulo
   - [ ] Não deve haver erros no console

2. **Teste de Autenticação**:
   - [ ] Abra DevTools → Console
   - [ ] Verifique mensagem: `[FichasTecnicasModule] Dados de autenticação enviados ao módulo`
   - [ ] No módulo, verifique se usuário está logado

3. **Teste de Feature Flags**:
   - [ ] Com plano "free", tente acessar `/dashboard` → deve mostrar tela de upgrade
   - [ ] Com plano "pro", acesse `/dashboard` → deve funcionar

4. **Teste de Comunicação**:
   - [ ] No console do módulo, digite:
     ```javascript
     window.parent.postMessage({ type: 'UPGRADE_REQUEST' }, '*');
     ```
   - [ ] App mãe deve redirecionar para `/upgrade`

5. **Teste de Navegação**:
   - [ ] Navegue entre páginas do módulo
   - [ ] URLs devem atualizar corretamente
   - [ ] Voltar/avançar do navegador deve funcionar

**VALIDAÇÃO**:
- ✅ Todos os testes passando
- ✅ Sem erros no console
- ✅ Comunicação funcionando

---

## 🔧 PASSO 8: CONFIGURAR PARA PRODUÇÃO

### 8.1 Build do Módulo

**COMANDOS**:
```bash
cd "C:\Users\Paulo Aguiar\ficha tecnica\chef-s-secret-formula-50-1"
npm run build
```

**RESULTADO**: Pasta `dist/` com arquivos estáticos.

### 8.2 Deploy do Módulo

**OPÇÕES**:

**Opção A: Mesmo domínio**
- Copie pasta `dist/` para `/fichas-tecnicas/` no servidor
- URL: `https://app.meuchef.digital/fichas-tecnicas/`

**Opção B: Subdomínio**
- Deploy em `https://fichas.meuchef.digital/`
- Configure CORS se necessário

**Opção C: CDN**
- Vercel: `vercel deploy --prod`
- Netlify: `netlify deploy --prod`
- GitHub Pages: Configure no repositório

### 8.3 Atualizar Variáveis de Ambiente

**ARQUIVO**: `.env.production` (app mãe)

```env
VITE_FICHAS_MODULE_URL=https://fichas.meuchef.digital
```

### 8.4 Ativar Validação de Origem

**ARQUIVO**: `src/components/modules/FichasTecnicasModule.tsx`

**MODIFICAR**: Descomentar validação de origem:

```typescript
const handleMessage = (event: MessageEvent) => {
  // ✅ DESCOMENTAR EM PRODUÇÃO
  if (!ALLOWED_ORIGINS.some(origin => event.origin.includes(origin))) {
    console.warn('[FichasTecnicasModule] Mensagem de origem não autorizada:', event.origin);
    return;
  }
  // ... resto do código
};
```

**VALIDAÇÃO**:
- ✅ Módulo buildado
- ✅ Módulo deployado
- ✅ URL de produção configurada
- ✅ Validação de origem ativada

---

## 🔧 PASSO 9: MAPEAMENTO DE FEATURES (CRÍTICO)

**ARQUIVO A MODIFICAR**: `src/hooks/useFichasTecnicas.ts`

**AÇÃO**: Mapear features do seu sistema para features do módulo.

**FEATURES DO MÓDULO** (exatas, do arquivo `src/lib/features.ts`):
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

**EXEMPLO DE MAPEAMENTO**:

```typescript
function mapFeaturesToModule(appFeatures: string[]): string[] {
  const featureMap: Record<string, string> = {
    // Se seu app usa 'pdf_export', mapeia para 'export_pdf'
    'pdf_export': 'export_pdf',
    'custom_ing': 'custom_ingredients',
    'price_track': 'price_history',
    'simulator': 'simulator', // Se já usa o mesmo nome
    'dashboard': 'analytics',
    'unlimited': 'unlimited_sheets',
  };

  const moduleFeatures: string[] = [];

  appFeatures.forEach(feature => {
    if (featureMap[feature]) {
      moduleFeatures.push(featureMap[feature]);
    } else if (feature.startsWith('fichas_')) {
      // Se suas features têm prefixo, remove e adiciona
      moduleFeatures.push(feature.replace('fichas_', ''));
    }
  });

  return moduleFeatures;
}
```

**VALIDAÇÃO**:
- ✅ Mapeamento implementado
- ✅ Features do app mãe mapeadas corretamente
- ✅ Testado com diferentes planos

---

## 🔧 PASSO 10: INTEGRAÇÃO COM API (OPCIONAL)

Se você tem API backend, configure o módulo para usá-la:

**ARQUIVO A MODIFICAR**: Variáveis de ambiente do módulo (ou criar arquivo de configuração)

**OPÇÃO 1: Via postMessage** (Recomendado)

No componente wrapper, adicione:

```typescript
// Enviar token de API
useEffect(() => {
  if (isReady && apiToken) {
    iframeRef.current?.contentWindow?.postMessage({
      type: 'SET_TOKEN',
      token: apiToken,
    }, '*');
  }
}, [isReady, apiToken]);
```

**OPÇÃO 2: Variáveis de Ambiente do Módulo**

No build do módulo, configure:

```env
VITE_API_URL=https://api.meuchef.digital
VITE_USE_API=true
```

**VALIDAÇÃO**:
- ✅ Token sendo enviado (se aplicável)
- ✅ API configurada no módulo (se aplicável)
- ✅ Testes de API funcionando

---

## ✅ CHECKLIST FINAL DE VALIDAÇÃO

### Funcionalidade
- [ ] Módulo carrega no iframe
- [ ] Dados do usuário são enviados
- [ ] Assinatura é enviada corretamente
- [ ] Feature flags funcionam
- [ ] Limites por plano funcionam
- [ ] Navegação funciona

### Comunicação
- [ ] PostMessage funciona (app mãe → módulo)
- [ ] PostMessage funciona (módulo → app mãe)
- [ ] Validação de origem configurada (produção)
- [ ] Erros são tratados

### Integração
- [ ] Rota adicionada no app mãe
- [ ] Link no menu funciona
- [ ] Proteção de autenticação funciona
- [ ] Loading states funcionam

### Produção
- [ ] Módulo buildado
- [ ] Módulo deployado
- [ ] URL de produção configurada
- [ ] CORS configurado (se necessário)
- [ ] Validação de origem ativada

---

## 🐛 TROUBLESHOOTING

### Problema: Iframe não carrega
**Solução**:
1. Verifique URL do módulo
2. Verifique CORS (se domínios diferentes)
3. Verifique console do navegador
4. Teste URL diretamente no navegador

### Problema: PostMessage não funciona
**Solução**:
1. Verifique se iframe carregou (`iframe.contentWindow`)
2. Verifique origem (use domínio específico em produção)
3. Adicione logs para debug
4. Verifique se mensagem está no formato correto

### Problema: Feature flags não funcionam
**Solução**:
1. Verifique mapeamento de features
2. Verifique formato da subscription
3. Verifique console do módulo
4. Teste com diferentes planos

### Problema: Estilos conflitam
**Solução**:
1. Iframe isola estilos automaticamente
2. Se usar componente direto, use CSS Modules
3. Use prefixos de classe se necessário

---

## 📝 NOTAS IMPORTANTES

1. **Validação de Origem**: CRÍTICO em produção. Sempre valide `event.origin`.

2. **Formato de Features**: O módulo espera features exatas. Verifique `src/lib/features.ts` do módulo.

3. **Planos**: O módulo espera: `'free' | 'basic' | 'pro' | 'enterprise'`. Ajuste se seu sistema usa outros nomes.

4. **Token de API**: Se usar API, envie token via postMessage com tipo `'SET_TOKEN'`.

5. **Base Path**: Se o módulo estiver em subdiretório, configure `basename` no React Router do módulo.

---

## 🎯 ORDEM DE EXECUÇÃO

Execute os passos nesta ordem EXATA:

1. ✅ Passo 1: Identificar estrutura do app mãe
2. ✅ Passo 2: Criar componente wrapper
3. ✅ Passo 3: Criar hook de integração (opcional)
4. ✅ Passo 4: Adicionar rota
5. ✅ Passo 5: Configurar variáveis de ambiente
6. ✅ Passo 6: Adicionar link no menu
7. ✅ Passo 7: Testar localmente
8. ✅ Passo 8: Configurar produção
9. ✅ Passo 9: Mapear features
10. ✅ Passo 10: Integrar API (se aplicável)

---

## 📚 REFERÊNCIAS

- Documentação completa: `docs/GUIA_INTEGRACAO_PASSO_A_PASSO.md`
- Integração técnica: `docs/INTEGRACAO_APP_MAE.md`
- Código do módulo: `src/contexts/UserContext.tsx`
- Features: `src/lib/features.ts`

---

**IMPORTANTE**: 
- Execute cada passo na ordem
- Valide cada passo antes de prosseguir
- Teste localmente antes de produção
- Ative validação de origem em produção

**Última atualização**: Dezembro 2024

