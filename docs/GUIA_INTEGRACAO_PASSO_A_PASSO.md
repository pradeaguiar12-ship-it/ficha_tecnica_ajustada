# 📘 GUIA COMPLETO: Integração do Módulo no App Mãe
## Passo a Passo Detalhado

**Módulo**: Sistema de Fichas Técnicas  
**App Mãe**: Meu Chef Digital  
**Data**: Dezembro 2024

---

## 🎯 VISÃO GERAL

Este guia explica como integrar o módulo de Fichas Técnicas dentro do aplicativo principal "Meu Chef Digital". Existem 3 métodos principais de integração, cada um com suas vantagens.

---

## 📋 MÉTODOS DE INTEGRAÇÃO

### Método 1: Iframe (Recomendado para Início)
✅ **Vantagens**: Isolamento completo, fácil de implementar, deploy independente  
⚠️ **Desvantagens**: Comunicação via postMessage, limitações de UX

### Método 2: Micro-Frontend (Recomendado para Produção)
✅ **Vantagens**: Melhor performance, integração nativa, compartilhamento de recursos  
⚠️ **Desvantagens**: Mais complexo, requer Module Federation ou similar

### Método 3: Componente Direto (Recomendado se mesmo repositório)
✅ **Vantagens**: Integração total, melhor performance, fácil debug  
⚠️ **Desvantagens**: Acoplamento maior, deploy conjunto

---

## 🚀 MÉTODO 1: INTEGRAÇÃO VIA IFRAME

### Passo 1: Build e Deploy do Módulo

#### 1.1 Build de Produção
```bash
cd chef-s-secret-formula-50-1
npm run build
```

Isso gera a pasta `dist/` com os arquivos estáticos.

#### 1.2 Deploy
Você tem 3 opções:

**Opção A: Deploy em CDN/Static Hosting**
- Vercel: `vercel deploy`
- Netlify: `netlify deploy --prod`
- GitHub Pages: Configure no repositório
- AWS S3 + CloudFront
- Qualquer servidor estático

**Opção B: Servir do mesmo domínio do app mãe**
- Coloque a pasta `dist/` em `/fichas-tecnicas/` do servidor
- Exemplo: `https://app.meuchef.digital/fichas-tecnicas/`

**Opção C: Subdomínio**
- Exemplo: `https://fichas.meuchef.digital/`

### Passo 2: Configurar CORS (se domínios diferentes)

Se o módulo estiver em um domínio diferente do app mãe, configure CORS:

**No servidor do módulo**, adicione headers:
```
Access-Control-Allow-Origin: https://app.meuchef.digital
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### Passo 3: Criar Componente Wrapper no App Mãe

**Arquivo**: `src/components/FichasTecnicasModule.tsx` (no app mãe)

```tsx
import { useEffect, useRef, useState } from 'react';
import { useUser } from '@/hooks/useUser'; // Seu hook de usuário
import { useSubscription } from '@/hooks/useSubscription'; // Seu hook de assinatura

interface FichasTecnicasModuleProps {
  userId: string;
  userEmail: string;
  userName: string;
  businessId: string;
  subscription: {
    plan: 'free' | 'basic' | 'pro' | 'enterprise';
    features: string[];
    expiresAt: string;
    isActive: boolean;
  };
}

