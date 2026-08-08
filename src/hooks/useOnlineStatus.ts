import { useState, useEffect, useCallback } from 'react';

export async function checkNetworkConnectivity(): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator) return true;
  if (!navigator.onLine) return false;

  try {
    // Ping health endpoint to verify real server connectivity
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const response = await fetch('/api/health', {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response.ok || response.status < 500;
  } catch {
    return navigator.onLine;
  }
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const checkOnline = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);
    const online = await checkNetworkConnectivity();
    setIsOnline(online);
    setIsChecking(false);
    return online;
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      checkOnline();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkOnline();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkOnline]);

  return { isOnline, isChecking, checkOnline };
}
