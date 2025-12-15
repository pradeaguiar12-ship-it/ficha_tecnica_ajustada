/**
 * Gerador de PDF para Fichas Técnicas
 * 
 * Gera PDFs profissionais das fichas técnicas usando @react-pdf/renderer
 * 
 * @module lib/pdf-generator
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Font,
} from '@react-pdf/renderer';
import { TechnicalSheet } from './mock-data';
import { formatCurrency, formatPercent, formatTime } from './calculations';

// ============================================
// ESTILOS DO PDF
// ============================================

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #1a1a1a',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a1a1a',
    borderBottom: '1 solid #e0e0e0',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    fontSize: 10,
  },
  label: {
    width: '40%',
    color: '#666',
    fontWeight: 'bold',
  },
  value: {
    width: '60%',
    color: '#1a1a1a',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 8,
    fontSize: 9,
    fontWeight: 'bold',
    borderBottom: '1 solid #e0e0e0',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    fontSize: 9,
    borderBottom: '1 solid #f0f0f0',
  },
  tableCell: {
    flex: 1,
  },
  tableCellSmall: {
    flex: 0.5,
  },
  costSummary: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 5,
    marginTop: 15,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    fontSize: 10,
  },
  costTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTop: '2 solid #1a1a1a',
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#999',
    textAlign: 'center',
  },
});

// ============================================
// COMPONENTE DO PDF
// ============================================

interface PDFDocumentProps {
  sheet: TechnicalSheet;
}

const PDFDocument: React.FC<PDFDocumentProps> = ({ sheet }) => {
  const totalTime = sheet.prepTimeMinutes + sheet.cookTimeMinutes + sheet.restTimeMinutes;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{sheet.name}</Text>
          <Text style={styles.subtitle}>
            Código: {sheet.code} • {sheet.category?.name || 'Sem categoria'}
          </Text>
          {sheet.description && (
            <Text style={styles.subtitle}>{sheet.description}</Text>
          )}
        </View>

        {/* Informações Gerais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Gerais</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Rendimento:</Text>
            <Text style={styles.value}>
              {sheet.yieldQuantity} {sheet.yieldUnit}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tempo Total:</Text>
            <Text style={styles.value}>{formatTime(totalTime)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>
              {sheet.status === 'ACTIVE' ? 'Ativa' : sheet.status === 'DRAFT' ? 'Rascunho' : 'Arquivada'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Criada em:</Text>
            <Text style={styles.value}>
              {new Date(sheet.createdAt).toLocaleDateString('pt-BR')}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Atualizada em:</Text>
            <Text style={styles.value}>
              {new Date(sheet.updatedAt).toLocaleDateString('pt-BR')}
            </Text>
          </View>
        </View>

        {/* Ingredientes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredientes</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, { flex: 2 }]}>Ingrediente</Text>
              <Text style={styles.tableCellSmall}>Quantidade</Text>
              <Text style={styles.tableCellSmall}>Unidade</Text>
              <Text style={styles.tableCellSmall}>FC</Text>
              <Text style={styles.tableCellSmall}>Custo</Text>
            </View>
            {sheet.ingredients.map((ing, index) => (
              <View key={ing.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>{ing.ingredient.name}</Text>
                <Text style={styles.tableCellSmall}>{ing.quantity.toFixed(2)}</Text>
                <Text style={styles.tableCellSmall}>{ing.unit}</Text>
                <Text style={styles.tableCellSmall}>{ing.correctionFactor.toFixed(2)}</Text>
                <Text style={styles.tableCellSmall}>{formatCurrency(ing.calculatedCost)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Custos e Precificação */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custos e Precificação</Text>
          <View style={styles.costSummary}>
            <View style={styles.costRow}>
              <Text>Custo de Ingredientes:</Text>
              <Text>{formatCurrency(sheet.totalIngredientCost)}</Text>
            </View>
            <View style={styles.costRow}>
              <Text>Custos Indiretos:</Text>
              <Text>{formatCurrency(sheet.overheadCost)}</Text>
            </View>
            <View style={styles.costRow}>
              <Text>Embalagem:</Text>
              <Text>{formatCurrency(sheet.packagingCost)}</Text>
            </View>
            <View style={styles.costRow}>
              <Text>Mão de Obra:</Text>
              <Text>
                {formatCurrency(
                  (sheet.laborCostPerHour * (sheet.prepTimeMinutes + sheet.cookTimeMinutes)) / 60
                )}
              </Text>
            </View>
            <View style={styles.costTotal}>
              <Text>Custo Total da Receita:</Text>
              <Text>{formatCurrency(sheet.totalCost)}</Text>
            </View>
            <View style={styles.costTotal}>
              <Text>Custo por {sheet.yieldUnit}:</Text>
              <Text>{formatCurrency(sheet.costPerUnit)}</Text>
            </View>
            <View style={styles.costTotal}>
              <Text>Preço Sugerido:</Text>
              <Text>{formatCurrency(sheet.suggestedPrice)}</Text>
            </View>
            <View style={styles.costTotal}>
              <Text>Margem de Lucro:</Text>
              <Text>{formatPercent(sheet.actualMargin)}</Text>
            </View>
          </View>
        </View>

        {/* Instruções */}
        {sheet.instructions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Modo de Preparo</Text>
            <Text style={{ fontSize: 10, lineHeight: 1.5, color: '#1a1a1a' }}>
              {sheet.instructions}
            </Text>
          </View>
        )}

        {/* Dicas */}
        {sheet.tips && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dicas do Chef</Text>
            <Text style={{ fontSize: 10, lineHeight: 1.5, color: '#1a1a1a' }}>
              {sheet.tips}
            </Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Gerado em {new Date().toLocaleDateString('pt-BR')} às{' '}
          {new Date().toLocaleTimeString('pt-BR')} • Meu Chef Digital
        </Text>
      </Page>
    </Document>
  );
};

// ============================================
// FUNÇÕES DE EXPORTAÇÃO
// ============================================

/**
 * Gera e baixa o PDF da ficha técnica
 */
export function generatePDF(sheet: TechnicalSheet): void {
  // Esta função será usada com PDFDownloadLink no componente React
  // A implementação real do download é feita no componente
}

/**
 * Componente React para download de PDF
 */
export function PDFDownloadButton({ sheet }: { sheet: TechnicalSheet }) {
  const fileName = `${sheet.code}-${sheet.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`;

  return (
    <PDFDownloadLink
      document={<PDFDocument sheet={sheet} />}
      fileName={fileName}
      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
    >
      {({ blob, url, loading, error }) =>
        loading ? 'Gerando PDF...' : error ? 'Erro ao gerar PDF' : 'Baixar PDF'
      }
    </PDFDownloadLink>
  );
}

export default PDFDocument;

