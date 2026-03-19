import Layout from '../components/Layout';

const warehouses = [
  { id: 1, name: 'Windhoek Central', location: 'Southern Industrial', capacity: '85%' },
  { id: 2, name: 'Walvis Bay Port', location: 'Harbor Zone', capacity: '40%' },
  { id: 3, name: 'Oshakati Hub', location: 'Main Road', capacity: '15%' },
];

export default function Warehouse() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Warehouse Locations</h1>
        <div className="grid gap-4">
          {warehouses.map((w) => (
            <div key={w.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{w.name}</h3>
                <p className="text-slate-500">{w.location}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 uppercase">Capacity</span>
                <div className="text-xl font-mono font-bold text-blue-600">{w.capacity}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}