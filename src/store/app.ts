"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { api } from "@/lib/client-api";
import type { CartSummaryDTO, SessionUserDTO, StoreBootstrapDTO } from "@/lib/types";

type AppState = {
  bootstrap: StoreBootstrapDTO | null;
  user: SessionUserDTO | null;
  cart: CartSummaryDTO | null;
  favorites: string[];
  cartPending: string | null; // productId con operación en curso
  city: { departamento: string; ciudad: string } | null;
  recentViews: string[];
  searchHistory: string[];
  personalization: boolean;
  initialized: boolean;

  init: () => Promise<void>;
  refreshBootstrap: () => Promise<void>;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, variantId?: string | null, quantity?: number) => Promise<boolean>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeCartItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleFavorite: (productId: string) => Promise<void>;
  refreshFavorites: () => Promise<void>;
  login: (email: string, password: string) => Promise<SessionUserDTO>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<SessionUserDTO>;
  logout: () => Promise<void>;
  setCity: (city: { departamento: string; ciudad: string } | null) => void;
  pushRecentView: (slug: string) => void;
  pushSearch: (q: string) => void;
  clearSearchHistory: () => void;
  setPersonalization: (v: boolean) => void;
};

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      bootstrap: null,
      user: null,
      cart: null,
      favorites: [],
      cartPending: null,
      city: null,
      recentViews: [],
      searchHistory: [],
      personalization: true,
      initialized: false,

      init: async () => {
        try {
          const [bootstrap, me, cart] = await Promise.all([
            api.get<StoreBootstrapDTO>("/api/store"),
            api.get<{ user: SessionUserDTO | null }>("/api/auth/me"),
            api.get<CartSummaryDTO>("/api/cart"),
          ]);
          set({ bootstrap, user: me.user, cart, initialized: true });
          if (me.user) void get().refreshFavorites();
        } catch {
          set({ initialized: true });
        }
      },

      refreshBootstrap: async () => {
        try {
          const bootstrap = await api.get<StoreBootstrapDTO>("/api/store");
          set({ bootstrap });
        } catch {
          /* mantener bootstrap actual */
        }
      },

      refreshCart: async () => {
        try {
          const cart = await api.get<CartSummaryDTO>("/api/cart");
          set({ cart });
        } catch {
          /* ignorar */
        }
      },

      addToCart: async (productId, variantId, quantity = 1) => {
        set({ cartPending: productId });
        try {
          const cart = await api.post<CartSummaryDTO>("/api/cart", { productId, variantId: variantId ?? null, quantity });
          set({ cart });
          return true;
        } catch {
          return false;
        } finally {
          set({ cartPending: null });
        }
      },

      updateCartItem: async (itemId, quantity) => {
        // actualización optimista
        const current = get().cart;
        if (current) {
          const items = quantity <= 0
            ? current.items.filter((i) => i.id !== itemId)
            : current.items.map((i) => (i.id === itemId ? { ...i, quantity } : i));
          set({ cart: { ...current, items, itemCount: items.reduce((s, i) => s + i.quantity, 0) } });
        }
        try {
          const cart = await api.patch<CartSummaryDTO>("/api/cart", { id: itemId, quantity });
          set({ cart });
        } catch {
          await get().refreshCart();
        }
      },

      removeCartItem: async (itemId) => {
        const current = get().cart;
        if (current) {
          const items = current.items.filter((i) => i.id !== itemId);
          set({ cart: { ...current, items, itemCount: items.reduce((s, i) => s + i.quantity, 0) } });
        }
        try {
          const cart = await api.delete<CartSummaryDTO>(`/api/cart?id=${itemId}`);
          set({ cart });
        } catch {
          await get().refreshCart();
        }
      },

      clearCart: async () => {
        await api.delete<CartSummaryDTO>("/api/cart?all=1").catch(() => undefined);
        await get().refreshCart();
      },

      toggleFavorite: async (productId) => {
        const { user } = get();
        if (!user) throw new Error("Inicia sesión para guardar favoritos.");
        const favorites = get().favorites.includes(productId)
          ? get().favorites.filter((f) => f !== productId)
          : [...get().favorites, productId];
        set({ favorites });
        try {
          await api.post("/api/account/favorites", { productId });
        } catch {
          await get().refreshFavorites();
        }
      },

      refreshFavorites: async () => {
        try {
          const res = await api.get<{ ids: string[] }>("/api/account/favorites");
          set({ favorites: res.ids });
        } catch {
          set({ favorites: [] });
        }
      },

      login: async (email, password) => {
        const res = await api.post<{ user: SessionUserDTO }>("/api/auth/login", { email, password });
        set({ user: res.user });
        await Promise.all([get().refreshCart(), get().refreshFavorites()]);
        return res.user;
      },

      register: async (data) => {
        const res = await api.post<{ user: SessionUserDTO }>("/api/auth/register", data);
        set({ user: res.user });
        await Promise.all([get().refreshCart(), get().refreshFavorites()]);
        return res.user;
      },

      logout: async () => {
        await api.post("/api/auth/logout").catch(() => undefined);
        set({ user: null, favorites: [] });
        await get().refreshCart();
      },

      setCity: (city) => set({ city }),

      pushRecentView: (slug) => {
        const recentViews = [slug, ...get().recentViews.filter((s) => s !== slug)].slice(0, 12);
        set({ recentViews });
      },

      pushSearch: (q) => {
        const t = q.trim();
        if (t.length < 2) return;
        const searchHistory = [t, ...get().searchHistory.filter((s) => s.toLowerCase() !== t.toLowerCase())].slice(0, 8);
        set({ searchHistory });
      },

      clearSearchHistory: () => set({ searchHistory: [] }),

      setPersonalization: (v) => set({ personalization: v }),
    }),
    {
      name: "nova-app",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        city: s.city,
        recentViews: s.recentViews,
        searchHistory: s.searchHistory,
        personalization: s.personalization,
      }),
    }
  )
);
