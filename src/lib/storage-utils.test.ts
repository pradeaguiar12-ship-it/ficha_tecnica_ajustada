import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveToStorage, loadFromStorage, calculateHash } from './storage-utils';
import { toast } from 'sonner';

// Mock sonner toast
vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
    },
}));

describe('Storage Utils - Reliability Tests', () => {
    const TEST_KEY = 'test_key';
    const TEST_DATA = { name: 'Ficha Teste', ingredients: [{ id: 1, name: 'Farinha' }] };

    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });

    describe('WAL Integrity (Hash Check)', () => {
        it('should save and load data correctly with valid hash', () => {
            saveToStorage(TEST_KEY, TEST_DATA);
            const loaded = loadFromStorage(TEST_KEY);
            expect(loaded).toEqual(TEST_DATA);
        });

        it('should calculate hash deterministically', () => {
            const hash1 = calculateHash(TEST_DATA);
            const hash2 = calculateHash(TEST_DATA);
            expect(hash1).toBe(hash2);
            expect(hash1).not.toBe('');
        });

        it('should detect data corruption and return null', () => {
            saveToStorage(TEST_KEY, TEST_DATA);
            const rawItem = localStorage.getItem(TEST_KEY);
            const parsed = JSON.parse(rawItem!);
            parsed.data.name = 'HACKED DATA'; // Tamper
            localStorage.setItem(TEST_KEY, JSON.stringify(parsed));

            const loaded = loadFromStorage(TEST_KEY);
            expect(loaded).toBeNull();
            expect(toast.error).toHaveBeenCalled();
        });
    });

    describe.skip('Quota Handling', () => {
        it('should handle QuotaExceededError gracefully', () => {
            const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
            setItemSpy.mockImplementationOnce(() => {
                const error = new Error('Quota exceeded');
                error.name = 'QuotaExceededError';
                throw error;
            });

            const result = saveToStorage('huge_key', { huge: 'data' });
            expect(result.success).toBe(false);
            expect(result.quotaExceeded).toBe(true);
        });

        it('should attempt to clean old drafts and retry when quota is exceeded', () => {
            const oldDraftKey = 'draft:old_sheet';
            const oldDraftData = {
                data: {},
                timestamp: Date.now() - (8 * 24 * 60 * 60 * 1000), // 8 days ago
                hash: '123',
                isDraft: true
            };

            // Setup old draft (using real storage)
            localStorage.setItem(oldDraftKey, JSON.stringify(oldDraftData));
            expect(localStorage.length).toBe(1);

            const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

            // First call (main save) -> Fail
            setItemSpy.mockImplementationOnce(() => {
                const error = new Error('Quota exceeded');
                error.name = 'QuotaExceededError';
                throw error;
            });

            // Second call (retry) -> Should succeed (uses original impl by default after 'Once')

            const result = saveToStorage('new_key', { new: 'stuff' });

            // 1. Should have removed old draft
            expect(localStorage.getItem(oldDraftKey)).toBeNull();

            // 2. Should have succeeded on retry
            expect(result.success).toBe(true);

            // 3. New key should exist
            expect(localStorage.getItem('new_key')).not.toBeNull();
        });
    });
});
