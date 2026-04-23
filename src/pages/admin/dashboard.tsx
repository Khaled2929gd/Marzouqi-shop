import { Layout } from "../../components/layout";
import {
  useGetDashboardStats,
  useGetRecentOrders,
} from "@workspace/api-client-react";
import {
  DollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";

export default function AdminDashboard() {
  const { data: stats, isLoading: isLoadingStats } = useGetDashboardStats();
  const { data: recentOrders, isLoading: isLoadingOrders } =
    useGetRecentOrders();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-900/40 text-amber-300";
      case "processing":
        return "bg-blue-900/40 text-blue-300";
      case "shipped":
        return "bg-indigo-900/40 text-indigo-300";
      case "delivered":
        return "bg-emerald-900/40 text-emerald-300";
      case "cancelled":
        return "bg-rose-900/40 text-rose-300";
      default:
        return "bg-[#2a2520] text-[#9a8880]";
    }
  };

  return (
    <Layout title="Admin Dashboard">
      <div className="px-4 md:px-8 py-6 w-full max-w-6xl mx-auto pb-24 md:pb-12 space-y-8">
        {/* Quick nav */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          <Link
            href="/admin/products"
            className="shrink-0 bg-[#1c1916] border border-[#2a2520] px-5 py-2.5 rounded-xl font-semibold text-sm text-[#f0e8e0] hover:border-red-600 hover:text-red-400 transition-colors flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            Manage Products
          </Link>
          <Link
            href="/admin/orders"
            className="shrink-0 bg-[#1c1916] border border-[#2a2520] px-5 py-2.5 rounded-xl font-semibold text-sm text-[#f0e8e0] hover:border-red-600 hover:text-red-400 transition-colors flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Manage Orders
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#1c1916] p-5 rounded-2xl border border-[#2a2520]">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center text-red-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[#9a8880] text-sm font-medium mb-1">
              Total Revenue
            </p>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <h3 className="text-2xl font-bold text-[#f0e8e0]">
                {formatPrice(stats?.totalRevenue ?? 0)}
              </h3>
            )}
            <p
              className={`text-xs mt-2 font-medium flex items-center gap-1 ${stats?.revenueChange && stats.revenueChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}
            >
              <TrendingUp
                className={`w-3 h-3 ${stats?.revenueChange && stats.revenueChange < 0 ? "rotate-180" : ""}`}
              />
              {stats?.revenueChange}% from last month
            </p>
          </div>

          <div className="bg-[#1c1916] p-5 rounded-2xl border border-[#2a2520]">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[#9a8880] text-sm font-medium mb-1">
              Total Orders
            </p>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <h3 className="text-2xl font-bold text-[#f0e8e0]">
                {stats?.totalOrders}
              </h3>
            )}
            <p
              className={`text-xs mt-2 font-medium flex items-center gap-1 ${stats?.ordersChange && stats.ordersChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}
            >
              <TrendingUp
                className={`w-3 h-3 ${stats?.ordersChange && stats.ordersChange < 0 ? "rotate-180" : ""}`}
              />
              {stats?.ordersChange}% from last month
            </p>
          </div>

          <div className="bg-[#1c1916] p-5 rounded-2xl border border-[#2a2520]">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-900/30 flex items-center justify-center text-emerald-400">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[#9a8880] text-sm font-medium mb-1">Products</p>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <h3 className="text-2xl font-bold text-[#f0e8e0]">
                {stats?.totalProducts}
              </h3>
            )}
            <p className="text-xs mt-2 font-medium text-[#6a5c56]">
              Active catalog
            </p>
          </div>

          <div className="bg-[#1c1916] p-5 rounded-2xl border border-[#2a2520]">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-900/30 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[#9a8880] text-sm font-medium mb-1">
              Pending Orders
            </p>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <h3 className="text-2xl font-bold text-[#f0e8e0]">
                {stats?.pendingOrders}
              </h3>
            )}
            <p className="text-xs mt-2 font-medium text-[#6a5c56]">
              Requires attention
            </p>
          </div>
        </div>

        {/* Recent orders table */}
        <div className="bg-[#1c1916] border border-[#2a2520] rounded-3xl overflow-hidden">
          <div className="px-6 py-5 border-b border-[#2a2520] flex justify-between items-center bg-[#181512]">
            <h3 className="font-bold text-[#f0e8e0]">Recent Orders</h3>
            <Link
              href="/admin/orders"
              className="text-sm font-semibold text-red-400 hover:text-red-300"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2a2520] text-xs uppercase tracking-wider text-[#6a5c56] bg-[#181512]">
                  <th className="p-4 font-semibold">Order</th>
                  <th className="p-4 font-semibold">Customer</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Total</th>
                  <th className="p-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2520] text-sm">
                {isLoadingOrders ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="p-4">
                        <Skeleton className="h-4 w-16" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-16" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                    </tr>
                  ))
                ) : recentOrders?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#6a5c56]">
                      No recent orders found.
                    </td>
                  </tr>
                ) : (
                  recentOrders?.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-[#1c1916] transition-colors"
                    >
                      <td className="p-4 font-medium text-[#f0e8e0]">
                        #{order.id.toString().padStart(5, "0")}
                      </td>
                      <td className="p-4 text-[#9a8880]">
                        {order.customerName}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-[#f0e8e0]">
                        {formatPrice(order.total)}
                      </td>
                      <td className="p-4 text-[#6a5c56]">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
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
