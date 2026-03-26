// pages/trades.tsx
import { useEffect, useState } from 'react'
import { formatDate } from '../utils/formatDate'

interface Trade {
  id: number
  date: string // ISO string
  amount: number
  buyer: string
  seller: string
}

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([])

  // Example: replace this with your real API call
  useEffect(() => {
    const mockTrades: Trade[] = [
      { id: 1, date: '2026-03-24T12:00:00Z', amount: 500, buyer: 'Alice', seller: 'Bob' },
      { id: 2, date: '2026-03-25T09:30:00Z', amount: 1200, buyer: 'Charlie', seller: 'David' },
    ]
    setTrades(mockTrades)
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Trades</h1>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">ID</th>
            <th className="border border-gray-300 px-4 py-2">Date</th>
            <th className="border border-gray-300 px-4 py-2">Buyer</th>
            <th className="border border-gray-300 px-4 py-2">Seller</th>
            <th className="border border-gray-300 px-4 py-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {trades.map(trade => (
            <tr key={trade.id} className="text-center">
              <td className="border border-gray-300 px-4 py-2">{trade.id}</td>
              <td className="border border-gray-300 px-4 py-2">{formatDate(trade.date)}</td>
              <td className="border border-gray-300 px-4 py-2">{trade.buyer}</td>
              <td className="border border-gray-300 px-4 py-2">{trade.seller}</td>
              <td className="border border-gray-300 px-4 py-2">{trade.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}