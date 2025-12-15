import { describe, it, expect } from 'vitest';
import {
  calculateIngredientCost,
  calculateTotalCost,
  calculateCostPerUnit,
  calculateSuggestedPrice,
  calculateActualMargin,
  formatCurrency,
  formatPercent,
  getMarginQuality,
} from '@/lib/calculations';

describe('Cálculos de Ingredientes', () => {
  describe('calculateIngredientCost', () => {
    it('deve calcular custo básico corretamente', () => {
      const cost = calculateIngredientCost(100, 'g', 10, 'kg', 1.0);
      // 100g * (10 / 1000g) = 1.0
      expect(cost).toBe(1.0);
    });

    it('deve aplicar fator de correção', () => {
      const cost = calculateIngredientCost(100, 'g', 10, 'kg', 1.2);
      // 1.0 * 1.2 = 1.2
      expect(cost).toBe(1.2);
    });

    it('deve converter unidades corretamente', () => {
      const cost = calculateIngredientCost(1, 'kg', 10, 'kg', 1.0);
      expect(cost).toBe(10.0);
    });

    it('deve arredondar para 2 casas decimais', () => {
      const cost = calculateIngredientCost(333, 'g', 10, 'kg', 1.0);
      expect(cost).toBe(3.33);
    });
  });

  describe('calculateTotalCost', () => {
    it('deve somar todos os custos', () => {
      const total = calculateTotalCost(
        100, // ingredientes
        20,  // overhead
        5,   // embalagem
        30,  // mão de obra/hora
        30,  // prep (minutos)
        30   // cook (minutos)
      );
      // 100 + 20 + 5 + (30 * 60 / 60) = 100 + 20 + 5 + 30 = 155
      expect(total).toBe(155.0);
    });

    it('deve calcular mão de obra corretamente', () => {
      const total = calculateTotalCost(100, 0, 0, 60, 30, 30);
      // 100 + 0 + 0 + (60 * 60 / 60) = 100 + 60 = 160
      expect(total).toBe(160.0);
    });
  });

  describe('calculateCostPerUnit', () => {
    it('deve dividir custo total pelo rendimento', () => {
      const costPerUnit = calculateCostPerUnit(100, 10);
      expect(costPerUnit).toBe(10.0);
    });

    it('deve retornar 0 se rendimento for 0', () => {
      const costPerUnit = calculateCostPerUnit(100, 0);
      expect(costPerUnit).toBe(0);
    });
  });

  describe('calculateSuggestedPrice', () => {
    it('deve calcular preço com margem de 30%', () => {
      const price = calculateSuggestedPrice(10, 30);
      // 10 / (1 - 0.30) = 10 / 0.70 = 14.29
      expect(price).toBe(14.29);
    });

    it('deve calcular preço com margem de 50%', () => {
      const price = calculateSuggestedPrice(10, 50);
      // 10 / (1 - 0.50) = 10 / 0.50 = 20
      expect(price).toBe(20.0);
    });

    it('deve retornar custo se margem for 0', () => {
      const price = calculateSuggestedPrice(10, 0);
      expect(price).toBe(10.0);
    });

    it('deve tratar margem >= 100%', () => {
      const price = calculateSuggestedPrice(10, 100);
      expect(price).toBe(100.0);
    });
  });

  describe('calculateActualMargin', () => {
    it('deve calcular margem corretamente', () => {
      const margin = calculateActualMargin(10, 20);
      // (20 - 10) / 20 = 0.5 = 50%
      expect(margin).toBe(50.0);
    });

    it('deve retornar 0 se preço for <= 0', () => {
      const margin = calculateActualMargin(10, 0);
      expect(margin).toBe(0);
    });

    it('deve calcular margem negativa se preço for menor que custo', () => {
      const margin = calculateActualMargin(10, 5);
      // (5 - 10) / 5 = -1.0 = -100%
      expect(margin).toBe(-100.0);
    });
  });

  describe('formatCurrency', () => {
    it('deve formatar em Real brasileiro', () => {
      const formatted = formatCurrency(10.5);
      expect(formatted).toContain('R$');
      expect(formatted).toContain('10,50');
    });

    it('deve formatar valores grandes', () => {
      const formatted = formatCurrency(1000.99);
      expect(formatted).toContain('1.000,99');
    });
  });

  describe('formatPercent', () => {
    it('deve formatar porcentagem com 1 casa decimal', () => {
      const formatted = formatPercent(30.5);
      expect(formatted).toBe('30.5%');
    });
  });

  describe('getMarginQuality', () => {
    it('deve retornar "Excelente" para margem >= 30%', () => {
      const quality = getMarginQuality(35);
      expect(quality.label).toBe('Excelente');
      expect(quality.color).toBe('success');
    });

    it('deve retornar "Boa" para margem >= 20% e < 30%', () => {
      const quality = getMarginQuality(25);
      expect(quality.label).toBe('Boa');
      expect(quality.color).toBe('warning');
    });

    it('deve retornar "Baixa" para margem < 20%', () => {
      const quality = getMarginQuality(15);
      expect(quality.label).toBe('Baixa');
      expect(quality.color).toBe('destructive');
    });
  });
});

