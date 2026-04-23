import { Layout } from "../../components/layout";
import {
  useListOrders,
  useUpdateOrderStatus,
  getListOrdersQueryKey,
} from "@workspace/api-client-react";
import { Search, Package, MapPin, User, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrderStatus } from "@workspace/api-client-react";
import { formatPrice } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  processing: "En cours",
  shipped: "Expédié",
  delivered: "Livré",
  cancelled: "Annulé",
};

type Order = {
  id: number;
  createdAt: string;
  updatedAt: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  items: Array<{
    productId: number;
    productName: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  delivery: number;
  discount: number;
  total: number;
};

export default function AdminOrders() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: orders, isLoading } = useListOrders();
  const updateStatus = useUpdateOrderStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredOrders = orders?.filter(
    (o) =>
      o.customerName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      o.id.toString().includes(debouncedSearch),
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
          // Update selected order if it's the one being changed
          if (selectedOrder && selectedOrder.id === id) {
            setSelectedOrder({ ...selectedOrder, status });
          }
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

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const StatusSelect = ({
    orderId,
    status,
    onClick,
  }: {
    orderId: number;
    status: string;
    onClick?: (e: React.MouseEvent) => void;
  }) => (
    <Select
      defaultValue={status}
      onValueChange={(val) => handleStatusChange(orderId, val)}
    >
      <SelectTrigger
        className={`h-8 text-xs font-semibold border-0 w-full rounded-full ${getStatusColor(status)}`}
        onClick={onClick}
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
                <div
                  key={order.id}
                  className="p-4 space-y-3 cursor-pointer hover:bg-[#242018] transition-colors active:bg-[#2a2520]"
                  onClick={() => handleOrderClick(order)}
                >
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
                    <div className="w-36" onClick={(e) => e.stopPropagation()}>
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
                      className="hover:bg-[#242018] transition-colors cursor-pointer"
                      onClick={() => handleOrderClick(order)}
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
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
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

      {/* Order Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#1c1916] border-[#2a2520] text-[#f0e8e0] max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#f0e8e0] flex items-center gap-3">
                  <Package className="w-6 h-6 text-[#9a8880]" />
                  Commande #{selectedOrder.id.toString().padStart(5, "0")}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Order Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#181512] rounded-2xl border border-[#2a2520]">
                  <div>
                    <p className="text-xs text-[#6a5c56] mb-1">
                      Date de commande
                    </p>
                    <p className="text-sm font-semibold">
                      {new Date(selectedOrder.createdAt).toLocaleDateString(
                        "fr-FR",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </p>
                    <p className="text-xs text-[#9a8880]">
                      {new Date(selectedOrder.createdAt).toLocaleTimeString(
                        "fr-FR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6a5c56] mb-1">Statut</p>
                    <div className="w-full sm:w-48">
                      <StatusSelect
                        orderId={selectedOrder.id}
                        status={selectedOrder.status}
                      />
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="p-4 bg-[#181512] rounded-2xl border border-[#2a2520] space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-[#9a8880]" />
                    Informations client
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[#6a5c56] mb-1">Nom</p>
                      <p className="text-sm font-semibold">
                        {selectedOrder.customerName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6a5c56] mb-1 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        Email
                      </p>
                      <p className="text-sm break-all">
                        {selectedOrder.customerEmail}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6a5c56] mb-1 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        Téléphone
                      </p>
                      <p className="text-sm">{selectedOrder.customerPhone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6a5c56] mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Ville
                      </p>
                      <p className="text-sm">{selectedOrder.city}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-[#6a5c56] mb-1">Adresse</p>
                    <p className="text-sm">{selectedOrder.address}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 bg-[#181512] rounded-2xl border border-[#2a2520] space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#9a8880]" />
                    Articles commandés
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-[#1c1916] rounded-xl border border-[#2a2520]"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-sm">
                            {item.productName}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-[#9a8880]">
                              Taille:{" "}
                              <span className="font-semibold text-[#f0e8e0]">
                                {item.size}
                              </span>
                            </span>
                            <span className="text-xs text-[#9a8880]">
                              Qté:{" "}
                              <span className="font-semibold text-[#f0e8e0]">
                                {item.quantity}
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">
                            {formatPrice(item.price)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-[#6a5c56]">
                              {formatPrice(item.price * item.quantity)} total
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="p-4 bg-[#181512] rounded-2xl border border-[#2a2520] space-y-3">
                  <h3 className="font-bold text-lg">Récapitulatif</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#9a8880]">Sous-total</span>
                      <span className="font-semibold">
                        {formatPrice(selectedOrder.subtotal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#9a8880]">Livraison</span>
                      <span className="font-semibold">
                        {formatPrice(selectedOrder.delivery)}
                      </span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#9a8880]">Réduction</span>
                        <span className="font-semibold text-emerald-400">
                          -{formatPrice(selectedOrder.discount)}
                        </span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-[#2a2520]">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-xl font-bold">
                          {formatPrice(selectedOrder.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
