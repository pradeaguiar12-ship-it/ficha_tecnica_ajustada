/**
 * Command Menu - Busca Global (Cmd+K)
 * 
 * Permite buscar e navegar rapidamente por fichas técnicas,
 * ingredientes e ações do sistema.
 * 
 * @module components/CommandMenu
 */

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Package,
  Plus,
  Settings,
  Search,
  Calculator,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSheets } from "@/hooks/useSheets";
import { useIngredients } from "@/hooks/useIngredients";
import { TechnicalSheet, Ingredient } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/calculations";
import { cn } from "@/lib/utils";

interface CommandMenuProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandMenu({ open: controlledOpen, onOpenChange }: CommandMenuProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { sheets, searchSheets } = useSheets();
  const { allIngredients, searchIngredients } = useIngredients();

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : open;
  const setIsOpen = isControlled ? onOpenChange || (() => {}) : setOpen;

  // Atalho de teclado Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, setIsOpen]);

  // Busca fichas e ingredientes
  const filteredSheets = useMemo(() => {
    if (!search.trim()) return sheets.slice(0, 5);
    return searchSheets(search).slice(0, 5);
  }, [search, sheets, searchSheets]);

  const filteredIngredients = useMemo(() => {
    if (!search.trim()) return allIngredients.slice(0, 5);
    return searchIngredients(search).slice(0, 5);
  }, [search, allIngredients, searchIngredients]);

  const handleSelectSheet = (sheet: TechnicalSheet) => {
    navigate(`/ficha-tecnica/${sheet.id}`);
    setIsOpen(false);
    setSearch("");
  };

  const handleSelectIngredient = (ingredient: Ingredient) => {
    navigate("/ficha-tecnica/ingredientes");
    setIsOpen(false);
    setSearch("");
  };

  const actions = [
    {
      id: "new-sheet",
      label: "Nova Ficha Técnica",
      icon: Plus,
      shortcut: "⌘N",
      action: () => {
        navigate("/ficha-tecnica/nova");
        setIsOpen(false);
      },
    },
    {
      id: "ingredients",
      label: "Gerenciar Ingredientes",
      icon: Package,
      shortcut: "⌘I",
      action: () => {
        navigate("/ficha-tecnica/ingredientes");
        setIsOpen(false);
      },
    },
    {
      id: "settings",
      label: "Configurações de Custos",
      icon: Settings,
      shortcut: "⌘,",
      action: () => {
        navigate("/configuracoes/custos");
        setIsOpen(false);
      },
    },
  ];

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput
        placeholder="Buscar fichas, ingredientes ou ações..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

        {/* Ações Rápidas */}
        {!search.trim() && (
          <CommandGroup heading="Ações Rápidas">
            {actions.map((action) => (
              <CommandItem
                key={action.id}
                onSelect={action.action}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <action.icon className="h-4 w-4" />
                  <span>{action.label}</span>
                </div>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  {action.shortcut}
                </kbd>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Fichas Técnicas */}
        {filteredSheets.length > 0 && (
          <CommandGroup heading="Fichas Técnicas">
            {filteredSheets.map((sheet) => (
              <CommandItem
                key={sheet.id}
                onSelect={() => handleSelectSheet(sheet)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText className="h-4 w-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{sheet.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {sheet.code} • {formatCurrency(sheet.suggestedPrice)}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Ingredientes */}
        {filteredIngredients.length > 0 && (
          <CommandGroup heading="Ingredientes">
            {filteredIngredients.map((ingredient) => (
              <CommandItem
                key={ingredient.id}
                onSelect={() => handleSelectIngredient(ingredient)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Package className="h-4 w-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{ingredient.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {formatCurrency(ingredient.unitPrice)}/{ingredient.priceUnit}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Dica de atalho */}
        {!search.trim() && (
          <CommandGroup heading="Dicas">
            <CommandItem disabled className="text-xs text-muted-foreground">
              <Search className="h-4 w-4 mr-2" />
              Digite para buscar fichas e ingredientes
            </CommandItem>
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

