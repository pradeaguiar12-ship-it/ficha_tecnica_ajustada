# 📅 CRONOGRAMA VISUAL DE IMPLEMENTAÇÃO

## Visão Geral (9-10 Semanas)

```
Semana 1    Semana 2    Semana 3    Semana 4    Semana 5    Semana 6    Semana 7    Semana 8    Semana 9
|-----------|-----------|-----------|-----------|-----------|-----------|-----------|-----------|-----------|
|  FASE 1   |  FASE 2   |        FASE 3         |  FASE 4   |              FASE 5              |  FASE 6   |
| Correções | Persist.  |   Funcionalidades     |    UX     |       Diferenciais               | Integração|
|  URGENTE  |  URGENTE  |         ALTA          |   MÉDIA   |          ESTRATÉGICO             |   ALTA    |
|-----------|-----------|-----------|-----------|-----------|-----------|-----------|-----------|-----------|
```

---

## 🗓️ SEMANA 1: FASE 1 - Correções Críticas

### Segunda-feira
| Horário | Tarefa | Duração |
|---------|--------|---------|
| 09:00 | Setup ambiente, revisão do código | 1h |
| 10:00 | **Tarefa 1.1**: Implementar handleDelete | 2h |
| 14:00 | **Tarefa 1.1**: Implementar handleDuplicate | 2h |
| 16:00 | Testes manuais das funções implementadas | 1h |

### Terça-feira
| Horário | Tarefa | Duração |
|---------|--------|---------|
| 09:00 | **Tarefa 1.2**: Corrigir link de edição | 30min |
| 10:00 | **Tarefa 1.3**: Traduzir página 404 | 1h |
| 11:00 | **Tarefa 1.4**: Organizar imports Index.tsx | 30min |
| 14:00 | **Tarefa 1.5**: Implementar delete de ingredientes | 2h |
| 16:00 | Testes integrados de todas as correções | 2h |

### Quarta-feira
| Horário | Tarefa | Duração |
|---------|--------|---------|
| 09:00 | Code review das correções | 2h |
| 11:00 | Ajustes baseados no review | 2h |
| 14:00 | Testes de regressão completos | 3h |
| 17:00 | Documentação das mudanças | 1h |

### Quinta e Sexta
| Tarefa | Duração |
|--------|---------|
| Buffer para imprevistos e ajustes | 2 dias |
| Preparação para Fase 2 | - |

---

## 🗓️ SEMANA 2: FASE 2 - Persistência de Dados

### Segunda-feira
| Horário | Tarefa | Duração |
|---------|--------|---------|
| 09:00 | **Tarefa 2.1**: Criar storage.ts (parte 1) | 4h |
| 14:00 | **Tarefa 2.1**: Criar storage.ts (parte 2) | 3h |
| 17:00 | Testes unitários do storage | 1h |

### Terça-feira
| Horário | Tarefa | Duração |
|---------|--------|---------|
| 09:00 | **Tarefa 2.2**: Criar useSheets hook | 3h |
| 14:00 | Integrar useSheets nas páginas | 3h |
| 17:00 | Testes de persistência de fichas | 2h |

### Quarta-feira
| Horário | Tarefa | Duração |
|---------|--------|---------|
| 09:00 | **Tarefa 2.3**: Criar useIngredients hook | 3h |
| 14:00 | Integrar useIngredients nas páginas | 3h |
| 17:00 | Testes de persistência de ingredientes | 2h |

### Quinta-feira
| Horário | Tarefa | Duração |
|---------|--------|---------|
| 09:00 | **Tarefa 2.4**: Criar useSettings hook | 2h |
| 11:00 | **Tarefa 2.5**: Atualizar App.tsx | 1h |
| 14:00 | Integração de settings nas páginas | 3h |
| 17:00 | Testes completos de persistência | 2h |

### Sexta-feira
| Horário | Tarefa | Duração |
|---------|--------|---------|
| 09:00 | Testes de integração completos | 4h |
| 14:00 | Fix de bugs encontrados | 3h |
| 17:00 | Documentação e merge | 1h |

---

## 🗓️ SEMANAS 3-4: FASE 3 - Funcionalidades Essenciais

