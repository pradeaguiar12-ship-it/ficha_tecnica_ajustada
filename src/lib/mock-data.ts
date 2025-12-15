export interface IngredientCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
}

export interface RecipeCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
}

export interface Ingredient {
  id: string;
  userId: string | null;
  name: string;
  description?: string;
  unitPrice: number;
  priceUnit: string;
  defaultCorrection: number;
  supplier?: string;
  categoryId: string;
  isActive: boolean;
  lastPriceUpdate: string;
}

export interface SheetIngredient {
  id: string;
  sheetId: string;
  ingredientId: string;
  ingredient: Ingredient;
  quantity: number;
  unit: string;
  correctionFactor: number;
  calculatedCost: number;
  orderIndex: number;
  notes?: string;
}

export interface TechnicalSheet {
  id: string;
  userId: string;
  code: string;
  name: string;
  description?: string;
  categoryId: string;
  category?: RecipeCategory;
  yieldQuantity: number;
  yieldUnit: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  restTimeMinutes: number;
  instructions?: string;
  tips?: string;
  imageUrl?: string;
  overheadCost: number;
  packagingCost: number;
  laborCostPerHour: number;
  targetMargin: number;
  manualPrice?: number;
  totalIngredientCost: number;
  totalCost: number;
  costPerUnit: number;
  suggestedPrice: number;
  actualMargin: number;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  isPublic: boolean;
  ingredients: SheetIngredient[];
  createdAt: string;
  updatedAt: string;
}

export const ingredientCategories: IngredientCategory[] = [
  { id: '1', name: 'Proteínas', icon: '🥩', color: '#DC2626', sortOrder: 1 },
  { id: '2', name: 'Hortifruti', icon: '🥬', color: '#16A34A', sortOrder: 2 },
  { id: '3', name: 'Laticínios', icon: '🧀', color: '#F59E0B', sortOrder: 3 },
  { id: '4', name: 'Grãos e Cereais', icon: '🌾', color: '#D97706', sortOrder: 4 },
  { id: '5', name: 'Temperos', icon: '🌿', color: '#059669', sortOrder: 5 },
  { id: '6', name: 'Óleos e Gorduras', icon: '🫒', color: '#CA8A04', sortOrder: 6 },
  { id: '7', name: 'Doces e Açúcares', icon: '🍫', color: '#DB2777', sortOrder: 7 },
  { id: '8', name: 'Embalagens', icon: '📦', color: '#6B7280', sortOrder: 8 },
];

export const recipeCategories: RecipeCategory[] = [
  { id: '1', name: 'Entradas', icon: '🥗', color: '#10B981', sortOrder: 1 },
  { id: '2', name: 'Pratos Principais', icon: '🍽️', color: '#3B82F6', sortOrder: 2 },
  { id: '3', name: 'Sobremesas', icon: '🍰', color: '#EC4899', sortOrder: 3 },
  { id: '4', name: 'Bebidas', icon: '🍹', color: '#8B5CF6', sortOrder: 4 },
  { id: '5', name: 'Confeitaria', icon: '🧁', color: '#F472B6', sortOrder: 5 },
];

