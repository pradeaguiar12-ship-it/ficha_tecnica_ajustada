# FASE 1: CORREÇÕES CRÍTICAS
## Instruções Detalhadas de Implementação

**Tempo estimado**: 5-7 dias  
**Prioridade**: 🔴 URGENTE  
**Pré-requisitos**: Nenhum

---

## TAREFA 1.1: Corrigir Delete e Duplicate de Fichas

### Arquivo a modificar: `src/pages/FichaTecnicaList.tsx`

### Passo 1: Adicionar imports necessários

No topo do arquivo, adicionar:
```typescript
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { generateSheetCode, deleteMockSheet } from "@/lib/mock-data";
```

### Passo 2: Adicionar estados

Após a linha `const [categoryFilter, setCategoryFilter] = useState<string>("all");`, adicionar:
```typescript
// Estados para controle de fichas
const [sheets, setSheets] = useState<TechnicalSheet[]>(mockSheets);
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [sheetToDelete, setSheetToDelete] = useState<string | null>(null);
```

### Passo 3: Modificar o filteredSheets

Alterar de:
```typescript
const filteredSheets = useMemo(() => {
  return mockSheets.filter((sheet) => {
```

Para:
```typescript
const filteredSheets = useMemo(() => {
  return sheets.filter((sheet) => {
```

### Passo 4: Modificar o stats

Alterar de:
```typescript
const stats = useMemo(() => {
  const active = mockSheets.filter(s => s.status === "ACTIVE").length;
  const avgMargin = mockSheets.reduce((acc, s) => acc + s.actualMargin, 0) / mockSheets.length;
```

Para:
```typescript
const stats = useMemo(() => {
  const active = sheets.filter(s => s.status === "ACTIVE").length;
  const avgMargin = sheets.length > 0 
    ? sheets.reduce((acc, s) => acc + s.actualMargin, 0) / sheets.length 
    : 0;
```

### Passo 5: Adicionar funções de manipulação

Após o useMemo de stats, adicionar:
```typescript
// Função para iniciar exclusão
const handleDelete = (id: string) => {
  setSheetToDelete(id);
  setDeleteDialogOpen(true);
};

// Função para confirmar exclusão
const confirmDelete = () => {
  if (sheetToDelete) {
    setSheets(prev => prev.filter(s => s.id !== sheetToDelete));
    toast.success("Ficha técnica excluída com sucesso!");
    setDeleteDialogOpen(false);
    setSheetToDelete(null);
  }
};

// Função para duplicar
const handleDuplicate = (id: string) => {
  const original = sheets.find(s => s.id === id);
  if (original) {
    const duplicated: TechnicalSheet = {
      ...original,
      id: `${Date.now()}`,
      code: generateSheetCode(),
      name: `${original.name} (Cópia)`,
      status: 'DRAFT',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setSheets(prev => [duplicated, ...prev]);
    toast.success(`Ficha "${duplicated.name}" criada!`);
  }
};
```

### Passo 6: Adicionar import do toast

Se não existir, adicionar no topo:
```typescript
import { toast } from "sonner";
```

### Passo 7: Atualizar o RecipeCard

Substituir:
```typescript
<RecipeCard
  key={sheet.id}
  sheet={sheet}
  index={index}
  onDelete={(id) => console.log("Delete:", id)}
  onDuplicate={(id) => console.log("Duplicate:", id)}
/>
```

Por:
```typescript
<RecipeCard
  key={sheet.id}
  sheet={sheet}
  index={index}
  onDelete={handleDelete}
  onDuplicate={handleDuplicate}
/>
```

### Passo 8: Adicionar AlertDialog

Antes do fechamento de `</MainLayout>`, adicionar:
```typescript
{/* Dialog de confirmação de exclusão */}
<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Excluir ficha técnica?</AlertDialogTitle>
      <AlertDialogDescription>
        Esta ação não pode ser desfeita. A ficha será permanentemente excluída
        do sistema.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction
        onClick={confirmDelete}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        Excluir
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Testes de Validação:
- [ ] Clicar em "Excluir" no menu de uma ficha abre o diálogo
- [ ] Clicar em "Cancelar" fecha o diálogo sem excluir
- [ ] Clicar em "Excluir" no diálogo remove a ficha da lista
- [ ] Toast de sucesso aparece após exclusão
- [ ] Clicar em "Duplicar" cria nova ficha no topo da lista
- [ ] Ficha duplicada tem nome "(Cópia)" e status "Rascunho"
- [ ] Código da ficha duplicada é diferente do original

---

## TAREFA 1.2: Corrigir Link de Edição

### Arquivo a modificar: `src/components/ficha-tecnica/RecipeCard.tsx`

### Localizar linha 138-139:
```typescript
<DropdownMenuItem asChild>
  <Link to={`/ficha-tecnica/${sheet.id}/editar`} className="flex items-center gap-2">
```

### Alterar para:
```typescript
<DropdownMenuItem asChild>
  <Link to={`/ficha-tecnica/${sheet.id}`} className="flex items-center gap-2">
