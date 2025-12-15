import { useState, useMemo, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, Plus, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerFooter,
    DrawerClose,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { mockIngredients, Ingredient, unitOptions, ingredientCategories } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/calculations";
import { Badge } from "@/components/ui/badge";

interface SmartIngredientInputProps {
    onAdd: (ingredient: Ingredient, quantity: number, unit: string, mode: 'new' | 'sum') => void;
    existingIngredients: { ingredientId: string; ingredientName: string }[];
}

export function SmartIngredientInput({ onAdd, existingIngredients }: SmartIngredientInputProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

    // Edit State
    const [quantity, setQuantity] = useState("");
    const [unit, setUnit] = useState("un");

    // Duplicity State
    const [duplicityAlert, setDuplicityAlert] = useState<{ isOpen: boolean; ingredient: Ingredient | null }>({ isOpen: false, ingredient: null });

    const inputQuantityRef = useRef<HTMLInputElement>(null);

    // Performance: Limit + Memo
    const filteredIngredients = useMemo(() => {
        if (!query) return [];
        // Simple filter first
        const lowerQuery = query.toLowerCase();
        const matches = mockIngredients.filter(i =>
            i.name.toLowerCase().includes(lowerQuery)
        );
        // Limit to top 30 for performance
        return matches.slice(0, 30);
    }, [query]);

    // Grouping only when cheap (small list) or requested? 
    // For 'Best in Market', flat list with category badges might be faster for "top 30" mixed results
    // We'll stick to simple list for max speed, maybe add icon?

    const handleSelect = (ingredient: Ingredient) => {
        // Check duplicity
        const exists = existingIngredients.find(ei => ei.ingredientId === ingredient.id);

        if (exists) {
            setDuplicityAlert({ isOpen: true, ingredient });
            setOpen(false); // Close command list
            return;
        }

        startEditing(ingredient);
    };

    const startEditing = (ingredient: Ingredient) => {
        setSelectedIngredient(ingredient);
        setOpen(false);
        setUnit(ingredient.defaultUnit || 'un'); // Smart Unit Logic
        // Focus quantity next tick
        setTimeout(() => inputQuantityRef.current?.focus(), 50);
    };

    const handleDuplicityAction = (action: 'sum' | 'new') => {
        if (!duplicityAlert.ingredient) return;

        if (action === 'new') {
            startEditing(duplicityAlert.ingredient);
        } else {
            // Prepare for sum - we still need quantity input
            startEditing(duplicityAlert.ingredient);
            // Note: The parent 'onAdd' will handle the 'sum' logic based on the passed mode, 
            // but here we just need to capture the quantity to add. 
            // Wait, if it's sum, we are adding TO existing. 
            // Ideally we capture quantity normally, and pass 'sum' flag to parent.
        }
        // Store mode for when user hits Enter in quantity input?
        // We can store a transient state 'addMode'
        setAddMode(action);
        setDuplicityAlert({ isOpen: false, ingredient: null });
    };

    const [addMode, setAddMode] = useState<'new' | 'sum'>('new');

    const handleConfirm = () => {
        if (!selectedIngredient || !quantity) return;

        const qty = parseFloat(quantity);
        if (isNaN(qty) || qty <= 0) return;

        onAdd(selectedIngredient, qty, unit, addMode);

        // Reset
        setSelectedIngredient(null);
        setQuantity("");
        setQuery("");
        setAddMode('new');
        setOpen(true); // Re-open for next input? Optional, maybe keep focus on trigger
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleConfirm();
        }
        if (e.key === "Escape") {
            setSelectedIngredient(null);
            setAddMode('new');
        }
    };

    // Inline Duplicity Alert
    if (duplicityAlert.isOpen && duplicityAlert.ingredient) {
        return (
            <div className="flex items-center gap-4 p-4 rounded-lg border border-amber-200 bg-amber-50 animate-in fade-in slide-in-from-top-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <div className="flex-1">
                    <p className="font-medium text-amber-900">
                        "{duplicityAlert.ingredient.name}" já está na lista.
                    </p>
                    <p className="text-sm text-amber-700">Como deseja prosseguir?</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setDuplicityAlert({ isOpen: false, ingredient: null })} className="h-8">
                        Cancelar (Esc)
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleDuplicityAction('new')} className="h-8">
                        Nova Linha (N)
                    </Button>
                    <Button size="sm" onClick={() => handleDuplicityAction('sum')} className="h-8 bg-amber-600 hover:bg-amber-700 text-white">
                        Somar (+Enter)
                    </Button>
                </div>
            </div>
        );
    }

    const isDesktop = useMediaQuery("(min-width: 768px)");

    // Edit Mode (Quantity Input inline or Drawer)
    if (selectedIngredient) {
        if (isDesktop) {
            return (
                <div className="flex items-center gap-3 p-2 rounded-lg border border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-left-2">
                    <div className="flex-1 font-medium flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        {selectedIngredient.name}
                        <Badge variant="outline" className="text-[10px] h-5">{addMode === 'sum' ? 'Somar' : 'Novo'}</Badge>
                    </div>

                    <Input
                        ref={inputQuantityRef}
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                        placeholder="Qtd"
                        className="w-24 h-9"
                        type="number"
                        onKeyDown={handleKeyDown}
                    />

                    <Select value={unit} onValueChange={setUnit}>
                        <SelectTrigger className="w-24 h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {unitOptions.map(u => (
                                <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button size="sm" onClick={handleConfirm} className="h-9">
                        Confirmar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedIngredient(null)} className="h-9 w-9 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            );
        }

        return (
            <Drawer open={!!selectedIngredient} onOpenChange={(open) => !open && setSelectedIngredient(null)}>
                <DrawerContent>
                    <DrawerHeader className="text-left">
                        <DrawerTitle className="flex items-center gap-2">
                            {selectedIngredient.name}
                            <Badge variant="outline" className="ml-2">{addMode === 'sum' ? 'Somar' : 'Novo'}</Badge>
                        </DrawerTitle>
                    </DrawerHeader>
                    <div className="p-4 space-y-4 pb-8">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-sm font-medium mb-1 block">Quantidade</label>
                                <Input
                                    autoFocus
                                    value={quantity}
                                    onChange={e => setQuantity(e.target.value)}
                                    placeholder="0.00"
                                    type="number"
                                    className="text-lg h-12"
                                />
                            </div>
                            <div className="w-1/3">
                                <label className="text-sm font-medium mb-1 block">Unidade</label>
                                <Select value={unit} onValueChange={setUnit}>
                                    <SelectTrigger className="h-12">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {unitOptions.map(u => (
                                            <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button onClick={handleConfirm} className="w-full h-12 text-lg">
                            Confirmar
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="outline" className="w-full">Cancelar</Button>
                        </DrawerClose>
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }

    // Search Mode
    return (
        <div className="relative w-full">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between h-12 text-muted-foreground bg-muted/20 hover:bg-muted/30 border-dashed"
                    >
                        {query || "Adicionar ingrediente (digite para buscar)..."}
                        <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command shouldFilter={false}>
                        {/* We implement custom filter for perf/limit */}
                        <CommandInput
                            placeholder="Buscar ingrediente..."
                            value={query}
                            onValueChange={setQuery}
                        />
                        <CommandList>
                            <CommandEmpty>Nenhum ingrediente encontrado.</CommandEmpty>
                            <CommandGroup heading="Sugestões" className={!query ? "hidden" : ""}>
                                {filteredIngredients.map((ingredient) => (
                                    <CommandItem
                                        key={ingredient.id}
                                        value={ingredient.name} // Value for internal cmkd matching if needed, but we force selection content
                                        onSelect={() => handleSelect(ingredient)}
                                    >
                                        <div className="flex items-center w-full gap-2">
                                            {/* Try to find icon */}
                                            <span>{ingredientCategories.find(c => c.id === ingredient.categoryId)?.icon || '📦'}</span>
                                            <span className="flex-1 truncate">{ingredient.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatCurrency(ingredient.unitPrice)}/{ingredient.priceUnit}
                                            </span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
