import AdminSidebar from '@/components/admin/AdminSidebar';
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Yazilimxyz Admin Paneli",
  description: "Yazilimxyz e-ticaret platformu için yönetim paneli",
};

export default function AdminControlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <AdminSidebar>
          {children}
        </AdminSidebar>
      </body>
    </html>
  );
}
