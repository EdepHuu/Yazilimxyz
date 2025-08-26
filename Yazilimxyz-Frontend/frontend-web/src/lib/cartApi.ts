// src/lib/cartApi.ts
/* No-any, strict */
export type CreateCartItemDto = {
  productVariantId: number;
  quantity: number;
};

export type UpdateCartItemDto = {
  quantity: number;
};

export type CartItemDto = {
  id: number;
  productVariantId: number;
  quantity: number;
  // Görsel ve başlık için olası alanlar (backend Dto'na uyarsa kullanılır; yoksa fallback var)
  productId?: number;
  productName?: string;
  imageUrl?: string | null;
  size?: string | null;
  color?: string | null;
  unitPrice?: number | null; // tekil fiyat
  stock?: number | null;
};

export type ApiResult<T> = {
  success: boolean;
  message?: string;
  data: T;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

/** Müşteri token’ını localStorage’dan al (senin projendeki anahtarları kapsayacak şekilde) */
function getAuthToken(): string | null {
  const keys = [
    "customerToken",
    "token",
    "access_token",
    "id_token",
    "refresh_token",
  ] as const;
  for (const k of keys) {
    const v = typeof window !== "undefined" ? localStorage.getItem(k) : null;
    if (v && v.trim()) return v;
  }
  return null;
}

function authHeaders(): HeadersInit {
  const t = getAuthToken();
  return t ? { Authorization: `Bearer ${t}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

/** Aktif kullanıcının sepeti */
export async function getMyCart(): Promise<ApiResult<CartItemDto[]>> {
  const res = await fetch(`${API_BASE}/api/CartItems`, {
    method: "GET",
    headers: authHeaders(),
    cache: "no-store",
  });
  const json = (await res.json()) as ApiResult<CartItemDto[]>;
  if (!res.ok) throw new Error(json.message ?? "Sepet alınamadı");
  return json;
}

/** Sepete ekle (aynı variant varsa miktar artırır) */
export async function addCartItem(payload: CreateCartItemDto): Promise<ApiResult<CartItemDto[]>> {
  const res = await fetch(`${API_BASE}/api/CartItems`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const json = (await res.json()) as ApiResult<CartItemDto[]>;
  if (!res.ok) throw new Error(json.message ?? "Sepete eklenemedi");
  return json;
}

/** Miktar güncelle */
export async function updateCartItemQuantity(cartItemId: number, quantity: number): Promise<ApiResult<CartItemDto[]>> {
  const res = await fetch(`${API_BASE}/api/CartItems/${cartItemId}/quantity`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ quantity } as UpdateCartItemDto),
  });
  const json = (await res.json()) as ApiResult<CartItemDto[]>;
  if (!res.ok) throw new Error(json.message ?? "Adet güncellenemedi");
  return json;
}

/** Sepetten sil */
export async function removeCartItem(cartItemId: number): Promise<ApiResult<CartItemDto[]>> {
  const res = await fetch(`${API_BASE}/api/CartItems/${cartItemId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const json = (await res.json()) as ApiResult<CartItemDto[]>;
  if (!res.ok) throw new Error(json.message ?? "Ürün kaldırılamadı");
  return json;
}

/** Sepeti temizle */
export async function clearCart(): Promise<ApiResult<unknown>> {
  const res = await fetch(`${API_BASE}/api/CartItems`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const json = (await res.json()) as ApiResult<unknown>;
  if (!res.ok) throw new Error((json as { message?: string }).message ?? "Sepet temizlenemedi");
  return json;
}
