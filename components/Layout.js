import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const router = useRouter();

  const navItems = [
    { name: 'Inventory', href: '/' },
    { name: 'Warehouses', href: '/warehouse' },
    { name: 'Shipments', href: '/shipments' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-400">NamLogix</h1>
          <p className="text-xs text-slate-400">Logistics v1.0</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <div className={`p-3 rounded-lg cursor-pointer transition ${
                router.pathname === item.href ? 'bg-blue-600' : 'hover:bg-slate-800'
              }`}>
                {item.name}
              </div>
            </Link>
          ))}
        </nav>
      </div>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}