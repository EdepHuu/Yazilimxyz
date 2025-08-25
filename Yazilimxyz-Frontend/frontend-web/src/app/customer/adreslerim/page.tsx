"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import axios, { AxiosError, AxiosInstance } from "axios";
import {
  AddressCard,
  AddressForm,
  ApiEnvelope,
  CreateAddressDto,
  CustomerAddress,
} from "@/components/customer/CustomerAddress";

/* ========== API ========== */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:7206";
const ENDPOINT = {
  listMy: "/api/CustomerAddresses/my",
  createMy: "/api/CustomerAddresses/my",
  updateMy: (id: number) => `/api/CustomerAddresses/my/${id}`,
  deleteById: (id: number) => `/api/CustomerAddresses/${id}`,
};

function readCustomerToken(): string | null {
  const keys = ["customerToken", "token", "access_token", "id_token"];
  for (const k of keys) {
    const v = typeof window !== "undefined" ? localStorage.getItem(k) : null;
    if (v) return v;
  }
  return null;
}
function createClient(): AxiosInstance {
  const token = readCustomerToken();
  return axios.create({
    baseURL: API_BASE,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
function clsx(...p: Array<string | false | undefined>) {
  return p.filter(Boolean).join(" ");
}

/* ========== Page ========== */
export default function CustomerAddressesPage() {
  const [client] = useState(createClient);
  const [items, setItems] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState<CustomerAddress | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get<ApiEnvelope<CustomerAddress[]>>(
        ENDPOINT.listMy
      );
      setItems(res.data.data);
    } catch (e) {
      const ae = e as AxiosError<{ message?: string }>;
      setError(ae.response?.data?.message ?? "Adresler alınamadı.");
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleSubmit = useCallback(
    async (form: CreateAddressDto, id?: number) => {
      setSubmitting(true);
      setError(null);
      try {
        if (id) {
          await client.put<ApiEnvelope<CustomerAddress>>(
            ENDPOINT.updateMy(id),
            form
          );
        } else {
          await client.post<ApiEnvelope<CustomerAddress>>(
            ENDPOINT.createMy,
            form
          );
        }
        setShowNew(false);
        setEditing(null);
        await fetchAll();
      } catch (e) {
        const ae = e as AxiosError<{ message?: string }>;
        setError(ae.response?.data?.message ?? "İşlem sırasında hata oluştu.");
      } finally {
        setSubmitting(false);
      }
    },
    [client, fetchAll]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      if (!confirm("Bu adresi silmek istiyor musun?")) return;
      try {
        await client.delete<ApiEnvelope<boolean>>(ENDPOINT.deleteById(id));
        await fetchAll();
      } catch (e) {
        const ae = e as AxiosError<{ message?: string }>;
        setError(ae.response?.data?.message ?? "Adres silinemedi.");
      }
    },
    [client, fetchAll]
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-12 gap-6">
        {/* Sol Menü */}
        <aside className="col-span-3">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 sticky top-4">
            <div className="text-sm font-semibold mb-3">Hesabım</div>
            <nav className="space-y-2 text-sm">
              <Link className="block hover:text-black" href="/customer">
                Siparişlerim
              </Link>
              <span className="block text-black font-medium">Adreslerim</span>
              <Link
                className="block hover:text-black"
                href="/customer/favorilerim"
              >
                Favorilerim
              </Link>
              <Link
                className="block hover:text-black"
                href="/customer/bilgilerim"
              >
                Kullanıcı Bilgilerim
              </Link>
            </nav>
          </div>
        </aside>

        {/* İçerik */}
        <main className="col-span-9">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold">Adres Bilgilerim</h1>
              <button
                onClick={() => {
                  setEditing(null);
                  setShowNew((v) => !v);
                }}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              >
                {showNew ? "Kapat" : "Yeni Adres Ekle"}
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {(showNew || editing) && (
              <div className="mt-5">
                <AddressForm
                  initialValue={
                    editing ?? {
                      title: "",
                      fullName: "",
                      phone: "",
                      address: "",
                      addressLine2: "",
                      city: "",
                      district: "",
                      postalCode: "",
                      country: "Türkiye",
                    }
                  }
                  submitting={submitting}
                  onCancel={() => {
                    setShowNew(false);
                    setEditing(null);
                  }}
                  onSubmit={(payload) =>
                    handleSubmit(payload as CreateAddressDto, editing?.id)
                  }
                />
              </div>
            )}

            {/* Liste */}
            <div className="mt-6 space-y-4">
              {loading ? (
                <div className="text-sm text-gray-500">Yükleniyor…</div>
              ) : items.length === 0 ? (
                <div className="text-sm text-gray-500">
                  Kayıtlı adres yok. “Yeni Adres Ekle” ile başlayabilirsin.
                </div>
              ) : (
                items.map((addr) => (
                  <AddressCard
                    key={addr.id}
                    item={addr}
                    onEdit={() => {
                      setEditing(addr);
                      setShowNew(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    onDelete={() => handleDelete(addr.id)}
                  />
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
