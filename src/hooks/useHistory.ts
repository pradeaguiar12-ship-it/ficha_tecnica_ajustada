import { useState, useCallback, useRef } from 'react';

interface HistoryState<T> {
    past: T[];
    present: T;
    future: T[];
}

export function useHistory<T>(initialPresent: T, limit: number = 50) {
    const [state, setState] = useState<HistoryState<T>>({
        past: [],
        present: initialPresent,
        future: [],
    });

    const lastPushRef = useRef(Date.now());

    const canUndo = state.past.length > 0;
    const canRedo = state.future.length > 0;

    const undo = useCallback(() => {
        setState((currentState) => {
            if (currentState.past.length === 0) return currentState;

            const previous = currentState.past[currentState.past.length - 1];
            const newPast = currentState.past.slice(0, currentState.past.length - 1);

            return {
                past: newPast,
                present: previous,
                future: [currentState.present, ...currentState.future],
            };
        });
        return state.past[state.past.length - 1]; // Return for external sync if needed
    }, [state.past]);

    const redo = useCallback(() => {
        setState((currentState) => {
            if (currentState.future.length === 0) return currentState;

            const next = currentState.future[0];
            const newFuture = currentState.future.slice(1);

            return {
                past: [...currentState.past, currentState.present],
                present: next,
                future: newFuture,
            };
        });
        return state.future[0];
    }, [state.future]);

    // Push new state with optional debounce
    const push = useCallback((newPresent: T, debounceMs: number = 0) => {
        const now = Date.now();

        setState((currentState) => {
            // If debounce time implies we should overwrite the last "current" instead of pushing
            // Actually strictly history push usually pushes.
            // But if user is typing, we might want to REPLACE the last state if it was very recent.
            // Or just not push at all?
            // "debounce push" usually means we wait to push.
            // Here we implement "Merge if quick".

            const timeDiff = now - lastPushRef.current;
            if (debounceMs > 0 && timeDiff < debounceMs) {
                // Replace logic: just update present, don't change past
                return {
                    ...currentState,
                    present: newPresent,
                    // future cleared on new edit? standard undo logic says yes.
                    future: []
                };
            }

            const newPast = [...currentState.past, currentState.present];
            if (newPast.length > limit) {
                newPast.shift(); // Remove oldest
            }

            return {
                past: newPast,
                present: newPresent,
                future: [],
            };
        });

        if (debounceMs === 0 || now - lastPushRef.current >= debounceMs) {
            lastPushRef.current = now;
        }
    }, [limit]);

    // Force update present without history (ignore)
    const set = useCallback((newPresent: T) => {
        setState((curr) => ({ ...curr, present: newPresent }));
    }, []);

    return {
        state: state.present,
        push,
        set, // update without pushing to history (sync)
        undo,
        redo,
        canUndo,
        canRedo,
        history: state
    };
}
