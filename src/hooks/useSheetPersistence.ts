import { useState, useEffect, useCallback, useRef } from 'react';
import { saveToStorage, loadFromStorage, getStorageTimestamp, calculateHash } from '@/lib/storage-utils';
import { toast } from 'sonner';

export type PersistenceStatus = 'saved' | 'saving' | 'error' | 'unsaved';

export function useSheetPersistence(sheetId: string, currentData: unknown) {
    const [status, setStatus] = useState<PersistenceStatus>('saved');
    const [hasNewerDraft, setHasNewerDraft] = useState(false);
    const channelRef = useRef<BroadcastChannel | null>(null);

    // Flag to prevent autosave from running until draft decision is made
    const draftHandledRef = useRef(false);
    // Store the initial data hash to compare with drafts
    const initialDataHashRef = useRef<string | null>(null);

    const draftKey = `draft:${sheetId}`;

    // Helper to create a stable hash by excluding volatile fields
    const getStableHash = useCallback((data: unknown): string => {
        if (!data || typeof data !== 'object') return '';
        // Create a copy without volatile fields that change on every render
        const { updatedAt, createdAt, ...stableData } = data as Record<string, unknown>;
        return calculateHash(stableData);
    }, []);

    // Check for newer draft on mount - ONLY ONCE
    useEffect(() => {
        if (!sheetId || !currentData) return;

        // Calculate hash of current (loaded) data
        const currentHash = getStableHash(currentData);
        initialDataHashRef.current = currentHash;

        // Check if draft exists and is different from loaded data
        const existingDraft = loadFromStorage(draftKey);
        if (existingDraft) {
            const draftHash = getStableHash(existingDraft);

            // Only show dialog if draft is DIFFERENT from current data
            if (draftHash !== currentHash) {
                setHasNewerDraft(true);
            } else {
                // Draft is same as loaded data - silently clear it
                localStorage.removeItem(draftKey);
                draftHandledRef.current = true;
            }
        } else {
            // No draft exists - mark as handled so autosave can start
            draftHandledRef.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sheetId, draftKey, getStableHash]); // Run once when sheetId changes

    // Broadcast Channel for Tab Conflict
    useEffect(() => {
        if (!sheetId) return;

        channelRef.current = new BroadcastChannel('sheet_edit_channel');

        channelRef.current.onmessage = (event) => {
            if (event.data.id === sheetId) {
                if (event.data.type === 'OPEN') {
                    toast.warning("Atenção: Esta ficha foi aberta em outra aba. Cuidado com conflitos de edição.");
                } else if (event.data.type === 'SAVED') {
                    toast.error("Atenção: Esta ficha foi salva em outra aba. Recarregue para ver as alterações.", {
                        duration: Infinity,
                        action: {
                            label: 'Recarregar',
                            onClick: () => window.location.reload()
                        }
                    });
                }
            }
        };

        // Announce open
        channelRef.current.postMessage({ type: 'OPEN', id: sheetId });

        return () => {
            channelRef.current?.close();
        };
    }, [sheetId]);

    // Autosave Draft - ONLY after draft decision is handled
    useEffect(() => {
        if (!sheetId || !currentData) return;

        // Don't autosave until the draft recovery decision has been made
        if (!draftHandledRef.current) return;

        // Don't save if data hasn't changed from initial
        if (initialDataHashRef.current && getStableHash(currentData) === initialDataHashRef.current) {
            setStatus('saved');
            return;
        }

        setStatus('saving');

        const timer = setTimeout(() => {
            const result = saveToStorage(draftKey, currentData, true);
            if (result.success) {
                setStatus('saved');
                // Notify other tabs
                channelRef.current?.postMessage({ type: 'SAVED', id: sheetId });
            } else {
                setStatus('error');
                if (result.quotaExceeded) {
                    toast.error("Sem espaço no navegador. Limpe dados antigos ou exporte backup.");
                }
            }
        }, 2000); // 2s debounce for draft

        return () => clearTimeout(timer);
    }, [currentData, draftKey, sheetId, getStableHash]);

    const recoverDraft = useCallback(() => {
        const draft = loadFromStorage(draftKey);
        if (draft) {
            return draft;
        }
        return null;
    }, [draftKey]);

    const clearDraft = useCallback(() => {
        localStorage.removeItem(draftKey);
        setHasNewerDraft(false);
        draftHandledRef.current = true; // Allow autosave to start now
        // Update the initial hash to current data to prevent immediate re-save
        // (The calling component should pass the new data after recovery)
    }, [draftKey]);

    return {
        status,
        hasNewerDraft,
        recoverDraft,
        clearDraft
    };
}
