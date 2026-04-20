import { Layout } from "../../components/layout";
import { useGetDashboardStats, useGetRecentOrders } from "@workspace/api-client-react";
import { DollarSign, Package, ShoppingBag, TrendingUp, Clock } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { data: stats, isLoading: isLoadingStats } = useGetDashboardStats();
  const { data: recentOrders, isLoading: isLoadingOrders } = useGetRecentOrders();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-700";
      case "processing": return "bg-blue-100 text-blue-700";
      case "shipped": return "bg-indigo-100 text-indigo-700";
      case "delivered": return "bg-emerald-100 text-emerald-700";
      case "cancelled": return "bg-rose-100 text-rose-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Layout title="Admin Dashboard">
      <div className="px-4 md:px-8 py-6 w-full max-w-6xl mx-auto pb-24 md:pb-12 space-y-8">
        
        {/* Admin Navigation Quick Links */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          <Link href="/admin/products" className="shrink-0 bg-white border border-gray-200 px-5 py-2.5 rounded-xl font-semibold text-sm hover:border-red-600 hover:text-red-600 transition-colors flex items-center gap-2">
            <Package className="w-4 h-4" />
            Manage Products
          </Link>
          <Link href="/admin/orders" className="shrink-0 bg-white border border-gray-200 px-5 py-2.5 rounded-xl font-semibold text-sm hover:border-red-600 hover:text-red-600 transition-colors flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Manage Orders
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Total Revenue</p>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <h3 className="text-2xl font-bold text-gray-900">${stats?.totalRevenue.toFixed(2)}</h3>
            )}
            <p className={`text-xs mt-2 font-medium flex items-center gap-1 ${stats?.revenueChange && stats.revenueChange >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              <TrendingUp className={`w-3 h-3 ${stats?.revenueChange && stats.revenueChange < 0 ? "rotate-180" : ""}`} />
              {stats?.revenueChange}% from last month
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Total Orders</p>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <h3 className="text-2xl font-bold text-gray-900">{stats?.totalOrders}</h3>
            )}
            <p className={`text-xs mt-2 font-medium flex items-center gap-1 ${stats?.ordersChange && stats.ordersChange >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              <TrendingUp className={`w-3 h-3 ${stats?.ordersChange && stats.ordersChange < 0 ? "rotate-180" : ""}`} />
              {stats?.ordersChange}% from last month
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Products</p>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <h3 className="text-2xl font-bold text-gray-900">{stats?.totalProducts}</h3>
            )}
            <p className="text-xs mt-2 font-medium text-gray-400">Active catalog</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Pending Orders</p>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <h3 className="text-2xl font-bold text-gray-900">{stats?.pendingOrders}</h3>
            )}
            <p className="text-xs mt-2 font-medium text-gray-400">Requires attention</p>
          </motion.div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Recent Orders</h3>
            <Link href="/admin/orders" className="text-sm font-semibold text-red-600 hover:text-red-700">View All</Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 bg-white">
                  <th className="p-4 font-semibold">Order</th>
                  <th className="p-4 font-semibold">Customer</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Total</th>
                  <th className="p-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {isLoadingOrders ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="p-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                    </tr>
                  ))
                ) : recentOrders?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">No recent orders found.</td>
                  </tr>
                ) : (
                  recentOrders?.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">#{order.id.toString().padStart(5, '0')}</td>
                      <td className="p-4 text-gray-600">{order.customerName}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-gray-900">${order.total.toFixed(2)}</td>
                      <td className="p-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Layout>
  );
}
