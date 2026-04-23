import { Layout } from "../../components/layout";
import {
  useListOrders,
  useUpdateOrderStatus,
  getListOrdersQueryKey,
} from "@workspace/api-client-react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderStatus } from "@workspace/api-client-react";
import { formatPrice } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  processing: "En cours",
  shipped: "Expédié",
  delivered: "Livré",
  cancelled: "Annulé",
};

export default function AdminOrders() {
  const [search, setSearch] = useState("");
  const { data: orders, isLoading } = useListOrders();
  const updateStatus = useUpdateOrderStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const filteredOrders = orders?.filter(
    (o) =>
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toString().includes(search),
  );

  const handleStatusChange = (id: number, status: string) => {
    updateStatus.mutate(
      {
        id,
        data: {
          status: status as (typeof OrderStatus)[keyof typeof OrderStatus],
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Statut mis à jour" });
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        },
        onError: () =>
          toast({ title: "Échec de la mise à jour", variant: "destructive" }),
      },
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-amber-300 bg-amber-900/40";
      case "processing":
        return "text-blue-300 bg-blue-900/40";
      case "shipped":
        return "text-indigo-300 bg-indigo-900/40";
      case "delivered":
        return "text-emerald-300 bg-emerald-900/40";
      case "cancelled":
        return "text-rose-300 bg-rose-900/40";
      default:
        return "text-[#9a8880] bg-[#2a2520]";
    }
  };

  const StatusSelect = ({
    orderId,
    status,
  }: {
    orderId: number;
    status: string;
  }) => (
    <Select
      defaultValue={status}
      onValueChange={(val) => handleStatusChange(orderId, val)}
    >
      <SelectTrigger
        className={`h-8 text-xs font-semibold border-0 w-full rounded-full ${getStatusColor(status)}`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(STATUS_LABELS).map(([val, label]) => (
          <SelectItem key={val} value={val}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <Layout title="Commandes">
      <div className="px-4 md:px-8 py-6 w-full max-w-6xl mx-auto pb-24 md:pb-12 space-y-6">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a5c56]" />
          <Input
            placeholder="Rechercher par nom, email ou N° commande..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#1c1916] border-[#2a2520] text-[#f0e8e0] placeholder:text-[#6a5c56]"
          />
        </div>

        <div className="bg-[#1c1916] border border-[#2a2520] rounded-3xl overflow-hidden">
          {/* Mobile card list */}
          <div className="md:hidden divide-y divide-[#2a2520]">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-8 w-full rounded-lg" />
                </div>
              ))
            ) : filteredOrders?.length === 0 ? (
              <p className="p-8 text-center text-[#6a5c56] text-sm">
                Aucune commande trouvée.
              </p>
            ) : (
              filteredOrders?.map((order) => (
                <div key={order.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#f0e8e0] text-sm">
                      #{order.id.toString().padStart(5, "0")}
                    </span>
                    <span className="text-xs text-[#6a5c56]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-[#f0e8e0] text-sm">
                      {order.customerName}
                    </div>
                    <div className="text-xs text-[#9a8880]">
                      {order.customerEmail}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-[#f0e8e0]">
                      {formatPrice(order.total)}
                      <span className="text-xs text-[#6a5c56] font-normal ml-1">
                        ({order.items.length} art.)
                      </span>
                    </span>
                    <div className="w-36">
                      <StatusSelect orderId={order.id} status={order.status} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2a2520] text-xs uppercase tracking-wider text-[#6a5c56] bg-[#181512]">
                  <th className="p-4 font-semibold">Commande</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Client</th>
                  <th className="p-4 font-semibold">Total</th>
                  <th className="p-4 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2520] text-sm">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="p-4">
                        <Skeleton className="h-4 w-16" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-16" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-8 w-32 rounded-lg" />
                      </td>
                    </tr>
                  ))
                ) : filteredOrders?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#6a5c56]">
                      Aucune commande trouvée.
                    </td>
                  </tr>
                ) : (
                  filteredOrders?.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-[#242018] transition-colors"
                    >
                      <td className="p-4 font-mono font-medium text-[#f0e8e0]">
                        #{order.id.toString().padStart(5, "0")}
                      </td>
                      <td className="p-4 text-[#6a5c56]">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-[#f0e8e0]">
                          {order.customerName}
                        </div>
                        <div className="text-xs text-[#9a8880]">
                          {order.customerEmail}
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-[#f0e8e0]">
                        {formatPrice(order.total)}
                        <span className="text-xs text-[#6a5c56] font-normal block">
                          {order.items.length} articles
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="w-[150px]">
                          <StatusSelect
                            orderId={order.id}
                            status={order.status}
                          />
                        </div>
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
