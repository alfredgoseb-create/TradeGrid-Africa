import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Truck, ShoppingCart, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Namlogix Africa</h1>
          <p className="text-gray-500">Trade & Logistics Dashboard</p>
        </div>
        <Button>+ Add New</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Products", value: "120", icon: ShoppingCart },
          { title: "Trades", value: "45", icon: BarChart3 },
          { title: "Shipments", value: "32", icon: Truck },
          { title: "Warehouses", value: "8", icon: Package }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="rounded-2xl shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{item.title}</p>
                  <h2 className="text-2xl font-bold">{item.value}</h2>
                </div>
                <item.icon className="w-8 h-8 text-gray-400" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 rounded-2xl shadow">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <ul className="space-y-3">
              <li className="flex justify-between">
                <span>New trade created</span>
                <span className="text-gray-400">2 min ago</span>
              </li>
              <li className="flex justify-between">
                <span>Shipment dispatched</span>
                <span className="text-gray-400">10 min ago</span>
              </li>
              <li className="flex justify-between">
                <span>Product added</span>
                <span className="text-gray-400">1 hour ago</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="rounded-2xl shadow">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
            <Button className="w-full">Add Product</Button>
            <Button className="w-full">Create Trade</Button>
            <Button className="w-full">Track Shipment</Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl shadow">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Top Products</h2>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Maize</span>
                <span>120 units</span>
              </li>
              <li className="flex justify-between">
                <span>Cement</span>
                <span>80 units</span>
              </li>
              <li className="flex justify-between">
                <span>Steel</span>
                <span>60 units</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">System Status</h2>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>API</span>
                <span className="text-green-500">Online</span>
              </li>
              <li className="flex justify-between">
                <span>Database</span>
                <span className="text-green-500">Connected</span>
              </li>
              <li className="flex justify-between">
                <span>Payments</span>
                <span className="text-yellow-500">Pending</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
