import { Link } from "react-router-dom";
import { ChefHat, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  title = "Nenhuma ficha técnica encontrada",
  description = "Comece criando sua primeira ficha técnica para calcular custos e preços de suas receitas.",
  actionLabel = "Criar primeira ficha",
  actionHref = "/ficha-tecnica/nova",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="relative mb-6">
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
          <ChefHat className="h-12 w-12 text-primary/40" />
        </div>
        <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full gradient-primary flex items-center justify-center shadow-glow">
          <Plus className="h-4 w-4 text-white" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>

      <Button asChild variant="gradient" size="lg">
        <Link to={actionHref}>
          <Plus className="h-5 w-5" />
          {actionLabel}
        </Link>
      </Button>
    </motion.div>
  );
}
