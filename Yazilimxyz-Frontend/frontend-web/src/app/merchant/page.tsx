// src/app/merchant/page.tsx
import { redirect } from "next/navigation";

export default function MerchantIndex() {
  // /merchant açıldığında kontrol paneline yönlendir
  redirect("/merchant/panel");
}
