/**
 * The bag lives in a module-level store rather than component state so it can
 * be read with `useSyncExternalStore`. That gives us three things React state
 * couldn't: a server snapshot that matches the first client render, no
 * setState-during-effect hydration dance, and free syncing between tabs.
 */

export interface CartLine {
  /** Unique per (item + option combination), so the same dish with different
   *  modifiers stacks separately. */
  key: string;
  menuItemId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
  options: string | null;
  imageUrl: string | null;
}

export interface CartVendor {
  id: string;
  slug: string;
  name: string;
  serviceFeeCents: number;
  minOrderCents: number;
  prepTimeMins: number;
}

export interface CartSnapshot {
  /** False until localStorage has been read, so the UI can hold off. */
  ready: boolean;
  vendor: CartVendor | null;
  lines: CartLine[];
}

const STORAGE_KEY = "ppu.cart.v1";

const SERVER_SNAPSHOT: CartSnapshot = { ready: false, vendor: null, lines: [] };
const EMPTY_BAG = { vendor: null, lines: [] as CartLine[] };

let snapshot: CartSnapshot = SERVER_SNAPSHOT;
let bound = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function readStorage(): { vendor: CartVendor | null; lines: CartLine[] } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_BAG;
    const parsed = JSON.parse(raw) as Partial<CartSnapshot>;
    return {
      vendor: parsed.vendor ?? null,
      lines: Array.isArray(parsed.lines) ? parsed.lines : [],
    };
  } catch {
    // Corrupt JSON or storage blocked (private browsing): start empty.
    return EMPTY_BAG;
  }
}

function writeStorage(next: CartSnapshot) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ vendor: next.vendor, lines: next.lines })
    );
  } catch {
    // Quota or blocked storage — the bag still works for this session.
  }
}

/** Runs once, the first time any component subscribes. */
function bind() {
  if (bound) return;
  bound = true;

  snapshot = { ready: true, ...readStorage() };

  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    snapshot = { ready: true, ...readStorage() };
    emit();
  });
}

export function subscribeCart(listener: () => void): () => void {
  bind();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCartSnapshot(): CartSnapshot {
  return snapshot;
}

export function getServerCartSnapshot(): CartSnapshot {
  return SERVER_SNAPSHOT;
}

function update(next: { vendor: CartVendor | null; lines: CartLine[] }) {
  snapshot = { ready: true, ...next };
  writeStorage(snapshot);
  emit();
}

function lineKey(menuItemId: string, options: string | null): string {
  return `${menuItemId}::${options ?? ""}`;
}

/** Returns whether a bag from a different restaurant was discarded. */
export function addItem(
  vendor: CartVendor,
  line: Omit<CartLine, "key">
): { replacedVendor: boolean } {
  // One restaurant per bag — an order maps to exactly one vendor.
  const switching = snapshot.vendor !== null && snapshot.vendor.id !== vendor.id;
  const lines = switching ? [] : snapshot.lines;

  const key = lineKey(line.menuItemId, line.options);
  const existing = lines.find((candidate) => candidate.key === key);

  const nextLines = existing
    ? lines.map((candidate) =>
        candidate.key === key
          ? { ...candidate, quantity: candidate.quantity + line.quantity }
          : candidate
      )
    : [...lines, { ...line, key }];

  update({ vendor, lines: nextLines });
  return { replacedVendor: switching };
}

export function setQuantity(key: string, quantity: number) {
  const lines =
    quantity <= 0
      ? snapshot.lines.filter((line) => line.key !== key)
      : snapshot.lines.map((line) => (line.key === key ? { ...line, quantity } : line));

  // Emptying the bag also releases the vendor lock.
  update(lines.length === 0 ? EMPTY_BAG : { vendor: snapshot.vendor, lines });
}

export function removeItem(key: string) {
  setQuantity(key, 0);
}

export function clearCart() {
  update(EMPTY_BAG);
}
