"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import type { CartLine } from "@/lib/types";

const STORAGE_KEY = "agromeed.quote.v2";
const EMPTY: CartLine[] = [];

/**
 * السلة تعيش في مخزن خارجي مدعوم بـ localStorage، ويقرأها React عبر
 * useSyncExternalStore — فلا حاجة لتحديث الحالة داخل effect عند الإماهة.
 */
let state: CartLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    if (Array.isArray(parsed)) {
      state = parsed.filter(
        (l): l is CartLine =>
          !!l && typeof l === "object" && typeof (l as CartLine).slug === "string",
      );
    }
  } catch {
    // بيانات تالفة في التخزين — نبدأ بسلة فارغة
  }
}

function emit(next: CartLine[]) {
  state = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // التخزين ممتلئ أو محظور — السلة تبقى في الذاكرة
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  load();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const getSnapshot = () => state;
const getServerSnapshot = () => EMPTY;

type CartContextValue = {
  lines: CartLine[];
  count: number;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  remove: (slug: string, size: string) => void;
  setQty: (slug: string, size: string, qty: number) => void;
  clear: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isOpen, setIsOpen] = useState(false);

  const add = useCallback((line: Omit<CartLine, "qty">, qty = 1) => {
    const i = state.findIndex((l) => l.slug === line.slug && l.size === line.size);
    if (i === -1) {
      emit([...state, { ...line, qty }]);
    } else {
      const next = [...state];
      next[i] = { ...next[i], qty: next[i].qty + qty };
      emit(next);
    }
    setIsOpen(true);
  }, []);

  const remove = useCallback((slug: string, size: string) => {
    emit(state.filter((l) => !(l.slug === slug && l.size === size)));
  }, []);

  const setQty = useCallback((slug: string, size: string, qty: number) => {
    emit(
      state
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
      clear: () => emit([]),
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