### Semana 3

#### Segunda a Quarta: Exportação PDF
```
┌─────────────────────────────────────────────────────────────────┐
│ EXPORTAÇÃO PDF                                                   │
├─────────────────────────────────────────────────────────────────┤
│ □ Instalar @react-pdf/renderer                                   │
│ □ Criar componente PDFDocument                                   │
│ □ Implementar layout da ficha técnica                           │
│ □ Adicionar tabela de ingredientes                              │
│ □ Incluir resumo de custos                                      │
│ □ Adicionar botão de exportação nas páginas                     │
│ □ Testes de geração de PDF                                      │
└─────────────────────────────────────────────────────────────────┘
```

#### Quinta e Sexta: Escalabilidade de Receitas
```
┌─────────────────────────────────────────────────────────────────┐
│ ESCALABILIDADE DE RECEITAS                                       │
├─────────────────────────────────────────────────────────────────┤
│ □ Criar componente ScaleRecipeModal                              │
│ □ Implementar lógica de recálculo                               │
│ □ Atualizar quantidades proporcionalmente                       │
│ □ Recalcular custos automaticamente                             │
│ □ Adicionar botão "Ajustar porções"                             │
│ □ Testes de precisão dos cálculos                               │
└─────────────────────────────────────────────────────────────────┘
```

### Semana 4

#### Segunda e Terça: Histórico de Preços
```
┌─────────────────────────────────────────────────────────────────┐
│ HISTÓRICO DE PREÇOS                                              │
├─────────────────────────────────────────────────────────────────┤
│ □ Criar interface PriceHistory                                   │
│ □ Modificar storage para salvar histórico                       │
│ □ Criar componente PriceHistoryChart                            │
│ □ Mostrar variação de preço no ingrediente                      │
│ □ Alertar quando preço subir muito                              │
└─────────────────────────────────────────────────────────────────┘
```

#### Quarta e Quinta: Drag & Drop
```
┌─────────────────────────────────────────────────────────────────┐
│ DRAG & DROP FUNCIONAL                                            │
├─────────────────────────────────────────────────────────────────┤
│ □ Instalar @dnd-kit/core e sortable                             │
│ □ Criar contexto de drag & drop                                 │
│ □ Implementar no IngredientRow                                  │
│ □ Persistir nova ordem                                          │
│ □ Adicionar feedback visual                                     │
└─────────────────────────────────────────────────────────────────┘
```

#### Sexta: Validação com Zod
```
┌─────────────────────────────────────────────────────────────────┐
│ VALIDAÇÃO COM ZOD                                                │
├─────────────────────────────────────────────────────────────────┤
│ □ Criar validations.ts com schemas                              │
│ □ Integrar com react-hook-form                                  │
│ □ Adicionar feedback em tempo real                              │
│ □ Estilizar mensagens de erro                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗓️ SEMANA 5: FASE 4 - Melhorias de UX

```
┌─────────────────────────────────────────────────────────────────┐
│ SEGUNDA: Busca Global (Cmd+K)                                    │
├─────────────────────────────────────────────────────────────────┤
│ □ Criar CommandMenu.tsx                                          │
│ □ Indexar fichas e ingredientes                                 │
│ □ Implementar navegação rápida                                  │
│ □ Adicionar atalho de teclado                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ TERÇA: Onboarding                                                │
├─────────────────────────────────────────────────────────────────┤
│ □ Criar Onboarding.tsx                                           │
│ □ Tour guiado para novos usuários                               │
│ □ Tooltips de ajuda                                             │
│ □ Vídeos/GIFs explicativos                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ QUARTA: Loading States e Skeletons                               │
├─────────────────────────────────────────────────────────────────┤
│ □ Criar skeleton components                                      │
│ □ Adicionar em todas as listagens                               │
│ □ Indicadores de salvamento                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ QUINTA: Atalhos de Teclado                                       │
├─────────────────────────────────────────────────────────────────┤
│ □ Cmd+N: Nova ficha                                              │
│ □ Cmd+S: Salvar                                                  │
│ □ Cmd+K: Busca                                                   │
│ □ Esc: Fechar modal                                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SEXTA: Feedback e Polish                                         │
├─────────────────────────────────────────────────────────────────┤
│ □ Toast com undo para exclusões                                  │
│ □ Animações de sucesso                                          │
│ □ Micro-interações                                              │
│ □ Testes de usabilidade                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗓️ SEMANAS 6-8: FASE 5 - Diferenciais Competitivos

