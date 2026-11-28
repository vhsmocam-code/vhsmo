"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { buildContents, pixel } from "@/lib/meta-pixel";

export interface CartItem {
  id: string;
  name: string;
  variant?: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "hydrate"; items: CartItem[] }
  | { type: "add"; item: Omit<CartItem, "quantity">; quantity: number }
  | { type: "remove"; id: string; variant?: string }
  | { type: "setQuantity"; id: string; variant?: string; quantity: number }
  | { type: "clear" };

// v1 ("aperture-cart-v1") predates the Supabase products table - its lines
// carried made-up ids and colours ("vhsmo-camera" / "Blush") that polluted
// real orders. Bumping the key abandons those carts rather than migrating.
const STORAGE_KEY = "vhsmo-cart-v2";
const TAX_RATE = 0.0; // Placeholder - calculated at real checkout
const FREE_SHIPPING = true;

function sameLine(a: CartItem, id: string, variant?: string) {
  return a.id === id && (a.variant ?? "") === (variant ?? "");
}

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return { items: action.items };
    case "add": {
      const existing = state.items.find((i) =>
        sameLine(i, action.item.id, action.item.variant),
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            sameLine(i, action.item.id, action.item.variant)
              ? { ...i, quantity: i.quantity + action.quantity }
              : i,
          ),
        };
      }
      return {
        items: [...state.items, { ...action.item, quantity: action.quantity }],
      };
    }
    case "remove":
      return {
        items: state.items.filter(
          (i) => !sameLine(i, action.id, action.variant),
        ),
      };
    case "setQuantity":
      return {
        items: state.items
          .map((i) =>
            sameLine(i, action.id, action.variant)
              ? { ...i, quantity: Math.max(0, action.quantity) }
              : i,
          )
          .filter((i) => i.quantity > 0),
      };
    case "clear":
      return { items: [] };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  isOpen: boolean;
  isHydrated: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string, variant?: string) => void;
  setQuantity: (id: string, quantity: number, variant?: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) dispatch({ type: "hydrate", items: parsed });
      }
    } catch {
      /* ignore corrupt storage */
    }
    setIsHydrated(true);
  }, []);

  // Persist on every change (after hydration).
  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      /* storage may be full or blocked */
    }
  }, [state.items, isHydrated]);

  // Sync across tabs.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          dispatch({ type: "hydrate", items: JSON.parse(e.newValue) });
        } catch {
          /* ignore */
        }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      dispatch({ type: "add", item, quantity });
      setIsOpen(true);
      // Meta Pixel: every add-to-cart path (Reserve button, header, drawer) lands here.
      pixel("AddToCart", {
        ...buildContents([{ id: item.id, quantity, price: item.price }]),
        content_name: item.name,
      });
    },
    [],
  );

  const removeItem = useCallback(
    (id: string, variant?: string) => dispatch({ type: "remove", id, variant }),
    [],
  );

  const setQuantity = useCallback(
    (id: string, quantity: number, variant?: string) =>
      dispatch({ type: "setQuantity", id, variant, quantity }),
    [],
  );

  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  const derived = useMemo(() => {
    const subtotal = state.items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0,
    );
    const count = state.items.reduce((sum, i) => sum + i.quantity, 0);
    const shipping = FREE_SHIPPING ? 0 : 0;
    const tax = +(subtotal * TAX_RATE).toFixed(2);
    const total = subtotal + shipping + tax;
    return { subtotal, count, shipping, tax, total };
  }, [state.items]);

  const value: CartContextValue = {
    items: state.items,
    ...derived,
    isOpen,
    isHydrated,
    openCart,
    closeCart,
    addItem,
    removeItem,
    setQuantity,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