export const mockIngredients: Ingredient[] = [
  // ===== PROTEÍNAS (categoryId: '1') =====
  { id: '1', userId: null, name: 'Filé Mignon', unitPrice: 89.90, priceUnit: 'kg', defaultCorrection: 1.15, categoryId: '1', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '2', userId: null, name: 'Frango Peito', unitPrice: 24.90, priceUnit: 'kg', defaultCorrection: 1.15, categoryId: '1', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '3', userId: null, name: 'Camarão Médio', unitPrice: 79.90, priceUnit: 'kg', defaultCorrection: 1.50, categoryId: '1', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '4', userId: null, name: 'Ovo', unitPrice: 1.50, priceUnit: 'unidade', defaultCorrection: 1.10, categoryId: '1', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '17', userId: null, name: 'Picanha', unitPrice: 79.90, priceUnit: 'kg', defaultCorrection: 1.20, categoryId: '1', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '18', userId: null, name: 'Alcatra', unitPrice: 49.90, priceUnit: 'kg', defaultCorrection: 1.15, categoryId: '1', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '19', userId: null, name: 'Contra Filé', unitPrice: 54.90, priceUnit: 'kg', defaultCorrection: 1.15, categoryId: '1', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '20', userId: null, name: 'Costela Bovina', unitPrice: 34.90, priceUnit: 'kg', defaultCorrection: 1.30, categoryId: '1', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '21', userId: null, name: 'Acém', unitPrice: 32.90, priceUnit: 'kg', defaultCorrection: 1.20, categoryId: '1', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '22', userId: null, name: 'Patinho', unitPrice: 42.90, priceUnit: 'kg', defaultCorrection: 1.15, categoryId: '1', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '23', userId: null, name: 'Coxão Mole', unitPrice: 44.90, priceUnit: 'kg', defaultCorrection: 1.15, categoryId: '1', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '24', userId: null, name: 'Coxão Duro', unitPrice: 39.90, priceUnit: 'kg', defaultCorrection: 1.20, categoryId: '1', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '25', userId: null, name: 'Frango Coxa', unitPrice: 16.90, priceUnit: 'kg', defaultCorrection: 1.20, categoryId: '1', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '26', userId: null, name: 'Frango Sobrecoxa', unitPrice: 18.90, priceUnit: 'kg', defaultCorrection: 1.18, categoryId: '1', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '27', userId: null, name: 'Frango Inteiro', unitPrice: 14.90, priceUnit: 'kg', defaultCorrection: 1.35, categoryId: '1', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '28', userId: null, name: 'Pernil Suíno', unitPrice: 19.90, priceUnit: 'kg', defaultCorrection: 1.25, categoryId: '1', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '29', userId: null, name: 'Lombo Suíno', unitPrice: 29.90, priceUnit: 'kg', defaultCorrection: 1.15, categoryId: '1', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '30', userId: null, name: 'Costela Suína', unitPrice: 24.90, priceUnit: 'kg', defaultCorrection: 1.30, categoryId: '1', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '31', userId: null, name: 'Bacon', unitPrice: 49.90, priceUnit: 'kg', defaultCorrection: 1.10, categoryId: '1', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '32', userId: null, name: 'Linguiça Calabresa', unitPrice: 29.90, priceUnit: 'kg', defaultCorrection: 1.05, categoryId: '1', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '33', userId: null, name: 'Linguiça Toscana', unitPrice: 24.90, priceUnit: 'kg', defaultCorrection: 1.05, categoryId: '1', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '34', userId: null, name: 'Salmão Filé', unitPrice: 89.90, priceUnit: 'kg', defaultCorrection: 1.15, categoryId: '1', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '35', userId: null, name: 'Tilápia Filé', unitPrice: 39.90, priceUnit: 'kg', defaultCorrection: 1.10, categoryId: '1', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '36', userId: null, name: 'Bacalhau Dessalgado', unitPrice: 129.90, priceUnit: 'kg', defaultCorrection: 1.15, categoryId: '1', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '37', userId: null, name: 'Camarão Grande', unitPrice: 99.90, priceUnit: 'kg', defaultCorrection: 1.50, categoryId: '1', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '38', userId: null, name: 'Lula', unitPrice: 59.90, priceUnit: 'kg', defaultCorrection: 1.40, categoryId: '1', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '39', userId: null, name: 'Polvo', unitPrice: 119.90, priceUnit: 'kg', defaultCorrection: 1.45, categoryId: '1', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '40', userId: null, name: 'Mexilhão', unitPrice: 34.90, priceUnit: 'kg', defaultCorrection: 1.60, categoryId: '1', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '41', userId: null, name: 'Cordeiro Pernil', unitPrice: 79.90, priceUnit: 'kg', defaultCorrection: 1.25, categoryId: '1', isActive: true, lastPriceUpdate: '2024-01-15' },

  // ===== HORTIFRUTI (categoryId: '2') =====
  { id: '5', userId: null, name: 'Cebola', unitPrice: 5.90, priceUnit: 'kg', defaultCorrection: 1.15, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '6', userId: null, name: 'Alho', unitPrice: 39.90, priceUnit: 'kg', defaultCorrection: 1.30, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '7', userId: null, name: 'Tomate', unitPrice: 8.90, priceUnit: 'kg', defaultCorrection: 1.10, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '42', userId: null, name: 'Batata', unitPrice: 6.90, priceUnit: 'kg', defaultCorrection: 1.20, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '43', userId: null, name: 'Batata Doce', unitPrice: 7.90, priceUnit: 'kg', defaultCorrection: 1.15, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '44', userId: null, name: 'Cenoura', unitPrice: 5.90, priceUnit: 'kg', defaultCorrection: 1.20, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '45', userId: null, name: 'Abobrinha', unitPrice: 7.90, priceUnit: 'kg', defaultCorrection: 1.15, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '46', userId: null, name: 'Berinjela', unitPrice: 8.90, priceUnit: 'kg', defaultCorrection: 1.15, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '47', userId: null, name: 'Pimentão Verde', unitPrice: 9.90, priceUnit: 'kg', defaultCorrection: 1.15, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '48', userId: null, name: 'Pimentão Vermelho', unitPrice: 14.90, priceUnit: 'kg', defaultCorrection: 1.15, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '49', userId: null, name: 'Pimentão Amarelo', unitPrice: 14.90, priceUnit: 'kg', defaultCorrection: 1.15, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '50', userId: null, name: 'Brócolis', unitPrice: 12.90, priceUnit: 'kg', defaultCorrection: 1.40, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '51', userId: null, name: 'Couve-Flor', unitPrice: 11.90, priceUnit: 'kg', defaultCorrection: 1.45, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '52', userId: null, name: 'Repolho', unitPrice: 4.90, priceUnit: 'kg', defaultCorrection: 1.25, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '53', userId: null, name: 'Alface Americana', unitPrice: 8.90, priceUnit: 'kg', defaultCorrection: 1.30, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '54', userId: null, name: 'Alface Crespa', unitPrice: 3.90, priceUnit: 'unidade', defaultCorrection: 1.25, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '55', userId: null, name: 'Rúcula', unitPrice: 4.90, priceUnit: 'unidade', defaultCorrection: 1.20, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '56', userId: null, name: 'Espinafre', unitPrice: 14.90, priceUnit: 'kg', defaultCorrection: 1.35, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '57', userId: null, name: 'Couve Manteiga', unitPrice: 2.90, priceUnit: 'unidade', defaultCorrection: 1.20, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '58', userId: null, name: 'Agrião', unitPrice: 3.90, priceUnit: 'unidade', defaultCorrection: 1.25, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '59', userId: null, name: 'Pepino', unitPrice: 6.90, priceUnit: 'kg', defaultCorrection: 1.10, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '60', userId: null, name: 'Vagem', unitPrice: 12.90, priceUnit: 'kg', defaultCorrection: 1.15, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '61', userId: null, name: 'Ervilha Fresca', unitPrice: 19.90, priceUnit: 'kg', defaultCorrection: 1.50, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '62', userId: null, name: 'Milho Verde', unitPrice: 2.90, priceUnit: 'unidade', defaultCorrection: 1.40, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '63', userId: null, name: 'Abóbora Cabotiá', unitPrice: 5.90, priceUnit: 'kg', defaultCorrection: 1.30, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '64', userId: null, name: 'Mandioca', unitPrice: 8.90, priceUnit: 'kg', defaultCorrection: 1.35, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '65', userId: null, name: 'Inhame', unitPrice: 9.90, priceUnit: 'kg', defaultCorrection: 1.20, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '66', userId: null, name: 'Chuchu', unitPrice: 4.90, priceUnit: 'kg', defaultCorrection: 1.15, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '67', userId: null, name: 'Jiló', unitPrice: 7.90, priceUnit: 'kg', defaultCorrection: 1.15, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '68', userId: null, name: 'Quiabo', unitPrice: 11.90, priceUnit: 'kg', defaultCorrection: 1.20, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '69', userId: null, name: 'Limão', unitPrice: 6.90, priceUnit: 'kg', defaultCorrection: 1.15, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '70', userId: null, name: 'Laranja', unitPrice: 4.90, priceUnit: 'kg', defaultCorrection: 1.30, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '71', userId: null, name: 'Maçã', unitPrice: 9.90, priceUnit: 'kg', defaultCorrection: 1.10, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '72', userId: null, name: 'Banana', unitPrice: 5.90, priceUnit: 'kg', defaultCorrection: 1.25, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '73', userId: null, name: 'Morango', unitPrice: 29.90, priceUnit: 'kg', defaultCorrection: 1.15, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '74', userId: null, name: 'Manga', unitPrice: 7.90, priceUnit: 'kg', defaultCorrection: 1.35, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '75', userId: null, name: 'Abacaxi', unitPrice: 6.90, priceUnit: 'unidade', defaultCorrection: 1.45, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '76', userId: null, name: 'Maracujá', unitPrice: 12.90, priceUnit: 'kg', defaultCorrection: 1.50, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '77', userId: null, name: 'Cogumelo Paris', unitPrice: 39.90, priceUnit: 'kg', defaultCorrection: 1.10, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '78', userId: null, name: 'Cogumelo Shitake', unitPrice: 59.90, priceUnit: 'kg', defaultCorrection: 1.15, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '79', userId: null, name: 'Aspargos', unitPrice: 49.90, priceUnit: 'kg', defaultCorrection: 1.25, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '80', userId: null, name: 'Alcachofra', unitPrice: 12.90, priceUnit: 'unidade', defaultCorrection: 1.60, categoryId: '2', isActive: true, lastPriceUpdate: '2024-01-15' },

  // ===== LATICÍNIOS (categoryId: '3') =====
  { id: '8', userId: null, name: 'Leite Integral', unitPrice: 6.50, priceUnit: 'L', defaultCorrection: 1.0, categoryId: '3', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '9', userId: null, name: 'Manteiga', unitPrice: 45.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '3', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '10', userId: null, name: 'Queijo Mussarela', unitPrice: 44.90, priceUnit: 'kg', defaultCorrection: 1.05, categoryId: '3', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '81', userId: null, name: 'Leite Desnatado', unitPrice: 6.90, priceUnit: 'L', defaultCorrection: 1.0, categoryId: '3', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '82', userId: null, name: 'Creme de Leite', unitPrice: 8.90, priceUnit: 'L', defaultCorrection: 1.0, categoryId: '3', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '83', userId: null, name: 'Leite Condensado', unitPrice: 9.90, priceUnit: 'L', defaultCorrection: 1.0, categoryId: '3', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '84', userId: null, name: 'Queijo Parmesão', unitPrice: 89.90, priceUnit: 'kg', defaultCorrection: 1.05, categoryId: '3', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '85', userId: null, name: 'Queijo Provolone', unitPrice: 54.90, priceUnit: 'kg', defaultCorrection: 1.05, categoryId: '3', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '86', userId: null, name: 'Queijo Gorgonzola', unitPrice: 79.90, priceUnit: 'kg', defaultCorrection: 1.05, categoryId: '3', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '87', userId: null, name: 'Queijo Brie', unitPrice: 99.90, priceUnit: 'kg', defaultCorrection: 1.05, categoryId: '3', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '88', userId: null, name: 'Queijo Coalho', unitPrice: 39.90, priceUnit: 'kg', defaultCorrection: 1.05, categoryId: '3', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '89', userId: null, name: 'Queijo Minas Frescal', unitPrice: 34.90, priceUnit: 'kg', defaultCorrection: 1.05, categoryId: '3', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '90', userId: null, name: 'Queijo Cottage', unitPrice: 29.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '3', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '91', userId: null, name: 'Requeijão Cremoso', unitPrice: 24.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '3', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '92', userId: null, name: 'Cream Cheese', unitPrice: 39.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '3', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '93', userId: null, name: 'Ricota', unitPrice: 24.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '3', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '94', userId: null, name: 'Iogurte Natural', unitPrice: 14.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '3', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '95', userId: null, name: 'Iogurte Grego', unitPrice: 24.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '3', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '96', userId: null, name: 'Chantilly', unitPrice: 19.90, priceUnit: 'L', defaultCorrection: 1.0, categoryId: '3', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '97', userId: null, name: 'Mascarpone', unitPrice: 69.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '3', isActive: true, lastPriceUpdate: '2024-01-15' },

  // ===== GRÃOS E CEREAIS (categoryId: '4') =====
  { id: '11', userId: null, name: 'Arroz Branco', unitPrice: 6.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '4', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '12', userId: null, name: 'Farinha de Trigo', unitPrice: 5.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '4', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '98', userId: null, name: 'Arroz Integral', unitPrice: 8.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '4', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '99', userId: null, name: 'Arroz Arbóreo', unitPrice: 24.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '4', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '100', userId: null, name: 'Arroz Japonês', unitPrice: 19.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '4', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '101', userId: null, name: 'Feijão Carioca', unitPrice: 8.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '4', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '102', userId: null, name: 'Feijão Preto', unitPrice: 9.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '4', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '103', userId: null, name: 'Feijão Branco', unitPrice: 14.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '4', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '104', userId: null, name: 'Lentilha', unitPrice: 12.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '4', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '105', userId: null, name: 'Grão de Bico', unitPrice: 14.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '4', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '106', userId: null, name: 'Quinoa', unitPrice: 34.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '4', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '107', userId: null, name: 'Aveia em Flocos', unitPrice: 12.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '4', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '108', userId: null, name: 'Farinha de Rosca', unitPrice: 8.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '4', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '109', userId: null, name: 'Farinha de Milho', unitPrice: 6.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '4', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '110', userId: null, name: 'Fubá', unitPrice: 5.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '4', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '111', userId: null, name: 'Amido de Milho', unitPrice: 9.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '4', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '112', userId: null, name: 'Polvilho Doce', unitPrice: 12.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '4', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '113', userId: null, name: 'Polvilho Azedo', unitPrice: 14.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '4', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '114', userId: null, name: 'Macarrão Espaguete', unitPrice: 6.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '4', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '115', userId: null, name: 'Macarrão Penne', unitPrice: 7.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '4', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '116', userId: null, name: 'Lasanha Massa', unitPrice: 12.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '4', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '117', userId: null, name: 'Pão de Forma', unitPrice: 9.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '4', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '118', userId: null, name: 'Pão Francês', unitPrice: 14.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '4', isActive: true, lastPriceUpdate: '2024-01-15' },

  // ===== TEMPEROS (categoryId: '5') =====
  { id: '13', userId: null, name: 'Sal', unitPrice: 2.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '119', userId: null, name: 'Sal Grosso', unitPrice: 3.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '120', userId: null, name: 'Pimenta do Reino', unitPrice: 89.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '121', userId: null, name: 'Pimenta Calabresa', unitPrice: 49.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '122', userId: null, name: 'Páprica Doce', unitPrice: 59.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '123', userId: null, name: 'Páprica Defumada', unitPrice: 69.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '124', userId: null, name: 'Cominho', unitPrice: 49.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '125', userId: null, name: 'Curry', unitPrice: 59.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '126', userId: null, name: 'Açafrão/Cúrcuma', unitPrice: 79.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '127', userId: null, name: 'Canela em Pó', unitPrice: 69.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '128', userId: null, name: 'Canela em Pau', unitPrice: 89.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '129', userId: null, name: 'Cravo da Índia', unitPrice: 99.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '130', userId: null, name: 'Noz Moscada', unitPrice: 149.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '131', userId: null, name: 'Orégano', unitPrice: 49.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '132', userId: null, name: 'Manjericão Seco', unitPrice: 59.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '133', userId: null, name: 'Tomilho', unitPrice: 69.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '134', userId: null, name: 'Alecrim', unitPrice: 59.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '135', userId: null, name: 'Sálvia', unitPrice: 79.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '136', userId: null, name: 'Louro', unitPrice: 89.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '137', userId: null, name: 'Salsa Fresca', unitPrice: 19.90, priceUnit: 'kg', defaultCorrection: 1.30, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '138', userId: null, name: 'Coentro Fresco', unitPrice: 19.90, priceUnit: 'kg', defaultCorrection: 1.30, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '139', userId: null, name: 'Cebolinha', unitPrice: 24.90, priceUnit: 'kg', defaultCorrection: 1.25, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '140', userId: null, name: 'Manjericão Fresco', unitPrice: 39.90, priceUnit: 'kg', defaultCorrection: 1.35, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '141', userId: null, name: 'Hortelã Fresca', unitPrice: 29.90, priceUnit: 'kg', defaultCorrection: 1.30, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '142', userId: null, name: 'Gengibre', unitPrice: 24.90, priceUnit: 'kg', defaultCorrection: 1.20, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '143', userId: null, name: 'Molho de Soja', unitPrice: 14.90, priceUnit: 'L', defaultCorrection: 1.0, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '144', userId: null, name: 'Molho Inglês', unitPrice: 19.90, priceUnit: 'L', defaultCorrection: 1.0, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '145', userId: null, name: 'Vinagre de Maçã', unitPrice: 12.90, priceUnit: 'L', defaultCorrection: 1.0, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '146', userId: null, name: 'Vinagre Balsâmico', unitPrice: 29.90, priceUnit: 'L', defaultCorrection: 1.0, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '147', userId: null, name: 'Mostarda Dijon', unitPrice: 39.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '148', userId: null, name: 'Extrato de Tomate', unitPrice: 14.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '5', isActive: true, lastPriceUpdate: '2024-01-15' },

  // ===== ÓLEOS E GORDURAS (categoryId: '6') =====
  { id: '14', userId: null, name: 'Azeite Extra Virgem', unitPrice: 39.90, priceUnit: 'L', defaultCorrection: 1.0, categoryId: '6', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '149', userId: null, name: 'Azeite de Oliva', unitPrice: 29.90, priceUnit: 'L', defaultCorrection: 1.0, categoryId: '6', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '150', userId: null, name: 'Óleo de Soja', unitPrice: 9.90, priceUnit: 'L', defaultCorrection: 1.0, categoryId: '6', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '151', userId: null, name: 'Óleo de Canola', unitPrice: 12.90, priceUnit: 'L', defaultCorrection: 1.0, categoryId: '6', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '152', userId: null, name: 'Óleo de Girassol', unitPrice: 11.90, priceUnit: 'L', defaultCorrection: 1.0, categoryId: '6', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '153', userId: null, name: 'Óleo de Gergelim', unitPrice: 49.90, priceUnit: 'L', defaultCorrection: 1.0, categoryId: '6', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '154', userId: null, name: 'Óleo de Coco', unitPrice: 39.90, priceUnit: 'L', defaultCorrection: 1.0, categoryId: '6', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '155', userId: null, name: 'Banha de Porco', unitPrice: 19.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '6', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '156', userId: null, name: 'Gordura Vegetal', unitPrice: 14.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '6', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '157', userId: null, name: 'Margarina', unitPrice: 12.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '6', isActive: true, lastPriceUpdate: '2024-01-15' },

  // ===== DOCES E AÇÚCARES (categoryId: '7') =====
  { id: '15', userId: null, name: 'Açúcar Cristal', unitPrice: 4.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '7', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '16', userId: null, name: 'Chocolate Meio Amargo', unitPrice: 59.90, priceUnit: 'kg', defaultCorrection: 1.10, categoryId: '7', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '158', userId: null, name: 'Açúcar Refinado', unitPrice: 5.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '7', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '159', userId: null, name: 'Açúcar Mascavo', unitPrice: 12.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '7', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '160', userId: null, name: 'Açúcar Demerara', unitPrice: 9.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '7', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '161', userId: null, name: 'Açúcar de Confeiteiro', unitPrice: 14.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '7', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '162', userId: null, name: 'Mel', unitPrice: 39.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '7', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '163', userId: null, name: 'Melado', unitPrice: 19.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '7', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '164', userId: null, name: 'Xarope de Glucose', unitPrice: 24.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '7', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '165', userId: null, name: 'Chocolate ao Leite', unitPrice: 49.90, priceUnit: 'kg', defaultCorrection: 1.10, categoryId: '7', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '166', userId: null, name: 'Chocolate Branco', unitPrice: 54.90, priceUnit: 'kg', defaultCorrection: 1.10, categoryId: '7', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '167', userId: null, name: 'Chocolate 70% Cacau', unitPrice: 79.90, priceUnit: 'kg', defaultCorrection: 1.10, categoryId: '7', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '168', userId: null, name: 'Cacau em Pó', unitPrice: 49.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '7', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '169', userId: null, name: 'Essência de Baunilha', unitPrice: 89.90, priceUnit: 'L', defaultCorrection: 1.0, categoryId: '7', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '170', userId: null, name: 'Fermento em Pó', unitPrice: 29.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '7', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '171', userId: null, name: 'Fermento Biológico', unitPrice: 39.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '7', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '172', userId: null, name: 'Bicarbonato de Sódio', unitPrice: 14.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '7', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '173', userId: null, name: 'Gelatina em Pó', unitPrice: 49.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '7', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '174', userId: null, name: 'Coco Ralado', unitPrice: 34.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '7', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '175', userId: null, name: 'Leite de Coco', unitPrice: 14.90, priceUnit: 'L', defaultCorrection: 1.0, categoryId: '7', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '176', userId: null, name: 'Doce de Leite', unitPrice: 24.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '7', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '177', userId: null, name: 'Goiabada', unitPrice: 19.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '7', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '178', userId: null, name: 'Amendoim Torrado', unitPrice: 19.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '7', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '179', userId: null, name: 'Castanha de Caju', unitPrice: 89.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '7', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '180', userId: null, name: 'Nozes', unitPrice: 119.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '7', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '181', userId: null, name: 'Amêndoas', unitPrice: 99.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '7', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '182', userId: null, name: 'Pistache', unitPrice: 149.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '7', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '183', userId: null, name: 'Uvas Passas', unitPrice: 34.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '7', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '184', userId: null, name: 'Damasco Seco', unitPrice: 59.90, priceUnit: 'kg', defaultCorrection: 1.0, categoryId: '7', isActive: true, lastPriceUpdate: '2024-01-15' },

  // ===== EMBALAGENS (categoryId: '8') =====
  { id: '185', userId: null, name: 'Embalagem Marmitex 500ml', unitPrice: 0.45, priceUnit: 'unidade', defaultCorrection: 1.0, categoryId: '8', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '186', userId: null, name: 'Embalagem Marmitex 750ml', unitPrice: 0.55, priceUnit: 'unidade', defaultCorrection: 1.0, categoryId: '8', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '187', userId: null, name: 'Embalagem Marmitex 1000ml', unitPrice: 0.65, priceUnit: 'unidade', defaultCorrection: 1.0, categoryId: '8', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '188', userId: null, name: 'Caixa para Bolo P', unitPrice: 2.90, priceUnit: 'unidade', defaultCorrection: 1.0, categoryId: '8', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '189', userId: null, name: 'Caixa para Bolo M', unitPrice: 4.90, priceUnit: 'unidade', defaultCorrection: 1.0, categoryId: '8', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '190', userId: null, name: 'Caixa para Bolo G', unitPrice: 6.90, priceUnit: 'unidade', defaultCorrection: 1.0, categoryId: '8', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '191', userId: null, name: 'Sacola Kraft P', unitPrice: 0.35, priceUnit: 'unidade', defaultCorrection: 1.0, categoryId: '8', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '192', userId: null, name: 'Sacola Kraft M', unitPrice: 0.55, priceUnit: 'unidade', defaultCorrection: 1.0, categoryId: '8', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '193', userId: null, name: 'Sacola Kraft G', unitPrice: 0.75, priceUnit: 'unidade', defaultCorrection: 1.0, categoryId: '8', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '194', userId: null, name: 'Pote Descartável 100ml', unitPrice: 0.25, priceUnit: 'unidade', defaultCorrection: 1.0, categoryId: '8', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '195', userId: null, name: 'Pote Descartável 200ml', unitPrice: 0.35, priceUnit: 'unidade', defaultCorrection: 1.0, categoryId: '8', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '196', userId: null, name: 'Pote Descartável 500ml', unitPrice: 0.55, priceUnit: 'unidade', defaultCorrection: 1.0, categoryId: '8', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '197', userId: null, name: 'Forma de Alumínio P', unitPrice: 1.90, priceUnit: 'unidade', defaultCorrection: 1.0, categoryId: '8', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '198', userId: null, name: 'Forma de Alumínio M', unitPrice: 2.90, priceUnit: 'unidade', defaultCorrection: 1.0, categoryId: '8', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '199', userId: null, name: 'Forma de Alumínio G', unitPrice: 4.90, priceUnit: 'unidade', defaultCorrection: 1.0, categoryId: '8', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '200', userId: null, name: 'Filme PVC (rolo)', unitPrice: 12.90, priceUnit: 'unidade', defaultCorrection: 1.0, categoryId: '8', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '201', userId: null, name: 'Papel Alumínio (rolo)', unitPrice: 14.90, priceUnit: 'unidade', defaultCorrection: 1.0, categoryId: '8', isActive: true, lastPriceUpdate: '2024-01-15' },
  { id: '202', userId: null, name: 'Papel Manteiga (rolo)', unitPrice: 9.90, priceUnit: 'unidade', defaultCorrection: 1.0, categoryId: '8', isActive: true, lastPriceUpdate: '2024-01-15' },
];

