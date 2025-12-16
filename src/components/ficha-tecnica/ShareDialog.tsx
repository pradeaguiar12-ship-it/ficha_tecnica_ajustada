import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TechnicalSheet } from "@/lib/mock-data";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { KitchenTemplate, ManagementTemplate, PDFConfig } from "./PDFTemplates";
import { Share2, Printer, FileText, Smartphone, Download } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// For now, I will use a simple SVG replacement if the package is not available, but user said 'Best in Market' so I'll try to be robust. 
// I'll assume qrcode.react might be missing and use a placeholder to avoid breaking the build if it's not there, 
// OR I will simply use a nice UI placeholder if I can't install it.
// Actually, I'll use a simple URL generator for the QR code image which is safer without installing new deps if restricted:
// `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${url}`
// But better to use client side. I'll use a simple SVG component for now to represent it if I can't install. 

interface ShareDialogProps {
    sheet: TechnicalSheet;
}

const STORAGE_KEY = 'share_prefs_v1';

export function ShareDialog({ sheet }: ShareDialogProps) {
    // Mock URL for the sheet (in a real app this would be the public URL)
    const shareUrl = `${window.location.origin}/ficha-tecnica/${sheet.id}`;
    const [isOpen, setIsOpen] = useState(false);

    // Persisted Config
    const [config, setConfig] = useState<PDFConfig>({
        showCosts: true,
        showNutrition: true,
        showLogo: true
    });

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setConfig(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse share prefs", e);
            }
        }
    }, []);

    const updateConfig = (key: keyof PDFConfig, value: boolean) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Exportar / Compartilhar</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Exportar Ficha Técnica</DialogTitle>
                    <DialogDescription>
                        Escolha o formato ideal para sua necessidade.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-between gap-4 p-4 bg-muted/30 rounded-lg mb-2">
                    <div className="flex flex-col gap-3 w-full">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Personalizar Exportação</Label>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="show-costs" className="text-sm cursor-pointer">Exibir Custos</Label>
                            <Switch
                                id="show-costs"
                                checked={config.showCosts}
                                onCheckedChange={(c) => updateConfig('showCosts', c)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="show-nutrition" className="text-sm cursor-pointer">Exibir Nutrição</Label>
                            <Switch
                                id="show-nutrition"
                                checked={config.showNutrition}
                                onCheckedChange={(c) => updateConfig('showNutrition', c)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="show-logo" className="text-sm cursor-pointer">Exibir Logo</Label>
                            <Switch
                                id="show-logo"
                                checked={config.showLogo}
                                onCheckedChange={(c) => updateConfig('showLogo', c)}
                            />
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="kitchen" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="kitchen">Cozinha</TabsTrigger>
                        <TabsTrigger value="management">Gerencial</TabsTrigger>
                        <TabsTrigger value="digital">Digital</TabsTrigger>
                    </TabsList>

                    <TabsContent value="kitchen" className="space-y-4 py-4">
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-muted/50">
                            <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">Modo Operacional</p>
                            <p className="text-xs text-muted-foreground text-center mt-1">
                                Focado na produção. Apenas ingredientes, preparo e dicas. Sem valores.
                            </p>
                        </div>
                        <PDFDownloadLink
                            document={<KitchenTemplate sheet={sheet} config={config} />}
                            fileName={`${sheet.name?.toLowerCase().replace(/\s+/g, '-') || 'ficha'}-cozinha.pdf`}
                            className="block w-full"
                        >
                            {({ loading, error }) => (
                                <div className={`w-full inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${error
                                        ? 'bg-destructive text-destructive-foreground'
                                        : loading
                                            ? 'bg-primary/70 text-primary-foreground cursor-wait'
                                            : 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer'
                                    }`}>
                                    <Download className="h-4 w-4" />
                                    {error ? `Erro: ${error}` : loading ? 'Gerando PDF...' : 'Baixar PDF Cozinha'}
                                </div>
                            )}
                        </PDFDownloadLink>
                    </TabsContent>

                    <TabsContent value="management" className="space-y-4 py-4">
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-muted/50">
                            <Printer className="h-12 w-12 text-primary mb-2" />
                            <p className="text-sm font-medium">Relatório Completo</p>
                            <p className="text-xs text-muted-foreground text-center mt-1">
                                Inclui custos, margens, preços e dados financeiros.
                            </p>
                        </div>
                        <PDFDownloadLink
                            document={<ManagementTemplate sheet={sheet} config={config} />}
                            fileName={`${sheet.name?.toLowerCase().replace(/\s+/g, '-') || 'ficha'}-gerencial.pdf`}
                            className="block w-full"
                        >
                            {({ loading, error }) => (
                                <div className={`w-full inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${error
                                        ? 'bg-destructive text-destructive-foreground'
                                        : loading
                                            ? 'bg-primary/70 text-primary-foreground cursor-wait'
                                            : 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer'
                                    }`}>
                                    <Download className="h-4 w-4" />
                                    {error ? `Erro: ${error}` : loading ? 'Gerando PDF...' : 'Baixar PDF Gerencial'}
                                </div>
                            )}
                        </PDFDownloadLink>
                    </TabsContent>

                    <TabsContent value="digital" className="space-y-4 py-4">
                        <div className="flex flex-col items-center justify-center space-y-4">
                            {/* QR Code Placeholder - using an img from a reliable public API for now to avoid bulky deps if not needed, 
                   or I can implement a simple SVG generator. 
                   For "Best in Market", I'll use the API for now or better, I will assume the user has internet. 
                   Actually, let's use a very simple SVG approach to avoid external deps if possible, but 
                   creating a QR code from scratch is complex. I'll use the API approach for MVP reliability.
                */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}`}
                                    alt="QR Code"
                                    className="h-32 w-32"
                                />
                            </div>

                            <div className="text-center space-y-1">
                                <p className="text-sm font-medium">Visualização Mobile</p>
                                <p className="text-xs text-muted-foreground">Escaneie para abrir no celular da cozinha</p>
                            </div>

                            <div className="flex w-full gap-2">
                                <Button variant="outline" className="flex-1" onClick={() => {
                                    navigator.clipboard.writeText(shareUrl);
                                    // toast("Link copiado!"); // Assuming toast context is available or passed
                                }}>
                                    Copiar Link
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