export function FichasTecnicasModule({
  userId,
  userEmail,
  userName,
  businessId,
  subscription,
}: FichasTecnicasModuleProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);

  // URL do módulo (ajuste conforme seu deploy)
  const MODULE_URL = process.env.REACT_APP_FICHAS_MODULE_URL || 
    'https://fichas.meuchef.digital';

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Aguarda o iframe carregar
    const handleLoad = () => {
      setIsReady(true);
      
      // Envia dados do usuário para o módulo
      iframe.contentWindow?.postMessage({
        type: 'AUTH_UPDATE',
        user: {
          id: userId,
          email: userEmail,
          name: userName,
          businessId,
        },
        subscription,
      }, '*'); // ⚠️ Em produção, use o domínio específico
    };

    iframe.addEventListener('load', handleLoad);

    // Listener para mensagens do módulo
    const handleMessage = (event: MessageEvent) => {
      // ⚠️ Em produção, valide a origem:
      // if (event.origin !== 'https://fichas.meuchef.digital') return;

      switch (event.data?.type) {
        case 'REQUEST_USER_DATA':
          // Responde com dados do usuário
          iframe.contentWindow?.postMessage({
            type: 'AUTH_UPDATE',
            user: { id: userId, email: userEmail, name: userName, businessId },
            subscription,
          }, '*');
          break;

        case 'UPGRADE_REQUEST':
          // Redireciona para página de upgrade
          window.location.href = '/upgrade';
          break;

        case 'ANALYTICS_EVENT':
          // Envia evento para seu sistema de analytics
          console.log('Analytics:', event.data.event, event.data.data);
          // Exemplo: analytics.track(event.data.event, event.data.data);
          break;

        case 'NAVIGATE':
          // Se o módulo quiser navegar no app mãe
          // window.location.href = event.data.path;
          break;
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      window.removeEventListener('message', handleMessage);
    };
  }, [userId, userEmail, userName, businessId, subscription]);

  return (
    <div className="w-full h-full">
      <iframe
        ref={iframeRef}
        src={MODULE_URL}
        className="w-full h-full border-0"
        title="Módulo de Fichas Técnicas"
        allow="clipboard-read; clipboard-write"
        style={{ minHeight: '600px' }}
      />
    </div>
  );
}
```

### Passo 4: Adicionar Rota no App Mãe

**Arquivo**: `src/App.tsx` (do app mãe)

```tsx
import { FichasTecnicasModule } from '@/components/FichasTecnicasModule';
import { useUser } from '@/hooks/useUser';
import { useSubscription } from '@/hooks/useSubscription';

