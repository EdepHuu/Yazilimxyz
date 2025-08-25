"use client";

import React, { useState } from "react";

/* ============ Types ============ */
export type CustomerAddress = {
  id: number;
  title: string;
  fullName: string;
  phone: string;
  address: string;
  addressLine2?: string | null;
  city: string;
  district: string;
  postalCode: string;
  country: string;
};

export type CreateAddressDto = Omit<CustomerAddress, "id">;

export type ApiEnvelope<T> = { data: T; success?: boolean; message?: string };

/* ============ UI helpers ============ */
function clsx(...p: Array<string | false | undefined>) {
  return p.filter(Boolean).join(" ");
}
export const sectionCard =
  "rounded-2xl border border-gray-200 bg-white shadow-sm";
const labelCls = "text-xs font-medium text-gray-600 mb-1";
const inputCls =
  "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20";

/* ============ Address Card ============ */
export function AddressCard(props: {
  item: CustomerAddress;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { item, onEdit, onDelete } = props;
  return (
    <div className={clsx(sectionCard, "p-4")}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-sm font-semibold">{item.title}</div>
          <div className="text-sm text-gray-800">
            <div>{item.fullName}</div>
            <div>
              {item.address}
              {item.addressLine2 ? `, ${item.addressLine2}` : ""}
            </div>
            <div>
              {item.district} / {item.city}
            </div>
            <div>
              {item.postalCode} · {item.country}
            </div>
            <div className="text-gray-500">{maskPhone(item.phone)}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="text-xs rounded-lg border border-gray-300 px-3 py-1 hover:bg-gray-50"
          >
            Düzenle
          </button>
          <button
            onClick={onDelete}
            className="text-xs rounded-lg border border-red-300 text-red-600 px-3 py-1 hover:bg-red-50"
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  );
}

function maskPhone(p: string): string {
  const d = p.replace(/\D/g, "");
  if (d.length < 7) return p;
  return `${d.slice(0, 3)}${"*".repeat(Math.max(0, d.length - 5))}${d.slice(
    -2
  )}`;
}

/* ============ Address Form ============ */
export function AddressForm(props: {
  initialValue: Partial<CreateAddressDto>;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (payload: CreateAddressDto) => void;
}) {
  const { initialValue, submitting, onCancel, onSubmit } = props;

  const [title, setTitle] = useState(initialValue.title ?? "");
  const [fullName, setFullName] = useState(initialValue.fullName ?? "");
  const [phone, setPhone] = useState(initialValue.phone ?? "");
  const [address, setAddress] = useState(initialValue.address ?? "");
  const [addressLine2, setAddressLine2] = useState(
    initialValue.addressLine2 ?? ""
  );
  const [city, setCity] = useState(initialValue.city ?? "");
  const [district, setDistrict] = useState(initialValue.district ?? "");
  const [postalCode, setPostalCode] = useState(initialValue.postalCode ?? "");
  const [country, setCountry] = useState(initialValue.country ?? "Türkiye");

  const requiredOk =
    title.trim() &&
    fullName.trim() &&
    address.trim() &&
    city.trim() &&
    district.trim() &&
    country.trim();

  return (
    <div className={clsx(sectionCard, "p-4")}>
      <div className="grid grid-cols-2 gap-4">
        <FormItem label="Başlık">
          <input
            className={inputCls}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormItem>

        <FormItem label="Ad Soyad">
          <input
            className={inputCls}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </FormItem>

        <FormItem label="Telefon">
          <input
            className={inputCls}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </FormItem>

        <FormItem label="Posta Kodu">
          <input
            className={inputCls}
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          />
        </FormItem>

        <FormItem label="İl">
          <input
            className={inputCls}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </FormItem>

        <FormItem label="İlçe">
          <input
            className={inputCls}
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />
        </FormItem>

        <FormItem label="Ülke">
          <input
            className={inputCls}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </FormItem>

        <FormItem label="Adres Satırı 2 (opsiyonel)">
          <input
            className={inputCls}
            value={addressLine2 ?? ""}
            onChange={(e) => setAddressLine2(e.target.value)}
          />
        </FormItem>

        <div className="col-span-2">
          <div className={labelCls}>Adres</div>
          <textarea
            className={`${inputCls} min-h-[80px]`}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          disabled={!requiredOk || submitting}
          onClick={() =>
            onSubmit({
              title: title.trim(),
              fullName: fullName.trim(),
              phone: phone.trim(),
              address: address.trim(),
              addressLine2: addressLine2?.trim() || null,
              city: city.trim(),
              district: district.trim(),
              postalCode: postalCode.trim(),
              country: country.trim(),
            })
          }
          className="rounded-xl px-5 py-2 text-sm font-medium bg-black text-white hover:bg-black/90 disabled:bg-gray-200 disabled:text-gray-500"
        >
          {submitting ? "Kaydediliyor…" : "Kaydet"}
        </button>
        <button
          onClick={onCancel}
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          Vazgeç
        </button>
      </div>
    </div>
  );
}

function FormItem(props: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col">
      <span className={labelCls}>{props.label}</span>
      {props.children}
    </label>
  );
}
