"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartLine } from "@/lib/types";

const STORAGE_KEY = "agromeed.quote.v1";

type CartContextValue = {
  lines: CartLine[];
  count: number;
  add: (slug: string, size: string, qty?: number) => void;
  remove: (slug: string, size: string) => void;
  setQty: (slug: string, size: string, qty: number) => void;
  clear: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* تجاهل بيانات تالفة */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const add = useCallback((slug: string, size: string, qty = 1) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.slug === slug && l.size === size);
      if (i === -1) return [...prev, { slug, size, qty }];
      const next = [...prev];
      next[i] = { ...next[i], qty: next[i].qty + qty };
      return next;
    });
    setIsOpen(true);
  }, []);

  const remove = useCallback((slug: string, size: string) => {
    setLines((prev) => prev.filter((l) => !(l.slug === slug && l.size === size)));
  }, []);

  const setQty = useCallback((slug: string, size: string, qty: number) => {
    setLines((prev) =>
      prev
        .map((l) => (l.slug === slug && l.size === size ? { ...l, qty } : l))
        .filter((l) => l.qty > 0),
    );
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((s, l) => s + l.qty, 0),
      add,
      remove,
      setQty,
      clear: () => setLines([]),
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [lines, isOpen, add, remove, setQty],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
