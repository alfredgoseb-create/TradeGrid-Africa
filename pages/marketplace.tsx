import { NextPage } from "next";
import { useState } from "react";

type Trade = {
  id: string;
  title: string;
  company: string;
  type: "Import" | "Export";
  status: "Pending" | "Completed" | "Cancelled";
  amount: number;
  currency: string;
  createdAt: string;
};

const mockTrades: Trade[] = [
  {
    id: "1",
    title: "Electronics Shipment",
    company: "NamTrade Ltd",
    type: "Import",
    status: "Pending",
    amount: 50000,
    currency: "USD",
    createdAt: "2026-03-24T12:00:00Z",
  },
  {
    id: "2",
    title: "Agriculture Export",
    company: "AgriCo Namibia",
    type: "Export",
    status: "Completed",
    amount: 75000,
    currency: "USD",
    createdAt: "2026-03-22T09:30:00Z",
  },
];

const TradesPage: NextPage = () => {
  const [trades, setTrades] = useState<Trade[]>(mockTrades);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Trade Listings</h1>

      <table className="w-full table-auto border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Title</th>
            <th className="border px-4 py-2">Company</th>
            <th className="border px-4 py-2">Type</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Amount</th>
            <th className="border px-4 py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr key={trade.id}>
              <td className="border px-4 py-2">{trade.title}</td>
              <td className="border px-4 py-2">{trade.company}</td>
              <td className="border px-4 py-2">{trade.type}</td>
              <td className="border px-4 py-2">{trade.status}</td>
              <td className="border px-4 py-2">{trade.amount} {trade.currency}</td>
              <td className="border px-4 py-2">{new Date(trade.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TradesPage;