```

### Testes de Validação:
- [ ] Clicar em "Editar" abre a página de edição
- [ ] URL é `/ficha-tecnica/{id}` sem `/editar`
- [ ] Dados da ficha são carregados corretamente

---

## TAREFA 1.3: Traduzir Página 404

### Arquivo a modificar: `src/pages/NotFound.tsx`

### Substituir todo o conteúdo por:

```typescript
import { Link } from "react-router-dom";
import { Home, ArrowLeft, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        {/* Ícone decorativo */}
        <div className="relative mx-auto mb-8 w-32 h-32">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-card flex items-center justify-center">
            <ChefHat className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>

        {/* Código de erro */}
        <h1 className="text-8xl font-bold text-gradient mb-4">404</h1>
        
        {/* Mensagem */}
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Página não encontrada
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Ops! Parece que esta receita não existe no nosso cardápio. 
          Que tal voltar para a cozinha principal?
        </p>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="min-w-[140px]"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button asChild variant="gradient" className="min-w-[140px]">
            <Link to="/">
              <Home className="h-4 w-4" />
              Ir para o início
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
```

### Testes de Validação:
- [ ] Acessar URL inexistente mostra página 404
- [ ] Textos estão em português
- [ ] Botão "Voltar" funciona
- [ ] Botão "Ir para o início" redireciona para /

---

## TAREFA 1.4: Organizar Imports no Index.tsx

### Arquivo a modificar: `src/pages/Index.tsx`

### Localizar linhas 175-177 (final do arquivo):
```typescript
// Import at top was missing
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
```

### Remover essas linhas e adicionar no topo do arquivo

Após a linha de imports de lucide-react existente, verificar se Badge e Plus já estão importados. Se não:

Adicionar Badge:
```typescript
import { Badge } from "@/components/ui/badge";
```

Adicionar Plus ao import de lucide-react:
```typescript
import {
  ChefHat,
  FileText,
  Package,
  TrendingUp,
  ArrowRight,
  Calculator,
  DollarSign,
  Sparkles,
  Plus,  // Adicionar aqui
} from "lucide-react";
```

### Testes de Validação:
- [ ] Página inicial carrega sem erros
- [ ] Console não mostra warnings de imports
- [ ] Build passa sem erros

---

## TAREFA 1.5: Implementar Delete de Ingredientes

### Arquivo a modificar: `src/pages/Ingredientes.tsx`

### Passo 1: Adicionar estados

Após os estados existentes (linha ~50), adicionar:
```typescript
const [ingredientToDelete, setIngredientToDelete] = useState<string | null>(null);
const [deleteIngredientOpen, setDeleteIngredientOpen] = useState(false);
```

### Passo 2: Adicionar funções

Após `handleSave`, adicionar:
```typescript
const handleDeleteIngredient = (id: string) => {
  setIngredientToDelete(id);
  setDeleteIngredientOpen(true);
};

const confirmDeleteIngredient = () => {
  if (ingredientToDelete) {
    // Por enquanto apenas mostra toast - será integrado com storage
    toast.success("Ingrediente excluído com sucesso!");
    setDeleteIngredientOpen(false);
    setIngredientToDelete(null);
  }
};
```

### Passo 3: Atualizar botão de delete (linha ~231-237)

Substituir:
```typescript
<Button
  variant="ghost"
  size="icon-sm"
  className="text-destructive hover:text-destructive"
>
  <Trash2 className="h-4 w-4" />
</Button>
```

Por:
```typescript
<Button
  variant="ghost"
  size="icon-sm"
  className="text-destructive hover:text-destructive"
  onClick={() => handleDeleteIngredient(ing.id)}
>
  <Trash2 className="h-4 w-4" />
</Button>
```

### Passo 4: Adicionar AlertDialog

Antes do fechamento de `</MainLayout>`, após o Dialog existente, adicionar:
```typescript
{/* Dialog de exclusão de ingrediente */}
<AlertDialog open={deleteIngredientOpen} onOpenChange={setDeleteIngredientOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Excluir ingrediente?</AlertDialogTitle>
      <AlertDialogDescription>
        Esta ação não pode ser desfeita. O ingrediente será removido da sua lista.
        Fichas técnicas que usam este ingrediente não serão afetadas.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction
        onClick={confirmDeleteIngredient}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        Excluir
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Passo 5: Adicionar imports necessários

```typescript
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
```

### Testes de Validação:
- [ ] Botão de excluir aparece apenas em "Meus Ingredientes"
- [ ] Clicar no botão abre diálogo de confirmação
- [ ] Cancelar fecha sem excluir
- [ ] Confirmar mostra toast de sucesso

---

## RESUMO DE ARQUIVOS MODIFICADOS

| Arquivo | Modificações |
|---------|--------------|
| `src/pages/FichaTecnicaList.tsx` | Estados, funções, AlertDialog |
| `src/components/ficha-tecnica/RecipeCard.tsx` | Correção de URL |
| `src/pages/NotFound.tsx` | Reescrita completa |
| `src/pages/Index.tsx` | Reorganização de imports |
| `src/pages/Ingredientes.tsx` | Estados, funções, AlertDialog |

---

## COMANDO PARA VERIFICAR ERROS APÓS IMPLEMENTAÇÃO

```bash
npm run build
```

Se houver erros, corrigir antes de prosseguir para a Fase 2.

