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
        className="text-center max-w-md"
      >
        {/* Ícone decorativo */}
        <div className="relative mx-auto mb-8 w-32 h-32">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-card border border-border flex items-center justify-center shadow-soft">
            <ChefHat className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>

        {/* Código de erro */}
        <h1 className="text-8xl font-bold text-gradient mb-4">404</h1>
        
        {/* Mensagem */}
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Página não encontrada
        </h2>
        <p className="text-muted-foreground mb-8">
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
