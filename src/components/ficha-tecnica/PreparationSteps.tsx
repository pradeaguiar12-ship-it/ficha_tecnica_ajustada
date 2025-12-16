import { useState, useMemo, memo } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Plus, Wand2, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface Step {
    id: string;
    text: string;
    isCritical: boolean;
    timeInMinutes?: number;
}

interface PreparationStepsProps {
    steps: Step[];
    onChange: (steps: Step[]) => void;
    legacyText?: string;
}

const SortableStepRow = memo(({ step, onChange, onRemove }: {
    step: Step;
    onChange: (id: string, updates: Partial<Step>) => void;
    onRemove: (id: string) => void;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: step.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex items-start gap-3 p-3 rounded-xl bg-card border transition-colors group",
                step.isCritical ? "border-amber-200 bg-amber-50/30" : "border-border hover:border-primary/20",
                isDragging && "shadow-lg border-primary/50"
            )}
        >
            <button
                {...attributes}
                {...listeners}
                className="mt-2 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none"
            >
                <GripVertical className="h-5 w-5" />
            </button>

            <div className="flex-1 space-y-2">
                <Textarea
                    value={step.text}
                    onChange={(e) => onChange(step.id, { text: e.target.value })}
                    placeholder="Descreva este passo..."
                    className="min-h-[60px] resize-none text-sm"
                />
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={step.isCritical}
                            onCheckedChange={(checked) => onChange(step.id, { isCritical: checked })}
                            id={`critical-${step.id}`}
                        />
                        <label
                            htmlFor={`critical-${step.id}`}
                            className={cn("text-xs font-medium cursor-pointer flex items-center gap-1", step.isCritical ? "text-amber-600" : "text-muted-foreground")}
                        >
                            {step.isCritical && <AlertTriangle className="h-3 w-3" />}
                            Ponto Crítico
                        </label>
                    </div>

                    <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <Input
                            type="number"
                            value={step.timeInMinutes || ''}
                            onChange={(e) => onChange(step.id, { timeInMinutes: parseInt(e.target.value) || 0 })}
                            placeholder="Min"
                            className="w-16 h-7 text-xs"
                        />
                        <span className="text-xs text-muted-foreground">min</span>
                    </div>
                </div>
            </div>

            <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onRemove(step.id)}
                className="text-muted-foreground hover:text-destructive opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
});

export function PreparationSteps({ steps, onChange, legacyText }: PreparationStepsProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = steps.findIndex((item) => item.id === active.id);
            const newIndex = steps.findIndex((item) => item.id === over?.id);
            onChange(arrayMove(steps, oldIndex, newIndex));
        }
    };

    const addStep = () => {
        const newStep: Step = {
            id: crypto.randomUUID(),
            text: '',
            isCritical: false
        };
        onChange([...steps, newStep]);
    };

    const updateStep = (id: string, updates: Partial<Step>) => {
        onChange(steps.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const removeStep = (id: string) => {
        onChange(steps.filter(s => s.id !== id));
    };

    const handleSmartConvert = () => {
        if (!legacyText) return;

        const lines = legacyText.split(/\n/);
        const newSteps: Step[] = lines
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => {
                // Remove common bullets
                const text = line.replace(/^[-•*]|\d+\.\s*/, '').trim();
                return {
                    id: crypto.randomUUID(),
                    text,
                    isCritical: text.toLowerCase().includes('atenção') || text.toLowerCase().includes('cuidado')
                };
            });

        if (newSteps.length > 0) {
            if (confirm(`Encontramos ${newSteps.length} passos no texto antigo. Deseja converter? Isso substituirá os passos atuais.`)) {
                onChange(newSteps);
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Passo a Passo</h3>
                <div className="flex gap-2">
                    {legacyText && steps.length === 0 && (
                        <Button variant="outline" size="sm" onClick={handleSmartConvert} className="text-primary hover:text-primary/80">
                            <Wand2 className="h-4 w-4 mr-2" />
                            Importar do Texto
                        </Button>
                    )}
                    <Button size="sm" onClick={addStep}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Passo
                    </Button>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={steps.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-3">
                        {steps.map((step, index) => (
                            <div key={step.id} className="relative">
                                <div className="absolute -left-3 top-3.5 text-xs font-semibold text-muted-foreground w-6 text-center">
                                    {index + 1}
                                </div>
                                <SortableStepRow
                                    step={step}
                                    onChange={updateStep}
                                    onRemove={removeStep}
                                />
                            </div>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {steps.length === 0 && (
                <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                    <p>Nenhum passo adicionado</p>
                    <Button variant="link" onClick={addStep}>Começar agora</Button>
                </div>
            )}
        </div>
    );
}
