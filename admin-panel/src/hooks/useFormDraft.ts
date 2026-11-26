"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface FormDraftOptions<T> {
  storageKey: string;
  formData: T;
  setFormData: (data: T) => void;
  hasMeaningfulData?: (data: T) => boolean;
  debounceMs?: number;
  enabled?: boolean;
}

export interface FormDraftResult<T> {
  hasDraft: boolean;
  draftSavedAt: string | null;
  lastSaved: Date | null;
  isSaving: boolean;
  restoreDraft: () => void;
  discardDraft: () => void;
  saveDraftNow: () => void;
  clearDraft: () => void;
  showLeaveConfirm: boolean;
  cancelLeave: () => void;
  confirmLeave: () => void;
}

interface StoredDraftPayload<T> {
  data: T;
  savedAt: string;
  timestamp: number;
}

export function useFormDraft<T>({
  storageKey,
  formData,
  setFormData,
  hasMeaningfulData,
  debounceMs = 800,
  enabled = true,
}: FormDraftOptions<T>): FormDraftResult<T> {
  const [hasDraft, setHasDraft] = useState<boolean>(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [cachedDraft, setCachedDraft] = useState<T | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Top-Right In-App Leave Confirmation State
  const [showLeaveConfirm, setShowLeaveConfirm] = useState<boolean>(false);
  const pendingUrlRef = useRef<string | null>(null);
  const isNavigatingAwayRef = useRef<boolean>(false);

  const initialJsonRef = useRef<string>("");
  const isInitializedRef = useRef<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestDataRef = useRef<T>(formData);
  latestDataRef.current = formData;

  // 1. Initial check for existing draft in localStorage on mount
  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !storageKey) return;

    try {
      initialJsonRef.current = JSON.stringify(formData);
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed: StoredDraftPayload<T> = JSON.parse(raw);
        if (parsed && parsed.data) {
          setHasDraft(true);
          setDraftSavedAt(parsed.savedAt);
          setCachedDraft(parsed.data);
          setLastSaved(new Date(parsed.timestamp));
        }
      }
    } catch (err) {
      console.warn(`[useFormDraft] Error reading draft for ${storageKey}:`, err);
    } finally {
      isInitializedRef.current = true;
    }
  }, [storageKey, enabled]);

  // 2. Universal Dirty Check
  const isDataDirty = useCallback(
    (data: T): boolean => {
      if (!data) return false;

      if (hasMeaningfulData) {
        try {
          if (hasMeaningfulData(data)) return true;
        } catch { }
      }

      try {
        const currentJson = JSON.stringify(data);
        if (initialJsonRef.current && currentJson !== initialJsonRef.current) {
          return true;
        }
      } catch { }

      return false;
    },
    [hasMeaningfulData]
  );

  // 3. Save draft to localStorage
  const saveDraft = useCallback(
    (dataToSave: T) => {
      if (!enabled || typeof window === "undefined" || !storageKey) return;
      if (!isDataDirty(dataToSave)) return;

      try {
        setIsSaving(true);
        const now = new Date();
        const timeString = now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        const payload: StoredDraftPayload<T> = {
          data: dataToSave,
          savedAt: timeString,
          timestamp: now.getTime(),
        };

        localStorage.setItem(storageKey, JSON.stringify(payload));
        setLastSaved(now);
        setCachedDraft(dataToSave);
        setDraftSavedAt(timeString);
      } catch (err) {
        console.warn("[useFormDraft] Failed to write draft to localStorage", err);
      } finally {
        setTimeout(() => setIsSaving(false), 200);
      }
    },
    [enabled, isDataDirty, storageKey]
  );

  // 4. Debounced auto-save on form data changes
  useEffect(() => {
    if (!enabled || !isInitializedRef.current || !storageKey) return;
    if (!isDataDirty(formData)) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveDraft(formData);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formData, debounceMs, enabled, isDataDirty, saveDraft, storageKey]);

  // 5. In-App Navigation Guards (Zero Browser Dialogs):
  //    Silent auto-save on page unload + Top-Right Modal for link clicks
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    // Silent save on page unload / tab close without annoying browser dialogs
    const handlePageHide = () => {
      if (isDataDirty(latestDataRef.current)) {
        saveDraft(latestDataRef.current);
      }
    };

    // Top-Right Modal for in-app link clicks (Sidebar, etc.)
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target || !target.href) return;

      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;

      if (isDataDirty(latestDataRef.current)) {
        e.preventDefault();
        e.stopPropagation();
        pendingUrlRef.current = target.href;
        setShowLeaveConfirm(true);
      }
    };

    // Intercept browser back/forward buttons
    const handlePopState = () => {
      if (isDataDirty(latestDataRef.current)) {
        window.history.pushState(null, "", window.location.href);
        pendingUrlRef.current = "BACK";
        setShowLeaveConfirm(true);
      }
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleAnchorClick, true);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleAnchorClick, true);
    };
  }, [enabled, isDataDirty, saveDraft]);

  // 6. Navigation confirmation actions
  const cancelLeave = useCallback(() => {
    setShowLeaveConfirm(false);
    pendingUrlRef.current = null;
  }, []);

  const confirmLeave = useCallback(() => {
    // 1. Mark that user confirmed leave
    isNavigatingAwayRef.current = true;

    // 2. Explicitly guarantee latest edits are saved into localStorage
    saveDraft(latestDataRef.current);

    const url = pendingUrlRef.current;
    setShowLeaveConfirm(false);
    if (url === "BACK") {
      window.history.back();
    } else if (url) {
      window.location.href = url;
    }
  }, [saveDraft]);

  // 7. User actions: Restore, Discard, Save Now, Clear
  const restoreDraft = useCallback(() => {
    if (cachedDraft) {
      setFormData(cachedDraft);
      setHasDraft(false);
    }
  }, [cachedDraft, setFormData]);

  const discardDraft = useCallback(() => {
    if (typeof window !== "undefined" && storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch { }
    }
    setHasDraft(false);
    setCachedDraft(null);
    setDraftSavedAt(null);
    setLastSaved(null);
  }, [storageKey]);

  const saveDraftNow = useCallback(() => {
    saveDraft(latestDataRef.current);
  }, [saveDraft]);

  const clearDraft = useCallback(() => {
    if (typeof window !== "undefined" && storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch { }
    }
    setHasDraft(false);
    setCachedDraft(null);
    setDraftSavedAt(null);
    setLastSaved(null);
  }, [storageKey]);

  return {
    hasDraft,
    draftSavedAt,
    lastSaved,
    isSaving,
    restoreDraft,
    discardDraft,
    saveDraftNow,
    clearDraft,
    showLeaveConfirm,
    cancelLeave,
    confirmLeave,
  };
}
