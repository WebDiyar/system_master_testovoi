import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export type Toast = {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
};

type NotificationState = {
  items: Toast[];
  push: (toast: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
  clear: () => void;
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],
  push: ({ title, message, type }) => {
    const id = crypto.randomUUID();
    set({ items: [...get().items, { id, title, message, type }] });
    return id;
  },
  dismiss: (id) => set({ items: get().items.filter((toast) => toast.id !== id) }),
  clear: () => set({ items: [] }),
}));
