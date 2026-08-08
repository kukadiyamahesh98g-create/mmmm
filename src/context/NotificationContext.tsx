import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { AppNotification } from '../types';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadNotifications: AppNotification[];
  unreadCount: number;
  activeNotification: AppNotification | null;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotificationBar: (id?: string) => void;
  deleteNotification: (id: string) => Promise<void>;
  sendNotification: (notif: { title: string; body: string; type: AppNotification['type']; targetUserUid?: string }) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [allNotifications, setAllNotifications] = useState<AppNotification[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [dismissedBarIds, setDismissedBarIds] = useState<string[]>([]);

  // Unique storage key for current user or guest
  const storageKey = useMemo(() => {
    return `1xluck_read_notifs_${currentUser?.uid || 'guest'}`;
  }, [currentUser?.uid]);

  // Load read IDs from localStorage when user changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setReadIds(JSON.parse(saved));
      } else {
        setReadIds([]);
      }
    } catch {
      setReadIds([]);
    }
  }, [storageKey]);

  // Save read IDs to localStorage
  const saveReadIds = (newReadIds: string[]) => {
    setReadIds(newReadIds);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newReadIds));
    } catch {
      // Ignore storage errors
    }
  };

  // Subscribe to Firestore notifications in real time
  useEffect(() => {
    const path = 'notifications';
    const q = query(collection(db, path));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: AppNotification[] = [];
        snap.docs.forEach((d) => {
          const data = d.data();
          // Filter by target user if specified
          if (!data.targetUserUid || data.targetUserUid === currentUser?.uid) {
            list.push({
              id: d.id,
              title: data.title || 'Notification',
              body: data.body || '',
              type: data.type || 'system',
              createdAt: data.createdAt || new Date().toISOString(),
              targetUserUid: data.targetUserUid,
            });
          }
        });

        // Sort descending by date
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAllNotifications(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );

    return () => unsub();
  }, [currentUser?.uid]);

  // Derive unread notifications
  const unreadNotifications = useMemo(() => {
    return allNotifications.filter((n) => !readIds.includes(n.id));
  }, [allNotifications, readIds]);

  const unreadCount = unreadNotifications.length;

  // Derive active notification for the top notification bar
  // Shows the most recent unread notification that hasn't been dismissed in this session
  const activeNotification = useMemo(() => {
    const candidate = unreadNotifications.find((n) => !dismissedBarIds.includes(n.id));
    return candidate || null;
  }, [unreadNotifications, dismissedBarIds]);

  // Mark single item as read
  const markAsRead = (id: string) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      saveReadIds(updated);
    }
  };

  // Mark all current notifications as read
  const markAllAsRead = () => {
    const allIds = allNotifications.map((n) => n.id);
    const merged = Array.from(new Set([...readIds, ...allIds]));
    saveReadIds(merged);
    setDismissedBarIds(allIds);
  };

  // Dismiss top notification bar for a specific or active notification
  const dismissNotificationBar = (id?: string) => {
    const targetId = id || activeNotification?.id;
    if (targetId) {
      if (!dismissedBarIds.includes(targetId)) {
        setDismissedBarIds((prev) => [...prev, targetId]);
      }
      markAsRead(targetId);
    }
  };

  // Delete notification from Firestore
  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  // Helper to send a new real notification
  const sendNotification = async (notif: {
    title: string;
    body: string;
    type: AppNotification['type'];
    targetUserUid?: string;
  }) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        ...notif,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to send notification:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications: allNotifications,
        unreadNotifications,
        unreadCount,
        activeNotification,
        markAsRead,
        markAllAsRead,
        dismissNotificationBar,
        deleteNotification,
        sendNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
