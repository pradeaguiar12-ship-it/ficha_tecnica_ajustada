import React from "react";
import { Loader2, Check, AlertCircle, CloudOff } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusType = 'saved' | 'saving' | 'error' | 'unsaved';

interface StatusBadgeProps {
    status: StatusType;
    className?: string;
    lastSavedAt?: Date;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config: Record<StatusType, { icon: React.ElementType; text: string; color: string; animate?: boolean }> = {
        saved: {
            icon: Check,
            text: "Salvo",
            color: "text-emerald-600 bg-emerald-50 border-emerald-200",
        },
        saving: {
            icon: Loader2,
            text: "Salvando...",
            color: "text-blue-600 bg-blue-50 border-blue-200",
            animate: true,
        },
        error: {
            icon: AlertCircle,
            text: "Erro ao salvar",
            color: "text-red-600 bg-red-50 border-red-200",
        },
        unsaved: {
            icon: CloudOff,
            text: "Alterações não salvas",
            color: "text-amber-600 bg-amber-50 border-amber-200",
        },
    };

    const current = config[status];
    const Icon = current.icon;

    return (
        <div
            className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all duration-300",
                current.color,
                className
            )}
        >
            <Icon className={cn("h-3 w-3", current.animate && "animate-spin")} />
            <span>{current.text}</span>
        </div>
    );
}
