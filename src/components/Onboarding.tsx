/**
 * Sistema de Onboarding
 * 
 * Guia novos usuários através das funcionalidades principais
 * do sistema de fichas técnicas.
 * 
 * @module components/Onboarding
 */

import { useState, useEffect } from "react";
import { X, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  target?: string; // Seletor CSS para destacar elemento
}

const ONBOARDING_STORAGE_KEY = "meu-chef-onboarding-completed";

export function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Verifica se já completou o onboarding
  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (completed === "true") {
      setIsCompleted(true);
      return;
    }

    // Mostra onboarding após 1 segundo (primeira visita)
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Bem-vindo ao Meu Chef Digital! 👋",
      description: "Sistema completo de gestão de fichas técnicas",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Você está no módulo de <strong>Fichas Técnicas</strong>, onde pode:
          </p>
          <ul className="space-y-2 list-disc list-inside text-muted-foreground">
            <li>Criar e gerenciar receitas com cálculo automático de custos</li>
            <li>Controlar ingredientes e seus preços</li>
            <li>Calcular margens de lucro e preços sugeridos</li>
            <li>Exportar fichas em PDF</li>
          </ul>
        </div>
      ),
    },
    {
      id: "sheets",
      title: "Fichas Técnicas 📋",
      description: "O coração do sistema",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            As <strong>Fichas Técnicas</strong> são receitas completas com:
          </p>
          <ul className="space-y-2 list-disc list-inside text-muted-foreground">
            <li>Lista de ingredientes com quantidades</li>
            <li>Cálculo automático de custos</li>
            <li>Sugestão de preço baseada na margem desejada</li>
            <li>Instruções de preparo e dicas</li>
          </ul>
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm">
              <strong>Dica:</strong> Use <kbd className="px-1.5 py-0.5 bg-background rounded text-xs">⌘K</kbd> para
              buscar rapidamente qualquer ficha ou ingrediente!
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "ingredients",
      title: "Ingredientes 🥘",
      description: "Base de dados de ingredientes",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Gerencie seus ingredientes:
          </p>
          <ul className="space-y-2 list-disc list-inside text-muted-foreground">
            <li>Use ingredientes do sistema (pré-cadastrados)</li>
            <li>Crie ingredientes personalizados com seus fornecedores</li>
            <li>Acompanhe histórico de preços</li>
            <li>Configure fatores de correção para desperdício</li>
          </ul>
        </div>
      ),
    },
    {
      id: "costs",
      title: "Custos e Precificação 💰",
      description: "Controle total sobre seus custos",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            O sistema calcula automaticamente:
          </p>
          <ul className="space-y-2 list-disc list-inside text-muted-foreground">
            <li>Custo de ingredientes</li>
            <li>Custos fixos (overhead) por porção</li>
            <li>Custo de embalagem e mão de obra</li>
            <li>Preço sugerido baseado na margem desejada</li>
          </ul>
          <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
            <p className="text-sm text-primary">
              <strong>Importante:</strong> Configure seus custos fixos mensais em{" "}
              <strong>Configurações de Custos</strong> para cálculos precisos!
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "features",
      title: "Funcionalidades Avançadas ⚡",
      description: "Recursos que facilitam seu trabalho",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="font-semibold text-sm mb-1">Escalar Receitas</p>
              <p className="text-xs text-muted-foreground">
                Ajuste porções e recalcule automaticamente
              </p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="font-semibold text-sm mb-1">Exportar PDF</p>
              <p className="text-xs text-muted-foreground">
                Baixe fichas técnicas profissionais
              </p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="font-semibold text-sm mb-1">Drag & Drop</p>
              <p className="text-xs text-muted-foreground">
                Reordene ingredientes arrastando
              </p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="font-semibold text-sm mb-1">Histórico</p>
              <p className="text-xs text-muted-foreground">
                Acompanhe variações de preços
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    setIsCompleted(true);
    setIsOpen(false);
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (isCompleted) return null;

  const currentStepData = steps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{currentStepData.title}</DialogTitle>
              <DialogDescription className="mt-1">
                {currentStepData.description}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Passo {currentStep + 1} de {steps.length}
              </span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStepData.content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleSkip}>
            Pular
          </Button>
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Concluir
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook para resetar onboarding (útil para testes)
 */
export function resetOnboarding() {
  localStorage.removeItem(ONBOARDING_STORAGE_KEY);
}

