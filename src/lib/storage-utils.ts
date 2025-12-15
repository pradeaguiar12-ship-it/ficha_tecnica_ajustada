import { toast } from "sonner";

export interface StorageResult {
    success: boolean;
    error?: string;
    quotaExceeded?: boolean;
}

/**
 * Simple FNV-1a hash for integrity check
 */
export function calculateHash(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16);
}

export function saveToStorage(key: string, data: any, isDraft = false): StorageResult {
    try {
        const wrapper = {
            data,
            timestamp: Date.now(),
            hash: calculateHash(data),
            schemaVersion: 1,
            isDraft
        };

        localStorage.setItem(key, JSON.stringify(wrapper));
        return { success: true };
    } catch (e: any) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            console.error("Storage Quota Exceeded");
            return handleQuotaExceeded(key, data);
        }
        console.error("Storage Error:", e);
        return { success: false, error: e.message };
    }
}

export function loadFromStorage<T>(key: string): T | null {
    try {
        const item = localStorage.getItem(key);
        if (!item) return null;

        const parsed = JSON.parse(item);

        // Integrity Check
        if (parsed.hash) {
            const currentHash = calculateHash(parsed.data);
            if (currentHash !== parsed.hash) {
                console.error(`Integrity Check Failed for ${key}`);
                toast.error("Dados corrompidos detectados. Revertendo para versão segura.");
                return null; // Fail integrity
            }
        }

        return parsed.data as T;
    } catch (e) {
        console.error("Load Error:", e);
        return null;
    }
}

export function getStorageTimestamp(key: string): number {
    try {
        const item = localStorage.getItem(key);
        if (!item) return 0;
        const parsed = JSON.parse(item);
        return parsed.timestamp || 0;
    } catch {
        return 0;
    }
}

function handleQuotaExceeded(key: string, data: any): StorageResult {
    // Strategy 1: Clean old drafts
    try {
        let cleared = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('draft:')) {
                const item = localStorage.getItem(k);
                if (item) {
                    try {
                        const parsed = JSON.parse(item);
                        // If older than 7 days
                        if (parsed.timestamp && (Date.now() - parsed.timestamp > 7 * 24 * 60 * 60 * 1000)) {
                            localStorage.removeItem(k);
                            cleared++;
                        }
                    } catch (e) {
                        // Corrupt item? Delete it
                        localStorage.removeItem(k);
                        cleared++;
                    }
                }
            }
        }

        if (cleared > 0) {
            // Retry save
            try {
                const wrapper = {
                    data,
                    timestamp: Date.now(),
                    hash: calculateHash(data),
                    schemaVersion: 1,
                    isDraft: true
                };
                localStorage.setItem(key, JSON.stringify(wrapper));
                return { success: true };
            } catch {
                return { success: false, quotaExceeded: true };
            }
        }

        return { success: false, quotaExceeded: true };
    } catch (e) {
        return { success: false, quotaExceeded: true };
    }
}
