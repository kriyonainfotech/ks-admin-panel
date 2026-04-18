import { User, initialUserData } from "@/lib/userData";

const STORAGE_KEY = "kriyona_users";
const DELAY = 500;

const getLocalData = (): User[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialUserData));
        return initialUserData;
    }
    return JSON.parse(stored);
};

export const userAPI = {
    getAll: async (): Promise<User[]> => {
        return new Promise((resolve) => setTimeout(() => resolve(getLocalData()), DELAY));
    },
    create: async (data: any): Promise<User> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const current = getLocalData();
                const newItem = {
                    ...data,
                    id: `usr_${Date.now()}`,
                    joinedDate: new Date().toISOString(),
                    source: "Admin Created"
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify([newItem, ...current]));
                resolve(newItem);
            }, DELAY);
        });
    },
    update: async (id: string, updates: any): Promise<User> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const current = getLocalData();
                const idx = current.findIndex(u => u.id === id);
                if (idx !== -1) {
                    current[idx] = { ...current[idx], ...updates };
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
                    resolve(current[idx]);
                }
            }, DELAY);
        });
    },
    delete: async (id: string): Promise<void> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const current = getLocalData().filter(u => u.id !== id);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
                resolve();
            }, DELAY);
        });
    }
};