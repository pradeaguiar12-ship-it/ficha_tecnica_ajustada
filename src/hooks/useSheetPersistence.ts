import { useState, useEffect, useCallback, useRef } from 'react';
import { saveToStorage, loadFromStorage, getStorageTimestamp } from '@/lib/storage-utils';
import { toast } from 'sonner';

export type PersistenceStatus = 'saved' | 'saving' | 'error' | 'unsaved';

export function useSheetPersistence(sheetId: string, currentData: any) {
    const [status, setStatus] = useState<PersistenceStatus>('saved');
    const [hasNewerDraft, setHasNewerDraft] = useState(false);
    const channelRef = useRef<BroadcastChannel | null>(null);

    const draftKey = `draft:${sheetId}`;
    const snapshotKey = `sheet:${sheetId}`; // Assuming main storage uses this, or we rely on useSheets for main save.
    // Actually, useSheets uses 'sheets-data' key for ALL sheets.
    // So 'snapshot' concept here is slightly different: it's the specific persistence of this session.
    // But wait, the app saves to 'sheets-data'.
    // WAL means: Write to 'draft:ID' frequently. Write to 'sheets-data' (via updateSheet) less frequently or on demand.

    // Check for newer draft on mount
    useEffect(() => {
        const draftTime = getStorageTimestamp(draftKey);
        // We ideally need to know the timestamp of the loaded data.
        // Assuming loaded data is current. If draft is > now (impossible) or just exists?
        // Logic: If draft exists, prompt? 
        // Better: If draft exists, it implies a crash or unsaved session.
        if (draftTime > 0) {
            setHasNewerDraft(true);
        }
    }, [draftKey]);

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

    // Autosave Draft
    useEffect(() => {
        if (!sheetId || !currentData) return;

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
    }, [currentData, draftKey, sheetId]);

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
    }, [draftKey]);

    return {
        status,
        hasNewerDraft,
        recoverDraft,
        clearDraft
    };
}
