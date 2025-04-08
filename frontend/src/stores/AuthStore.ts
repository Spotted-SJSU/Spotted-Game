import { create } from "zustand";
import { User } from "../types/auth/User";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthStore {
  user: User | null;
  setUser: (newUser: User) => void;
  resetUser: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (newUser) => set(() => ({ user: newUser })),
      resetUser: () => set(() => ({ user: null })),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
