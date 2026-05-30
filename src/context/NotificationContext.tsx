import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from "react";

export type NotifType = "low_stock" | "expiring" | "bmr_pending" | "grn_pending";

export interface Notification {
  id: string;
  type: NotifType;
  message: string;
  rmCode?: string;
  bmrId?: string;
  grnNo?: string;
  /** Stable dedup key — same key won't create a duplicate unread notif. */
  key: string;
  createdAt: string;
  read: boolean;
}

interface NotificationContextType {
  notifs: Notification[];
  addNotif: (n: Omit<Notification, "id" | "createdAt" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | null>(null);
const STORAGE_KEY = "ayur_notifications";

export const useNotif = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotif must be used within NotificationProvider");
  return ctx;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifs, setNotifs] = useState<Notification[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs.slice(0, 200)));
    } catch {
      /* ignore */
    }
  }, [notifs]);

  const addNotif: NotificationContextType["addNotif"] = (n) => {
    setNotifs((prev) => {
      // Dedup: skip if an unread notif with the same key already exists
      if (prev.some((x) => x.key === n.key && !x.read)) return prev;
      const entry: Notification = {
        ...n,
        id: `ntf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
        read: false,
      };
      return [entry, ...prev];
    });
  };

  const markRead = (id: string) =>
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markAllRead = () =>
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));

  const unreadCount = useMemo(() => notifs.filter((n) => !n.read).length, [notifs]);

  return (
    <NotificationContext.Provider value={{ notifs, addNotif, markRead, markAllRead, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};
