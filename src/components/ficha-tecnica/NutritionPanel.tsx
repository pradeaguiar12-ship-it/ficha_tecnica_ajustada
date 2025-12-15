import { memo } from "react";
import { NutritionData } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface NutritionPanelProps {
    data?: NutritionData;
    onChange: (data: NutritionData) => void;
}

export const defaultNutritionData: NutritionData = {
    portionSize: 100,
    portionUnit: "g",
    calories: 0,
    carbohydrates: 0,
    protein: 0,
    fat: 0,
    fiber: 0,
    sodium: 0,
};

const NutritionRow = ({ label, value, unit, onChange }: { label: string; value: number; unit: string; onChange: (val: number) => void }) => (
    <div className="flex items-center justify-between py-2 border-b last:border-0 border-dashed border-border/50">
        <span className="text-sm text-foreground">{label}</span>
        <div className="flex items-center gap-2">
            <Input
                type="number"
                value={value || ""}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                className="w-20 h-8 text-right font-mono"
            />
            <span className="text-xs text-muted-foreground w-6">{unit}</span>
        </div>
    </div>
);

export const NutritionPanel = memo(({ data = defaultNutritionData, onChange }: NutritionPanelProps) => {
    const updateField = (field: keyof NutritionData, value: number | string) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Editor */}
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Porção</Label>
                        <Input
                            type="number"
                            value={data.portionSize}
                            onChange={(e) => updateField("portionSize", parseFloat(e.target.value) || 0)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Unidade</Label>
                        <Select
                            value={data.portionUnit}
                            onValueChange={(val) => updateField("portionUnit", val)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="g">Gramas (g)</SelectItem>
                                <SelectItem value="ml">Mililitros (ml)</SelectItem>
                                <SelectItem value="unidade">Unidade</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="bg-card/50 rounded-xl p-4 border space-y-2">
                    <h4 className="font-semibold text-sm mb-4">Macronutrientes</h4>
                    <NutritionRow label="Valor Energético (kcal)" value={data.calories} unit="kcal" onChange={(v) => updateField("calories", v)} />
                    <NutritionRow label="Carboidratos" value={data.carbohydrates} unit="g" onChange={(v) => updateField("carbohydrates", v)} />
                    <NutritionRow label="Proteínas" value={data.protein} unit="g" onChange={(v) => updateField("protein", v)} />
                    <NutritionRow label="Gorduras Totais" value={data.fat} unit="g" onChange={(v) => updateField("fat", v)} />
                    <NutritionRow label="Fibra Alimentar" value={data.fiber} unit="g" onChange={(v) => updateField("fiber", v)} />
                    <NutritionRow label="Sódio" value={data.sodium} unit="mg" onChange={(v) => updateField("sodium", v)} />
                </div>
            </div>

            {/* Label Preview */}
            <div className="flex justify-center">
                <div className="border-2 border-primary/20 bg-background rounded-xl p-6 shadow-sm w-full max-w-sm">
                    <h3 className="font-bold text-center text-lg border-b-2 border-foreground pb-2 mb-2">INFORMAÇÃO NUTRICIONAL</h3>
                    <div className="text-sm mb-4 flex justify-between">
                        <span>Porção de {data.portionSize}{data.portionUnit}</span>
                    </div>

                    <div className="space-y-1 text-sm border-t border-foreground pt-2">
                        <div className="flex justify-between font-bold border-b py-1">
                            <span>Quantidade por porção</span>
                            <span>%VD*</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                            <span>Valor Energético</span>
                            <span>{data.calories} kcal</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                            <span>Carboidratos</span>
                            <span>{data.carbohydrates}g</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                            <span>Proteínas</span>
                            <span>{data.protein}g</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                            <span>Gorduras Totais</span>
                            <span>{data.fat}g</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                            <span>Fibra Alimentar</span>
                            <span>{data.fiber}g</span>
                        </div>
                        <div className="flex justify-between py-1 border-b">
                            <span>Sódio</span>
                            <span>{data.sodium}mg</span>
                        </div>
                    </div>
                    <p className="text-[10px] mt-4 text-muted-foreground leading-tight">
                        * % Valores Diários de referência com base em uma dieta de 2.000 kcal ou 8.400 kJ. Seus valores diários podem ser maiores ou menores dependendo de suas necessidades energéticas.
                    </p>
                </div>
            </div>
        </div>
    );
});
