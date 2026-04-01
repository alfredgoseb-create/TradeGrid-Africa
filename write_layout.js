const fs = require('fs');
const code = `import "./globals.css";

export const metadata = {
  title: "NamLogix Africa",
  description: "Trade Infrastructure Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`;
fs.writeFileSync('app/layout.tsx', code);
console.log('Done!');
