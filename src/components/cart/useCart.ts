"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  addItem,
  clearCart,
  getCartSnapshot,
  getServerCartSnapshot,
  removeItem,
  setQuantity,
  subscribeCart,
  type CartLine,
  type CartSnapshot,
  type CartVendor,
} from "@/components/cart/cart-store";

export type { CartLine, CartVendor };

export interface Cart extends CartSnapshot {
  itemCount: number;
  subtotalCents: number;
  addItem: typeof addItem;
  setQuantity: typeof setQuantity;
  removeItem: typeof removeItem;
  clear: typeof clearCart;
}

/**
 * Reads the bag. No provider needed — the store is a module singleton, so any
 * component can call this directly.
 */
export function useCart(): Cart {
  const snapshot = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getServerCartSnapshot
  );

  return useMemo(() => {
    const itemCount = snapshot.lines.reduce((sum, line) => sum + line.quantity, 0);
    const subtotalCents = snapshot.lines.reduce(
      (sum, line) => sum + line.unitPriceCents * line.quantity,
      0
    );

    return {
      ...snapshot,
      itemCount,
      subtotalCents,
      addItem,
      setQuantity,
      removeItem,
      clear: clearCart,
    };
  }, [snapshot]);
}
