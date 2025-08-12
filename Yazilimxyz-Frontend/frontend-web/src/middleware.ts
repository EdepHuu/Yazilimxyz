import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MERCHANT_PORTAL_PATHS = [
  "/merchant/panel",
  "/merchant/urunler",
  "/merchant/siparisler",
  "/merchant/musteriler",
  "/merchant/yorumlar",
  "/merchant/ayarlar",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Sadece portal yollarını koru
  if (!MERCHANT_PORTAL_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value || ""; // Eğer şimdilik localStorage kullanıyorsan, login sonrası cookie set etmeyi ekle (aşağıda gösterdim)

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/merchant/giris";
    url.searchParams.set("r", pathname);
    return NextResponse.redirect(url);
  }

  // Basit role kontrolü (header claim’inden okunması ideal)
  // Prod’da token decode edip "role" bakmak daha sağlamdır. (Edge’de küçük bir JWT parse da yapabilirsin)
  const role = req.cookies.get("role")?.value || "";
  if (role && role.toLowerCase() !== "merchant") {
    const url = req.nextUrl.clone();
    url.pathname = "/merchant/giris";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/merchant/panel/:path*",
    "/merchant/urunler/:path*",
    "/merchant/siparisler/:path*",
    "/merchant/musteriler/:path*",
    "/merchant/yorumlar/:path*",
    "/merchant/ayarlar/:path*",
  ],
};
