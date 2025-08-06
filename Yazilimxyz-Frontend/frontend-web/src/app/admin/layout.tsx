import "../../../src/app/globals.css";
export const metadata = {
  title: "Yazılım XYZ",
  description: "Admin panel ve web arayüz",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