function App() {
  const { user } = useUser();
  const { subscription } = useSubscription();

  return (
    <Routes>
      {/* Suas rotas existentes */}
      
      {/* Rota do módulo */}
      <Route
        path="/fichas-tecnicas/*"
        element={
          user && subscription ? (
            <FichasTecnicasModule
              userId={user.id}
              userEmail={user.email}
              userName={user.name}
              businessId={user.businessId}
              subscription={subscription}
            />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}
```

### Passo 5: Variáveis de Ambiente

**Arquivo**: `.env` (do app mãe)

```env
REACT_APP_FICHAS_MODULE_URL=https://fichas.meuchef.digital
```

---

## 🔧 MÉTODO 2: MICRO-FRONTEND (Module Federation)

### Passo 1: Configurar Module Federation no Módulo

**Arquivo**: `vite.config.ts` (do módulo)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'fichas_tecnicas',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.tsx',
        './FichasTecnicas': './src/pages/FichaTecnicaList.tsx',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        'react-router-dom': { singleton: true },
      },
    }),
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
});
```

**Instalar plugin**:
```bash
npm install -D @originjs/vite-plugin-federation
```

### Passo 2: Configurar Module Federation no App Mãe

**Arquivo**: `vite.config.ts` (do app mãe)

```typescript
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'meu_chef_digital',
      remotes: {
        fichas_tecnicas: 'http://localhost:5173/assets/remoteEntry.js', // Dev
        // fichas_tecnicas: 'https://fichas.meuchef.digital/assets/remoteEntry.js', // Prod
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        'react-router-dom': { singleton: true },
      },
    }),
  ],
});
```

### Passo 3: Importar Módulo no App Mãe

```tsx
import { lazy, Suspense } from 'react';

// Lazy load do módulo remoto
const FichasTecnicas = lazy(() => import('fichas_tecnicas/FichasTecnicas'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route
          path="/fichas-tecnicas/*"
          element={<FichasTecnicas />}
        />
      </Routes>
    </Suspense>
  );
}
```

---

## 📦 MÉTODO 3: COMPONENTE DIRETO (Mesmo Repositório)

### Passo 1: Adicionar como Submódulo Git

```bash
# No repositório do app mãe
git submodule add https://github.com/pradeaguiar12-ship-it/chef-s-secret-formula-50.git src/modules/fichas-tecnicas
```

### Passo 2: Instalar Dependências

```bash
cd src/modules/fichas-tecnicas
npm install
```

### Passo 3: Configurar Path Alias

**Arquivo**: `tsconfig.json` (do app mãe)

```json
{
  "compilerOptions": {
    "paths": {
      "@fichas/*": ["./src/modules/fichas-tecnicas/src/*"]
    }
  }
}
```

### Passo 4: Importar Componentes

```tsx
import { FichaTecnicaList } from '@fichas/pages/FichaTecnicaList';
import { UserProvider } from '@fichas/contexts/UserContext';

function App() {
  const { user, subscription } = useUser(); // Seu hook

  return (
    <UserProvider
      initialUser={user}
      initialSubscription={subscription}
      enablePostMessage={false}
    >
      <Routes>
        <Route path="/fichas-tecnicas" element={<FichaTecnicaList />} />
      </Routes>
    </UserProvider>
  );
}
```

---

## 🔐 CONFIGURAÇÃO DE AUTENTICAÇÃO

### Opção 1: Via PostMessage (Iframe)

O módulo já está preparado para receber dados via postMessage. Basta enviar:

```typescript
iframe.contentWindow?.postMessage({
  type: 'AUTH_UPDATE',
  user: {
    id: 'user-123',
    name: 'Chef Edil',
    email: 'chef@example.com',
    businessId: 'business-456',
  },
  subscription: {
    plan: 'pro',
    features: ['export_pdf', 'simulator', 'analytics'],
    expiresAt: '2025-12-31',
    isActive: true,
  },
}, 'https://fichas.meuchef.digital'); // Use domínio específico em produção
```

### Opção 2: Via Props (Componente Direto)

```tsx
<UserProvider
  initialUser={user}
  initialSubscription={subscription}
  enablePostMessage={false}
>
  <App />
</UserProvider>
```

### Opção 3: Via Context Global (Se compartilhar contexto)

Se ambos os apps compartilharem o mesmo contexto de autenticação:

```tsx
// No app mãe
import { AuthProvider } from '@/contexts/AuthContext';

// No módulo, importa do app mãe
import { useAuth } from '@/contexts/AuthContext';
```

---

## 🎨 ESTILOS E CSS

### Se usar Iframe
✅ **Vantagem**: Estilos isolados automaticamente  
⚠️ **Atenção**: Não há compartilhamento de tema

### Se usar Micro-Frontend ou Componente Direto

**Opção A: Compartilhar Tailwind Config**
```javascript
// No módulo, importa do app mãe
import tailwindConfig from '../../tailwind.config.js';
```

**Opção B: CSS Modules**
Cada módulo mantém seus próprios estilos.

**Opção C: CSS Variables Compartilhadas**
```css
/* No app mãe */
:root {
  --primary-color: #your-color;
  --border-radius: 0.5rem;
}

/* No módulo, usa as mesmas variáveis */
```

---

## 🚦 ROTEAMENTO

### Opção 1: Rota Separada (Recomendado)
```
/fichas-tecnicas/* → Todo o módulo gerencia suas rotas internas
```

### Opção 2: Integração Total
```
/dashboard → Página do app mãe
/fichas-tecnicas → Lista de fichas (módulo)
/fichas-tecnicas/nova → Nova ficha (módulo)
```

### Opção 3: Subdomínio
```
app.meuchef.digital → App principal
fichas.meuchef.digital → Módulo completo
```

---

## 📡 COMUNICAÇÃO ENTRE APPS

### Mensagens que o Módulo Envia:

```typescript
// Solicitar dados do usuário
{ type: 'REQUEST_USER_DATA' }

// Solicitar upgrade
{ type: 'UPGRADE_REQUEST' }

// Eventos de analytics
{ type: 'ANALYTICS_EVENT', event: 'sheet_created', data: {...} }

// Navegação (opcional)
{ type: 'NAVIGATE', path: '/dashboard' }
```

### Mensagens que o App Mãe Envia:

```typescript
// Atualizar usuário
{ type: 'USER_UPDATE', user: {...} }

// Atualizar assinatura
{ type: 'SUBSCRIPTION_UPDATE', subscription: {...} }

// Atualizar tudo
{ type: 'AUTH_UPDATE', user: {...}, subscription: {...} }
```

---

## 🔒 SEGURANÇA

### 1. Validação de Origem (Crítico!)

```typescript
const handleMessage = (event: MessageEvent) => {
  // ⚠️ SEMPRE valide a origem em produção
  const ALLOWED_ORIGINS = [
    'https://fichas.meuchef.digital',
    'https://app.meuchef.digital',
  ];
  
  if (!ALLOWED_ORIGINS.includes(event.origin)) {
    console.warn('Mensagem de origem não autorizada:', event.origin);
    return;
  }
  
  // Processa mensagem...
};
```

### 2. Token de Autenticação

Se usar API, envie token via postMessage:

```typescript
iframe.contentWindow?.postMessage({
  type: 'SET_TOKEN',
  token: userToken,
}, 'https://fichas.meuchef.digital');
```

E no módulo, configure a API:

```typescript
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === 'SET_TOKEN') {
      api.setToken(event.data.token);
    }
  };
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

---

## 📊 FEATURE FLAGS

O módulo já tem sistema de feature flags. Basta enviar a assinatura correta:

```typescript
subscription: {
  plan: 'pro', // 'free' | 'basic' | 'pro' | 'enterprise'
  features: ['export_pdf', 'simulator', 'analytics'],
  expiresAt: '2025-12-31',
  isActive: true,
}
```

O módulo automaticamente:
- Bloqueia rotas sem feature
- Mostra tela de upgrade
- Aplica limites por plano

---

## 🧪 TESTANDO A INTEGRAÇÃO

### 1. Teste Local (Iframe)

```bash
# Terminal 1: App Mãe
cd meu-chef-digital
npm run dev

# Terminal 2: Módulo
cd chef-s-secret-formula-50-1
npm run dev -- --port 5174
```

No app mãe, use URL: `http://localhost:5174`

### 2. Teste de PostMessage

Abra DevTools → Console e teste:

```javascript
// No app mãe
iframe.contentWindow.postMessage({
  type: 'AUTH_UPDATE',
  user: { id: 'test', name: 'Test', email: 'test@test.com', businessId: 'test' },
  subscription: { plan: 'pro', features: [], expiresAt: '2025-12-31', isActive: true }
}, '*');
```

### 3. Verificar Feature Flags

Acesse `/dashboard` ou `/simulador` sem feature → deve mostrar tela de upgrade.

---

## 🐛 TROUBLESHOOTING

### Problema: Iframe não carrega
- ✅ Verifique CORS
- ✅ Verifique URL do módulo
- ✅ Verifique console do navegador

### Problema: PostMessage não funciona
- ✅ Verifique origem (use domínio específico)
- ✅ Verifique se iframe carregou (`iframe.contentWindow`)
- ✅ Adicione logs para debug

### Problema: Estilos conflitam
- ✅ Use CSS Modules
- ✅ Use prefixos de classe
- ✅ Use Shadow DOM (avançado)

### Problema: Rotas não funcionam
- ✅ Verifique base path do React Router
- ✅ Use `basename` se necessário
- ✅ Verifique hash vs browser router

---

## 📝 CHECKLIST DE INTEGRAÇÃO

### Pré-requisitos
- [ ] Módulo buildado e deployado
- [ ] URL do módulo configurada
- [ ] CORS configurado (se necessário)

### Implementação
- [ ] Componente wrapper criado
- [ ] Rota adicionada no app mãe
- [ ] PostMessage configurado
- [ ] Validação de origem implementada

### Testes
- [ ] Módulo carrega corretamente
- [ ] Dados do usuário são enviados
- [ ] Feature flags funcionam
- [ ] Navegação funciona
- [ ] Analytics funciona (se implementado)

### Produção
- [ ] URLs de produção configuradas
- [ ] Segurança validada
- [ ] Performance testada
- [ ] Monitoramento configurado

---

## 🎯 RECOMENDAÇÃO FINAL

**Para começar rapidamente**: Use **Método 1 (Iframe)**
- Mais simples
- Isolamento garantido
- Deploy independente
- Fácil de testar

**Para produção escalável**: Migre para **Método 2 (Micro-Frontend)**
- Melhor performance
- Integração nativa
- Compartilhamento de recursos

---

## 📚 DOCUMENTAÇÃO ADICIONAL

Consulte também:
- `docs/INTEGRACAO_APP_MAE.md` - Detalhes técnicos
- `docs/AVALIACAO_COMPLETA.md` - Avaliação do módulo
- `src/contexts/UserContext.tsx` - Como funciona o contexto

---

**Última atualização**: Dezembro 2024  
**Versão do Módulo**: 1.0.0

