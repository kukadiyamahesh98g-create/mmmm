import { useCallback, useEffect, useRef, useState } from 'react';
import { SMART_LINK_URL } from '../config/ads';

export type SmartLinkStatus = 'idle' | 'waiting_return' | 'blocked';

interface UseSmartLinkAdResult<T extends string> {
  adStatus: SmartLinkStatus;
  pendingAction: T | null;
  canConfirmReturn: boolean;
  startSmartLinkReturn: (action: T) => void;
  triggerSmartLinkAd: (action: T) => void;
  confirmManualReturn: () => void;
  resetSmartLinkState: () => void;
}

/**
 * Tracks Smart Link ad opening and detects when the user returns to the app
 * on desktop, mobile, and embedded iframe environments.
 */
export function useSmartLinkAd<T extends string>(
  onReturn: (action: T) => void
): UseSmartLinkAdResult<T> {
  const [adStatus, setAdStatus] = useState<SmartLinkStatus>('idle');
  const [pendingAction, setPendingAction] = useState<T | null>(null);
  const [canConfirmReturn, setCanConfirmReturn] = useState<boolean>(false);

  const onReturnRef = useRef(onReturn);
  onReturnRef.current = onReturn;

  const isWaitingRef = useRef<boolean>(false);
  const pendingActionRef = useRef<T | null>(null);
  const openedAtRef = useRef<number>(0);
  const leftAppRef = useRef<boolean>(false);
  const winRef = useRef<Window | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const completeFnRef = useRef<(() => void) | null>(null);

  const cleanupTracking = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    completeFnRef.current = null;
    winRef.current = null;
    isWaitingRef.current = false;
    pendingActionRef.current = null;
  }, []);

  const resetSmartLinkState = useCallback(() => {
    cleanupTracking();
    setAdStatus('idle');
    setPendingAction(null);
    setCanConfirmReturn(false);
  }, [cleanupTracking]);

  useEffect(() => {
    return () => {
      cleanupTracking();
    };
  }, [cleanupTracking]);

  const startReturnTracking = useCallback(
    (action: T) => {
      cleanupTracking();

      isWaitingRef.current = true;
      pendingActionRef.current = action;
      openedAtRef.current = Date.now();
      leftAppRef.current = false;

      setAdStatus('waiting_return');
      setPendingAction(action);
      setCanConfirmReturn(false);

      let completed = false;

      const completeReturn = () => {
        if (completed) return;
        completed = true;
        cleanupTracking();
        setAdStatus('idle');
        setPendingAction(null);
        setCanConfirmReturn(false);
        onReturnRef.current(action);
      };

      completeFnRef.current = completeReturn;

      const handleBlurOrHide = () => {
        if (document.visibilityState === 'hidden') {
          leftAppRef.current = true;
        }
      };

      const handleWindowBlur = () => {
        leftAppRef.current = true;
      };

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          leftAppRef.current = true;
          return;
        }
        if (document.visibilityState === 'visible') {
          const elapsed = Date.now() - openedAtRef.current;
          if (leftAppRef.current || elapsed >= 400) {
            completeReturn();
          }
        }
      };

      const handleFocusOrPageShow = () => {
        const elapsed = Date.now() - openedAtRef.current;
        if (document.visibilityState === 'visible' && ((leftAppRef.current && elapsed >= 300) || elapsed >= 1200)) {
          completeReturn();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('blur', handleWindowBlur);
      window.addEventListener('pagehide', handleBlurOrHide);
      window.addEventListener('focus', handleFocusOrPageShow);
      window.addEventListener('pageshow', handleFocusOrPageShow);

      const confirmTimer = window.setTimeout(() => {
        if (!completed) {
          setCanConfirmReturn(true);
        }
      }, 1500);

      const pollInterval = window.setInterval(() => {
        const elapsed = Date.now() - openedAtRef.current;
        if (winRef.current && winRef.current.closed && elapsed >= 350) {
          completeReturn();
        }
      }, 400);

      cleanupRef.current = () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleWindowBlur);
        window.removeEventListener('pagehide', handleBlurOrHide);
        window.removeEventListener('focus', handleFocusOrPageShow);
        window.removeEventListener('pageshow', handleFocusOrPageShow);
        window.clearTimeout(confirmTimer);
        window.clearInterval(pollInterval);
      };
    },
    [cleanupTracking]
  );

  const startSmartLinkReturn = useCallback(
    (action: T) => {
      if (isWaitingRef.current) return;
      winRef.current = null;
      startReturnTracking(action);
    },
    [startReturnTracking]
  );

  const triggerSmartLinkAd = useCallback(
    (action: T) => {
      if (isWaitingRef.current) return;

      let openedWin: Window | null = null;
      try {
        openedWin = window.open(SMART_LINK_URL, '_blank');
      } catch {
        openedWin = null;
      }

      if (!openedWin || openedWin.closed || typeof openedWin.closed === 'undefined') {
        setPendingAction(action);
        setAdStatus('blocked');
        return;
      }

      try {
        openedWin.opener = null;
      } catch {
        // Ignore cross-origin opener assignment restriction
      }

      winRef.current = openedWin;
      startReturnTracking(action);
    },
    [startReturnTracking]
  );

  const confirmManualReturn = useCallback(() => {
    if (completeFnRef.current) {
      completeFnRef.current();
    }
  }, []);

  return {
    adStatus,
    pendingAction,
    canConfirmReturn,
    startSmartLinkReturn,
    triggerSmartLinkAd,
    confirmManualReturn,
    resetSmartLinkState,
  };
}
