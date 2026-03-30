import "./globals.css";

export const metadata = {
  title: "TradeGrid Africa",
  description: "A modern B2B marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
