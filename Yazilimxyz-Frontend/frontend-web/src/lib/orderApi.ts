// src/lib/orderApi.ts

/* ===================== Types ===================== */

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

  status?: number | string;
  paymentStatus?: number | string;

  createdAt: string;            // ISO
  deliveredAt?: string | null;  // ISO | null
  shippingAddressLine: string;
  note: string;

  items: OrderItemDto[];
};

export type Tone = "green" | "orange" | "red" | "slate";

/* ===================== Base & Simple Utils ===================== */

export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:7206").replace(/\/+$/, "");

export function fmtTRY(v: number): string {
  return Number(v || 0).toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" });
}

/* ===================== Image Helper ===================== */
/** Relative URL’leri API_BASE ile tamamlar; boşsa variantId’den fallback üretir. */
export function resolveImageUrl(u?: string | null, variantId?: number): string | undefined {
  const asAbs = (s: string) => `${API_BASE}${s.startsWith("/") ? "" : "/"}${s}`;

  // 1) string ve boş değilse
  if (typeof u === "string" && u.trim().length > 0) {
    const val = u.trim();
    if (/^https?:\/\//i.test(val)) return val;
    return asAbs(val);
  }

  // 2) hiç URL yoksa; varyant görseli fallback
  if (typeof variantId === "number") {
    // Backend’in varsa bu route’u ayarla
    return `${API_BASE}/api/ProductImages/by-variant/${variantId}`;
  }
  return undefined;
}

/* ===================== Status Helpers ===================== */

function normalizeTR(s: unknown): string {
  const v = String(s ?? "").toLowerCase();
  return v
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replaceAll(/\s+/g, "");
}

export function statusInfo(dto: Pick<OrderDto, "status" | "paymentStatus">): { text: string; tone: Tone } {
  const raw = dto.status ?? dto.paymentStatus;
  const sNum = typeof raw === "number" ? raw : NaN;
  const sStr = typeof raw === "string" ? normalizeTR(raw) : "";

  if (!Number.isNaN(sNum)) {
    if (sNum === 3) return { text: "Teslim Edildi", tone: "green" };
    if (sNum === 4) return { text: "İptal Edildi", tone: "red" };
    return { text: "Onay Bekliyor", tone: "orange" };
  }
  if (sStr.includes("deliver") || sStr.includes("teslim") || sStr.includes("tamam"))
    return { text: "Teslim Edildi", tone: "green" };
  if (sStr.includes("cancel") || sStr.includes("iptal"))
    return { text: "İptal Edildi", tone: "red" };
  if (sStr.includes("confirm") || sStr.includes("onay") || sStr.includes("pending") || sStr.includes("bekle"))
    return { text: "Onay Bekliyor", tone: "orange" };
  return { text: "Durum", tone: "slate" };
}

export function isAwaiting(dto: Pick<OrderDto, "status" | "paymentStatus">): boolean {
  const raw = dto.status ?? dto.paymentStatus;

  // ✅ Sayısal enum desteği
  if (typeof raw === "number") {
    // projende bekleyen karşılığı 0 veya 1 ise burada kapsıyoruz
    return raw === 0 || raw === 1;
  }

  // ✅ Metinsel durumlar
  const s = normalizeTR(raw);
  return (
    s === "pending" ||
    s === "awaitingapproval" ||
    s === "onaybekliyor" ||
    s === "beklemede" ||
    s.includes("await") ||
    s.includes("bekliyor") ||
    s.includes("onay")
  );
}

/* ===================== Auth (role-based) ===================== */

type JwtRoles = string | ReadonlyArray<string> | undefined;
interface JwtPayload {
  role?: JwtRoles;
  roles?: JwtRoles;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: JwtRoles;
  [k: string]: unknown;
}

function parseBase64Json(s: string): unknown {
  const base64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const json = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  try { return JSON.parse(json) as unknown; } catch { return null; }
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const payload = parseBase64Json(parts[1]);
  return payload && typeof payload === "object" ? (payload as JwtPayload) : null;
}

function toLowerArray(v: JwtRoles): ReadonlyArray<string> {
  if (typeof v === "string") return [v.toLowerCase()];
  if (Array.isArray(v)) return v.map((x) => String(x).toLowerCase());
  return [];
}

function payloadHasRole(p: JwtPayload | null, role: "customer" | "merchant"): boolean {
  if (!p) return false;
  const all = [
    ...toLowerArray(p.role),
    ...toLowerArray(p.roles),
    ...toLowerArray(p["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]),
  ];
  return role === "customer"
    ? all.some((r) => r.includes("customer") || r.includes("musteri"))
    : all.some((r) => r.includes("merchant") || r.includes("satici"));
}

const TOKEN_KEYS: ReadonlyArray<string> = [
  "customerToken",
  "customer_access_token",
  "customerJWT",
  "merchantToken",
  "token",
  "access_token",
  "id_token",
];

export function readRoleToken(role: "customer" | "merchant"): string | undefined {
  if (typeof window === "undefined") return undefined;
  for (const k of TOKEN_KEYS) {
    const v = window.localStorage.getItem(k);
    if (v && payloadHasRole(decodeJwtPayload(v), role)) return v;
  }
  return undefined;
}

/* ===================== HTTP Wrapper ===================== */

export class HttpError extends Error {
  readonly status: number;
  readonly body?: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

type DataEnvelope<T> = { data: T };
function isDataEnvelope<T>(x: unknown): x is DataEnvelope<T> {
  return typeof x === "object" && x !== null && Object.prototype.hasOwnProperty.call(x, "data");
}

async function authed<T>(
  kind: "customer" | "merchant",
  path: string,
  init?: RequestInit
): Promise<T> {
  const token = readRoleToken(kind);
  if (!token) throw new HttpError(401, `Giriş bulunamadı (${kind}).`);

  const url = `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) {
    let body: unknown = undefined;
    try { body = await res.json(); } catch { /* body olmayabilir */ }
    const msg =
      (typeof body === "object" && body !== null && "message" in body && typeof (body as { message: unknown }).message === "string"
        ? (body as { message: string }).message
        : res.statusText) || "İstek başarısız";
    throw new HttpError(res.status, `HTTP ${res.status} - ${msg}`, body);
  }

  if (res.status === 204) return undefined as T;

  const json = (await res.json()) as unknown;
  return isDataEnvelope<T>(json) ? json.data : (json as T);
}

/* ===================== Normalization ===================== */

function normalizeImages(o: OrderDto): OrderDto {
  return {
    ...o,
    items: (o.items ?? []).map((i) => ({
      ...i,
      productImageUrl: resolveImageUrl(i.productImageUrl ?? null, i.productVariantId),
    })),
  };
}

/* ===================== Endpoints ===================== */

// CUSTOMER
export async function getMyOrders(): Promise<OrderDto[]> {
  const list = await authed<OrderDto[]>("customer", "/api/Orders/my-orders", { method: "GET" });
  return (list ?? []).map(normalizeImages);
}

// MERCHANT
export async function getMerchantOrders(): Promise<OrderDto[]> {
  const list = await authed<OrderDto[]>("merchant", "/api/Orders/merchant-orders", { method: "GET" });
  return (list ?? []).map(normalizeImages);
}

export async function confirmOrder(orderId: number): Promise<OrderDto | undefined> {
  return authed<OrderDto | undefined>("merchant", `/api/Orders/confirm/${orderId}`, {
    method: "PUT",
    body: JSON.stringify({}),
  });
}

export async function merchantCancelOrder(orderId: number): Promise<OrderDto | undefined> {
  return authed<OrderDto | undefined>("merchant", `/api/Orders/merchant/cancel/${orderId}`, {
    method: "PUT",
    body: JSON.stringify({}),
  });
}

export async function cancelOrder(orderId: number): Promise<void> {
  await authed<void>("customer", `/api/Orders/cancel/${orderId}`, {
    method: "PUT",
    body: JSON.stringify({}),
  });
}