### Semana 6: Simulador de Cenários
```
Dia 1-2: Backend do Simulador
  □ Criar lógica de simulação
  □ Calcular impacto em todas as fichas
  □ Identificar ingredientes substitutos

Dia 3-4: Interface do Simulador
  □ Criar página Simulador.tsx
  □ Slider para ajuste de preços
  □ Visualização de impacto
  □ Gráficos comparativos

Dia 5: Testes e Ajustes
  □ Testes de precisão
  □ Otimização de performance
```

### Semana 7: Dashboard Analítico
```
Dia 1-2: Métricas e KPIs
  □ Definir métricas importantes
  □ Calcular médias e tendências
  □ Identificar outliers

Dia 3-4: Visualização
  □ Criar componentes de gráfico
  □ Implementar filtros de período
  □ Cards de insights

Dia 5: Integração
  □ Conectar com dados reais
  □ Testes de performance
```

### Semana 8: PWA e Modo Offline
```
Dia 1-2: Configuração PWA
  □ Criar manifest.json
  □ Configurar service worker
  □ Implementar cache strategies

Dia 3-4: Sincronização
  □ Detectar status online/offline
  □ Fila de operações pendentes
  □ Sincronizar quando reconectar

Dia 5: Testes
  □ Testar em modo avião
  □ Verificar sincronização
  □ Testes em dispositivos reais
```

---

## 🗓️ SEMANA 9: FASE 6 - Preparação para Integração

```
┌─────────────────────────────────────────────────────────────────┐
│ SEGUNDA-TERÇA: Contextos                                         │
├─────────────────────────────────────────────────────────────────┤
│ □ Criar UserContext                                              │
│ □ Criar SubscriptionContext                                     │
│ □ Implementar feature flags                                     │
│ □ Preparar para receber dados do app mãe                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ QUARTA-QUINTA: API Service Layer                                 │
├─────────────────────────────────────────────────────────────────┤
│ □ Criar api.ts                                                   │
│ □ Abstrair chamadas HTTP                                        │
│ □ Implementar interceptors                                      │
│ □ Gerenciar tokens                                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SEXTA: Documentação Final                                        │
├─────────────────────────────────────────────────────────────────┤
│ □ Documentação de integração                                     │
│ □ Guia de configuração                                          │
│ □ README atualizado                                              │
│ □ Changelog completo                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 MÉTRICAS DE ACOMPANHAMENTO

### Por Fase

| Fase | Tarefas | Concluídas | % |
|------|---------|------------|---|
| Fase 1 | 5 | 0 | 0% |
| Fase 2 | 5 | 0 | 0% |
| Fase 3 | 5 | 0 | 0% |
| Fase 4 | 5 | 0 | 0% |
| Fase 5 | 3 | 0 | 0% |
| Fase 6 | 3 | 0 | 0% |
| **TOTAL** | **26** | **0** | **0%** |

### Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Atrasos na Fase 1 | Baixa | Alto | Buffer de 2 dias |
| Bugs em persistência | Média | Alto | Testes extensivos |
| PDF não renderiza bem | Média | Médio | Lib alternativa |
| PWA complexo demais | Alta | Baixo | Simplificar escopo |

---

## ✅ DEFINIÇÃO DE PRONTO (DoD)

Uma tarefa é considerada PRONTA quando:

1. [ ] Código implementado e funcionando
2. [ ] Sem erros de TypeScript
3. [ ] Sem erros de lint
4. [ ] Testado manualmente
5. [ ] Build passa sem erros
6. [ ] Documentação atualizada (se aplicável)
7. [ ] Code review realizado (se em equipe)

---

## 🚀 PRÓXIMO PASSO

**Iniciar FASE 1 - Tarefa 1.1: Implementar handleDelete**

Comando para começar:
```bash
code src/pages/FichaTecnicaList.tsx
```