export const mockSheets: TechnicalSheet[] = [
  {
    id: '1',
    userId: 'user1',
    code: 'FT-A1B2C3',
    name: 'Risoto de Camarão',
    description: 'Risoto cremoso com camarão rosa e ervas finas',
    categoryId: '2',
    category: recipeCategories[1],
    yieldQuantity: 4,
    yieldUnit: 'porções',
    prepTimeMinutes: 20,
    cookTimeMinutes: 35,
    restTimeMinutes: 5,
    instructions: '1. Refogue a cebola no azeite\n2. Adicione o arroz arbóreo\n3. Vá adicionando o caldo aos poucos\n4. Finalize com os camarões',
    tips: 'Use caldo caseiro para melhor sabor',
    overheadCost: 5.00,
    packagingCost: 2.50,
    laborCostPerHour: 25.00,
    targetMargin: 35,
    totalIngredientCost: 67.50,
    totalCost: 98.00,
    costPerUnit: 24.50,
    suggestedPrice: 37.69,
    actualMargin: 35,
    status: 'ACTIVE',
    isPublic: false,
    ingredients: [
      {
        id: 'si-1-1',
        sheetId: '1',
        ingredientId: '3',
        ingredient: mockIngredients.find(i => i.id === '3')!,
        quantity: 500,
        unit: 'g',
        correctionFactor: 1.5,
        calculatedCost: 59.93,
        orderIndex: 0,
      },
      {
        id: 'si-1-2',
        sheetId: '1',
        ingredientId: '88',
        ingredient: mockIngredients.find(i => i.id === '88')!,
        quantity: 400,
        unit: 'g',
        correctionFactor: 1.0,
        calculatedCost: 3.56,
        orderIndex: 1,
      },
      {
        id: 'si-1-3',
        sheetId: '1',
        ingredientId: '42',
        ingredient: mockIngredients.find(i => i.id === '42')!,
        quantity: 100,
        unit: 'g',
        correctionFactor: 1.0,
        calculatedCost: 1.29,
        orderIndex: 2,
      },
      {
        id: 'si-1-4',
        sheetId: '1',
        ingredientId: '156',
        ingredient: mockIngredients.find(i => i.id === '156')!,
        quantity: 50,
        unit: 'ml',
        correctionFactor: 1.0,
        calculatedCost: 2.72,
        orderIndex: 3,
      },
    ],
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: '2',
    userId: 'user1',
    code: 'FT-D4E5F6',
    name: 'Petit Gateau',
    description: 'Bolo de chocolate com centro cremoso e sorvete',
    categoryId: '3',
    category: recipeCategories[2],
    yieldQuantity: 8,
    yieldUnit: 'unidades',
    prepTimeMinutes: 15,
    cookTimeMinutes: 12,
    restTimeMinutes: 0,
    overheadCost: 3.00,
    packagingCost: 1.50,
    laborCostPerHour: 25.00,
    targetMargin: 40,
    totalIngredientCost: 45.00,
    totalCost: 60.75,
    costPerUnit: 7.59,
    suggestedPrice: 12.65,
    actualMargin: 40,
    status: 'ACTIVE',
    isPublic: false,
    ingredients: [
      {
        id: 'si-2-1',
        sheetId: '2',
        ingredientId: '170',
        ingredient: mockIngredients.find(i => i.id === '170')!,
        quantity: 200,
        unit: 'g',
        correctionFactor: 1.0,
        calculatedCost: 13.98,
        orderIndex: 0,
      },
      {
        id: 'si-2-2',
        sheetId: '2',
        ingredientId: '165',
        ingredient: mockIngredients.find(i => i.id === '165')!,
        quantity: 150,
        unit: 'g',
        correctionFactor: 1.0,
        calculatedCost: 1.12,
        orderIndex: 1,
      },
      {
        id: 'si-2-3',
        sheetId: '2',
        ingredientId: '75',
        ingredient: mockIngredients.find(i => i.id === '75')!,
        quantity: 100,
        unit: 'g',
        correctionFactor: 1.0,
        calculatedCost: 2.19,
        orderIndex: 2,
      },
      {
        id: 'si-2-4',
        sheetId: '2',
        ingredientId: '30',
        ingredient: mockIngredients.find(i => i.id === '30')!,
        quantity: 4,
        unit: 'unidade',
        correctionFactor: 1.0,
        calculatedCost: 2.00,
        orderIndex: 3,
      },
    ],
    createdAt: '2024-01-08',
    updatedAt: '2024-01-12',
  },
  {
    id: '3',
    userId: 'user1',
    code: 'FT-G7H8I9',
    name: 'Carpaccio de Filé Mignon',
    description: 'Fatias finas de filé mignon com rúcula e parmesão',
    categoryId: '1',
    category: recipeCategories[0],
    yieldQuantity: 6,
    yieldUnit: 'porções',
    prepTimeMinutes: 30,
    cookTimeMinutes: 0,
    restTimeMinutes: 60,
    overheadCost: 2.00,
    packagingCost: 0,
    laborCostPerHour: 25.00,
    targetMargin: 45,
    totalIngredientCost: 89.40,
    totalCost: 103.90,
    costPerUnit: 17.32,
    suggestedPrice: 31.49,
    actualMargin: 45,
    status: 'DRAFT',
    isPublic: false,
    ingredients: [
      {
        id: 'si-3-1',
        sheetId: '3',
        ingredientId: '1',
        ingredient: mockIngredients.find(i => i.id === '1')!,
        quantity: 600,
        unit: 'g',
        correctionFactor: 1.15,
        calculatedCost: 62.03,
        orderIndex: 0,
      },
      {
        id: 'si-3-2',
        sheetId: '3',
        ingredientId: '42',
        ingredient: mockIngredients.find(i => i.id === '42')!,
        quantity: 200,
        unit: 'g',
        correctionFactor: 1.1,
        calculatedCost: 2.84,
        orderIndex: 1,
      },
      {
        id: 'si-3-3',
        sheetId: '3',
        ingredientId: '77',
        ingredient: mockIngredients.find(i => i.id === '77')!,
        quantity: 100,
        unit: 'g',
        correctionFactor: 1.0,
        calculatedCost: 6.99,
        orderIndex: 2,
      },
      {
        id: 'si-3-4',
        sheetId: '3',
        ingredientId: '156',
        ingredient: mockIngredients.find(i => i.id === '156')!,
        quantity: 30,
        unit: 'ml',
        correctionFactor: 1.0,
        calculatedCost: 1.63,
        orderIndex: 3,
      },
    ],
    createdAt: '2024-01-12',
    updatedAt: '2024-01-14',
  },
];

