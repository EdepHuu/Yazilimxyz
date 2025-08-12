"use client";

export default function Topbar({ merchantName }: { merchantName?: string }) {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="h-14 flex items-center justify-between px-4">
        <h1 className="text-xl font-semibold">Darshant Paneli</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">{merchantName ?? "Mağazam"}</span>
          <div className="w-8 h-8 rounded-full bg-slate-200" />
        </div>
      </div>
    </header>
  );
}
