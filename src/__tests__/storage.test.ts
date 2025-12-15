import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sheetsStorage, userIngredientsStorage, settingsStorage } from '@/lib/storage';
import { TechnicalSheet, Ingredient } from '@/lib/mock-data';
import { BusinessSettings } from '@/lib/overhead-costs';

describe('Storage System', () => {
  beforeEach(() => {
    // Limpa localStorage antes de cada teste
    localStorage.clear();
  });

  describe('sheetsStorage', () => {
    it('deve retornar array vazio quando não há fichas', () => {
      const sheets = sheetsStorage.getAll();
      expect(sheets).toEqual([]);
    });

    it('deve adicionar uma nova ficha', () => {
      const sheet: Partial<TechnicalSheet> = {
        id: 'test-1',
        name: 'Test Sheet',
        code: 'FT-TEST',
        userId: 'user-1',
        status: 'DRAFT',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      const result = sheetsStorage.add(sheet as TechnicalSheet);
      expect(result).toBe(true);

      const sheets = sheetsStorage.getAll();
      expect(sheets).toHaveLength(1);
      expect(sheets[0].name).toBe('Test Sheet');
    });

    it('deve buscar ficha por ID', () => {
      const sheet: Partial<TechnicalSheet> = {
        id: 'test-1',
        name: 'Test Sheet',
        code: 'FT-TEST',
        userId: 'user-1',
        status: 'DRAFT',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      sheetsStorage.add(sheet as TechnicalSheet);
      const found = sheetsStorage.getById('test-1');

      expect(found).toBeDefined();
      expect(found?.name).toBe('Test Sheet');
    });

    it('deve atualizar uma ficha existente', () => {
      const sheet: Partial<TechnicalSheet> = {
        id: 'test-1',
        name: 'Test Sheet',
        code: 'FT-TEST',
        userId: 'user-1',
        status: 'DRAFT',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      sheetsStorage.add(sheet as TechnicalSheet);
      const success = sheetsStorage.update('test-1', { name: 'Updated Sheet' });

      expect(success).toBe(true);

      const updated = sheetsStorage.getById('test-1');
      expect(updated?.name).toBe('Updated Sheet');
    });

    it('deve excluir uma ficha', () => {
      const sheet: Partial<TechnicalSheet> = {
        id: 'test-1',
        name: 'Test Sheet',
        code: 'FT-TEST',
        userId: 'user-1',
        status: 'DRAFT',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      sheetsStorage.add(sheet as TechnicalSheet);
      const success = sheetsStorage.delete('test-1');

      expect(success).toBe(true);

      const sheets = sheetsStorage.getAll();
      expect(sheets).toHaveLength(0);
    });

    it('deve duplicar uma ficha', () => {
      const sheet: Partial<TechnicalSheet> = {
        id: 'test-1',
        name: 'Test Sheet',
        code: 'FT-TEST',
        userId: 'user-1',
        status: 'DRAFT',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      sheetsStorage.add(sheet as TechnicalSheet);
      const duplicated = sheetsStorage.duplicate('test-1', 'test-2', 'FT-TEST2');

      expect(duplicated).toBeDefined();
      expect(duplicated?.id).toBe('test-2');
      expect(duplicated?.name).toContain('Cópia');
      expect(duplicated?.status).toBe('DRAFT');

      const sheets = sheetsStorage.getAll();
      expect(sheets).toHaveLength(2);
    });
  });

  describe('userIngredientsStorage', () => {
    it('deve retornar array vazio quando não há ingredientes', () => {
      const ingredients = userIngredientsStorage.getAll();
      expect(ingredients).toEqual([]);
    });

    it('deve adicionar um novo ingrediente', () => {
      const ingredient: Partial<Ingredient> = {
        id: 'ing-1',
        name: 'Test Ingredient',
        categoryId: 'cat-1',
        unitPrice: 10,
        priceUnit: 'kg',
        defaultCorrection: 1.0,
        userId: 'user-1',
        isActive: true,
        lastPriceUpdate: '2024-01-01',
      };

      const result = userIngredientsStorage.add(ingredient as Ingredient);
      expect(result).toBe(true);

      const ingredients = userIngredientsStorage.getAll();
      expect(ingredients).toHaveLength(1);
      expect(ingredients[0].name).toBe('Test Ingredient');
    });

    it('deve atualizar um ingrediente existente', () => {
      const ingredient: Partial<Ingredient> = {
        id: 'ing-1',
        name: 'Test Ingredient',
        categoryId: 'cat-1',
        unitPrice: 10,
        priceUnit: 'kg',
        defaultCorrection: 1.0,
        userId: 'user-1',
        isActive: true,
        lastPriceUpdate: '2024-01-01',
      };

      userIngredientsStorage.add(ingredient as Ingredient);
      const success = userIngredientsStorage.update('ing-1', { unitPrice: 15 });

      expect(success).toBe(true);

      const updated = userIngredientsStorage.getById('ing-1');
      expect(updated?.unitPrice).toBe(15);
    });

    it('deve excluir um ingrediente', () => {
      const ingredient: Partial<Ingredient> = {
        id: 'ing-1',
        name: 'Test Ingredient',
        categoryId: 'cat-1',
        unitPrice: 10,
        priceUnit: 'kg',
        defaultCorrection: 1.0,
        userId: 'user-1',
        isActive: true,
        lastPriceUpdate: '2024-01-01',
      };

      userIngredientsStorage.add(ingredient as Ingredient);
      const success = userIngredientsStorage.delete('ing-1');

      expect(success).toBe(true);

      const ingredients = userIngredientsStorage.getAll();
      expect(ingredients).toHaveLength(0);
    });
  });

  describe('settingsStorage', () => {
    it('deve retornar configurações padrão quando não há configurações salvas', () => {
      const settings = settingsStorage.get();
      expect(settings).toBeDefined();
      expect(settings.estimatedMonthlyProduction).toBeGreaterThan(0);
    });

    it('deve salvar e recuperar configurações', () => {
      const newSettings: Partial<BusinessSettings> = {
        estimatedMonthlyProduction: 1000,
        taxRate: 10,
      };

      settingsStorage.update(newSettings);
      const saved = settingsStorage.get();

      expect(saved.estimatedMonthlyProduction).toBe(1000);
      expect(saved.taxRate).toBe(10);
    });

    it('deve resetar para configurações padrão', () => {
      settingsStorage.update({ estimatedMonthlyProduction: 9999 });
      settingsStorage.reset();

      const reset = settingsStorage.get();
      expect(reset.estimatedMonthlyProduction).not.toBe(9999);
    });
  });
});

