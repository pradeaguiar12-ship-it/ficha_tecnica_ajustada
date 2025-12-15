/**
 * Lista de Ingredientes com Drag & Drop
 * 
 * Permite reordenar ingredientes arrastando e soltando.
 * 
 * @module components/ficha-tecnica/SortableIngredientList
 */

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { unitOptions, ingredientCategories } from '@/lib/mock-data';
import { formatCurrency, calculateIngredientCost } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { RecipeIngredient } from './IngredientRow';

interface SortableIngredientListProps {
  items: RecipeIngredient[];
  onChange: (id: string, updates: Partial<RecipeIngredient>) => void;
  onRemove: (id: string) => void;
  onReorder: (items: RecipeIngredient[]) => void;
}

function SortableIngredientItem({
  item,
  onChange,
  onRemove,
}: {
  item: RecipeIngredient;
  onChange: (id: string, updates: Partial<RecipeIngredient>) => void;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const category = ingredientCategories.find(c => c.id === item.ingredient.categoryId);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleQuantityChange = (value: string) => {
    const quantity = parseFloat(value) || 0;
    const calculatedCost = calculateIngredientCost(
      quantity,
      item.unit,
      item.ingredient.unitPrice,
      item.ingredient.priceUnit,
      item.correctionFactor
    );
    onChange(item.id, { quantity, calculatedCost });
  };

  const handleUnitChange = (unit: string) => {
    const calculatedCost = calculateIngredientCost(
      item.quantity,
      unit,
      item.ingredient.unitPrice,
      item.ingredient.priceUnit,
      item.correctionFactor
    );
    onChange(item.id, { unit, calculatedCost });
  };

  const handleCorrectionChange = (value: string) => {
    const correctionFactor = parseFloat(value) || 1;
    const calculatedCost = calculateIngredientCost(
      item.quantity,
      item.unit,
      item.ingredient.unitPrice,
      item.ingredient.priceUnit,
      correctionFactor
    );
    onChange(item.id, { correctionFactor, calculatedCost });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors',
        isDragging && 'ring-2 ring-primary z-50'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        type="button"
        className={cn(
          'cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none',
          isDragging && 'cursor-grabbing'
        )}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">{category?.icon}</span>
          <div className="min-w-0">
            <p className="font-medium text-foreground text-sm truncate">{item.ingredient.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(item.ingredient.unitPrice)}/{item.ingredient.priceUnit}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={item.quantity || ""}
          onChange={(e) => handleQuantityChange(e.target.value)}
          placeholder="Qtd"
          className="w-20 h-9 text-sm"
        />

        <Select value={item.unit} onValueChange={handleUnitChange}>
          <SelectTrigger className="w-28 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {unitOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          value={item.correctionFactor}
          onChange={(e) => handleCorrectionChange(e.target.value)}
          step="0.05"
          min="1"
          max="2"
          className="w-16 h-9 text-sm text-center"
          title="Fator de Correção"
        />

        <div className={cn(
          "w-24 text-right font-semibold text-sm",
          item.calculatedCost > 0 ? "text-primary" : "text-muted-foreground"
        )}>
          {formatCurrency(item.calculatedCost)}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onRemove(item.id)}
          className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function SortableIngredientList({
  items,
  onChange,
  onRemove,
  onReorder,
}: SortableIngredientListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requer 8px de movimento antes de ativar
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const reordered = arrayMove(items, oldIndex, newIndex);
      onReorder(reordered);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {items.map((item) => (
            <SortableIngredientItem
              key={item.id}
              item={item}
              onChange={onChange}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