// Helper functions to update mock data (simulates database operations)
export function updateMockSheet(id: string, data: Partial<TechnicalSheet>): void {
  const index = mockSheets.findIndex(s => s.id === id);
  if (index !== -1) {
    mockSheets[index] = { 
      ...mockSheets[index], 
      ...data, 
      updatedAt: new Date().toISOString().split('T')[0] 
    };
  }
}

export function deleteMockSheet(id: string): void {
  const index = mockSheets.findIndex(s => s.id === id);
  if (index !== -1) {
    mockSheets.splice(index, 1);
  }
}

export const unitOptions = [
  { value: 'g', label: 'Gramas (g)' },
  { value: 'kg', label: 'Quilogramas (kg)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'L', label: 'Litros (L)' },
  { value: 'unidade', label: 'Unidade' },
  { value: 'dúzia', label: 'Dúzia' },
  { value: 'colher_sopa', label: 'Colher de sopa' },
  { value: 'colher_cha', label: 'Colher de chá' },
  { value: 'xicara', label: 'Xícara' },
];

export const priceUnitOptions = [
  { value: 'kg', label: 'kg' },
  { value: 'L', label: 'L' },
  { value: 'unidade', label: 'unidade' },
  { value: 'dúzia', label: 'dúzia' },
];

export const yieldUnitOptions = [
  { value: 'porções', label: 'Porções' },
  { value: 'unidades', label: 'Unidades' },
  { value: 'kg', label: 'Quilogramas' },
  { value: 'L', label: 'Litros' },
];

export const statusOptions = [
  { value: 'DRAFT', label: 'Rascunho', color: 'bg-amber-100 text-amber-700' },
  { value: 'ACTIVE', label: 'Ativa', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'ARCHIVED', label: 'Arquivada', color: 'bg-slate-100 text-slate-600' },
];
