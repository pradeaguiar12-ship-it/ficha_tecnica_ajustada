import { Document, Page, Text, View, StyleSheet, Image, Font, Link } from '@react-pdf/renderer';
import { TechnicalSheet, PreparationStep, NutritionData } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/calculations";

// Register fonts if needed, or use default Helvetica
Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.ttf' },
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.ttf', fontWeight: 'bold' },
    ]
});

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
        fontFamily: 'Inter',
        fontSize: 10,
        color: '#1F2937',
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    subtitle: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingBottom: 4,
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
        paddingVertical: 5,
        alignItems: 'center',
    },
    col1: { width: '40%' },
    col2: { width: '20%', textAlign: 'right' },
    col3: { width: '20%', textAlign: 'right' },
    col4: { width: '20%', textAlign: 'right' },
    bold: { fontWeight: 'bold' },
    label: {
        backgroundColor: '#F3F4F6',
        padding: 4,
        borderRadius: 4,
        fontSize: 8,
        color: '#4B5563',
    },
    totalRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingVertical: 8,
        marginTop: 5,
    },
    stepContainer: {
        marginBottom: 8,
        flexDirection: 'row',
    },
    stepIndex: {
        width: 20,
        fontWeight: 'bold',
        color: '#9CA3AF',
    },
    stepContent: {
        flex: 1,
    },
    criticalBadge: {
        color: '#D97706',
        fontWeight: 'bold',
        fontSize: 8,
        marginBottom: 2,
    },
    metaGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 15,
        backgroundColor: '#F9FAFB',
        padding: 10,
        borderRadius: 6,
    },
    metaItem: {
        width: '30%',
    },
    metaLabel: {
        fontSize: 8,
        color: '#6B7280',
    },
    metaValue: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    nutritionBox: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 6,
        padding: 10,
        marginTop: 10,
    }
});

// Config Interface
export interface PDFConfig {
    showCosts: boolean;
    showNutrition: boolean;
    showLogo: boolean;
}

interface TemplateProps {
    sheet: TechnicalSheet;
    config?: PDFConfig;
}

// Helper for default config
const defaultConfig: PDFConfig = {
    showCosts: true,
    showNutrition: true,
    showLogo: true
};

export const KitchenTemplate = ({ sheet, config = defaultConfig }: TemplateProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.subtitle}>FICHA DE PRODUÇÃO (COZINHA)</Text>
                    <Text style={styles.title}>{sheet.name}</Text>
                </View>
                {config.showLogo && (
                    <Text style={{ fontSize: 10, color: '#9CA3AF' }}>LOGO</Text> // Placeholder for Logo
                )}
            </View>

            <MetaSection sheet={sheet} />

            <IngredientsTable sheet={sheet} showCosts={false} />

            <StepsList steps={sheet.steps} legacyInstructions={sheet.instructions} />

            {sheet.tips && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dicas do Chef</Text>
                    <Text style={{ fontStyle: 'italic', backgroundColor: '#FEF3C7', padding: 8, borderRadius: 4 }}>
                        {sheet.tips}
                    </Text>
                </View>
            )}
        </Page>
    </Document>
);

export const ManagementTemplate = ({ sheet, config = defaultConfig }: TemplateProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.subtitle}>FICHA TÉCNICA GERENCIAL</Text>
                    <Text style={styles.title}>{sheet.name}</Text>
                </View>
                {config.showLogo && (
                    <Text style={{ fontSize: 10, color: '#9CA3AF' }}>LOGO</Text> // Placeholder for Logo
                )}
            </View>

            <MetaSection sheet={sheet} />

            <IngredientsTable sheet={sheet} showCosts={config.showCosts} />

            {config.showCosts && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Resumo Financeiro</Text>
                    <View style={styles.row}>
                        <Text style={styles.col1}>Custo Ingredientes</Text>
                        <Text style={[styles.col2, { width: '60%' }]}>{formatCurrency(sheet.totalIngredientCost)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.col1}>Custos Indiretos/Embalagem</Text>
                        <Text style={[styles.col2, { width: '60%' }]}>{formatCurrency(sheet.overheadCost + sheet.packagingCost)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.col1}>Custo Mão de Obra</Text>
                        <Text style={[styles.col2, { width: '60%' }]}>{formatCurrency((sheet.prepTimeMinutes + sheet.cookTimeMinutes) / 60 * sheet.laborCostPerHour)}</Text>
                    </View>
                    <View style={[styles.row, { borderTopWidth: 1, borderColor: '#000', marginTop: 5 }]}>
                        <Text style={[styles.col1, styles.bold]}>Custo Total</Text>
                        <Text style={[styles.col2, styles.bold, { width: '60%' }]}>{formatCurrency(sheet.totalCost)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={[styles.col1, styles.bold]}>Custo Unitário</Text>
                        <Text style={[styles.col2, styles.bold, { width: '60%' }]}>{formatCurrency(sheet.costPerUnit)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={[styles.col1, styles.bold]}>Preço Sugerido ({sheet.targetMargin}%)</Text>
                        <Text style={[styles.col2, styles.bold, { width: '60%', color: '#059669' }]}>{formatCurrency(sheet.suggestedPrice)}</Text>
                    </View>
                </View>
            )}

            {sheet.nutrition && config.showNutrition && (
                <View break style={styles.section}>
                    <Text style={styles.sectionTitle}>Informação Nutricional</Text>
                    <View style={styles.nutritionBox}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 5 }}>Porção de {sheet.nutrition.portionSize}{sheet.nutrition.portionUnit}</Text>
                        <Text>Calorias: {sheet.nutrition.calories} kcal</Text>
                        <Text>Carboidratos: {sheet.nutrition.carbohydrates}g</Text>
                        <Text>Proteínas: {sheet.nutrition.protein}g</Text>
                        <Text>Gorduras: {sheet.nutrition.fat}g</Text>
                    </View>
                </View>
            )}
        </Page>
    </Document>
);
