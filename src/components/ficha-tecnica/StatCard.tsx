import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "success" | "warning";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "default",
}: StatCardProps) {
  const variants = {
    default: "bg-card border border-border",
    primary: "gradient-primary text-white",
    success: "bg-emerald-500 text-white",
    warning: "bg-amber-500 text-white",
  };

  const iconBg = {
    default: "bg-accent",
    primary: "bg-white/20",
    success: "bg-white/20",
    warning: "bg-white/20",
  };

  const textColors = {
    default: {
      title: "text-muted-foreground",
      value: "text-foreground",
      subtitle: "text-muted-foreground",
    },
    primary: {
      title: "text-white/80",
      value: "text-white",
      subtitle: "text-white/70",
    },
    success: {
      title: "text-white/80",
      value: "text-white",
      subtitle: "text-white/70",
    },
    warning: {
      title: "text-white/80",
      value: "text-white",
      subtitle: "text-white/70",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl p-5 shadow-soft hover:shadow-medium transition-shadow",
        variants[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn("text-sm font-medium", textColors[variant].title)}>
            {title}
          </p>
          <p className={cn("text-3xl font-bold tracking-tight", textColors[variant].value)}>
            {value}
          </p>
          {subtitle && (
            <p className={cn("text-xs", textColors[variant].subtitle)}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend.isPositive ? "text-emerald-500" : "text-red-500"
            )}>
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}% vs mês anterior</span>
            </div>
          )}
        </div>
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl",
          iconBg[variant]
        )}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
