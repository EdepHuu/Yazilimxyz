// src/lib/orderApi.ts
/* ===== Types (backend DTO ile uyumlu) ===== */
export type OrderItemDto = {
  orderItemId: number;
  productVariantId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productName: string;
  size?: string | null;
  color?: string | null;
  productImageUrl?: string | null;
};

export type OrderDto = {
  id: number;
  orderNumber: string;
  subTotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;

  /** Backend enumları sayı olabilir; bazen string gelebilir */
  status?: number | string;
  paymentStatus?: number | string;

  createdAt: string;            // ISO
  deliveredAt?: string | null;
  shippingAddressLine: string;  // "Ev - ... Kadıköy/İstanbul"
  note: string;

  items: OrderItemDto[];
};

/* ===== Utils ===== */
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
export function fmtTRY(v: number): string {
  return v.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

function getAuthToken(): string | undefined {
  const keys: ReadonlyArray<string> = [
    "customerToken","token","access_token","id_token","refresh_token","merchantToken"
  ];
  for (const k of keys) {
    const v = typeof window !== "undefined" ? window.localStorage.getItem(k) : null;
    if (v && v.trim()) return v;
  }
  return undefined;
}

async function authed<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init?.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(input, { ...init, headers, cache: "no-store" });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} - ${txt || res.statusText}`);
  }
  const json = await res.json() as unknown;
  // {data: T} veya direkt T destekle
  if (json && typeof json === "object" && "data" in (json as Record<string, unknown>)) {
    return (json as { data: T }).data;
  }
  return json as T;
}

/* ===== Endpoints ===== */
export async function getMyOrders(): Promise<OrderDto[]> {
  return authed<OrderDto[]>(`${API_BASE}/api/Orders/my-orders`);
}
export async function getMerchantOrders(): Promise<OrderDto[]> {
  return authed<OrderDto[]>(`${API_BASE}/api/Orders/merchant-orders`);
}
export async function confirmOrder(orderId: number): Promise<void> {
  await authed<void>(`${API_BASE}/api/Orders/confirm/${orderId}`, { method: "PUT" });
}
export async function cancelOrder(orderId: number): Promise<void> {
  await authed<void>(`${API_BASE}/api/Orders/cancel/${orderId}`, { method: "PUT" });
}
export async function merchantCancelOrder(orderId: number): Promise<void> {
  await authed<void>(`${API_BASE}/api/Orders/merchant/cancel/${orderId}`, { method: "PUT" });
}

/* ===== Badge Yardımcısı ===== */
export function statusInfo(dto: Pick<OrderDto, "status" | "paymentStatus">):
  { text: string; tone: "orange"|"green"|"red"|"slate" } {

  const s = (dto.status ?? dto.paymentStatus);
  const sval = typeof s === "string" ? s.toLowerCase() : s;

  // Sayısal enum için tahmini eşleme: 0/1=bekliyor, 3=teslim, 4=iptal
  if (typeof sval === "number") {
    if (sval === 3) return { text: "Teslim Edildi", tone: "green" };
    if (sval === 4) return { text: "İptal Edildi", tone: "red" };
    return { text: "Onay Bekliyor", tone: "orange" };
  }

  // Metinsel durumlar
  if (typeof sval === "string") {
    if (sval.includes("deliver")) return { text: "Teslim Edildi", tone: "green" };
    if (sval.includes("cancel"))  return { text: "İptal Edildi", tone: "red" };
    if (sval.includes("confirm") || sval.includes("pending")) return { text: "Onay Bekliyor", tone: "orange" };
  }

  return { text: "Durum", tone: "slate" };
}
