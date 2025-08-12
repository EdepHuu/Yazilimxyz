import Sidebar from "@/components/merchant/Sidebar";
import Topbar from "@/components/merchant/Topbar";

export default function MerchantPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex">
      {/* Sol menü */}
      <Sidebar />

      {/* İçerik alanı */}
      <div className="flex-1 flex flex-col">
        {/* Üst bar (global header yerine) */}
        <Topbar />

        {/* Sayfa içeriği */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
