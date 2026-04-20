import { Layout } from "../components/layout";
import { useCart } from "../context/CartContext";
import { useLocation } from "wouter";
import { useCreateOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ShieldCheck, Loader2, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const checkoutSchema = z.object({
  customerPhone: z.string().min(8, "Kteb num telephone sahih"),
  address: z.string().min(6, "Kteb l3onwan dyalk")
});

const WHATSAPP_ORDER_PHONE = import.meta.env.VITE_WHATSAPP_ORDER_PHONE || "";

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createOrder = useCreateOrder();

  const delivery = 5.00;
  const finalTotal = total + delivery;

  // Redirect if cart is empty
  if (items.length === 0) {
    setLocation("/cart");
    return null;
  }

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerPhone: "",
      address: "",
    },
  });

  const openWhatsAppOrder = (values: z.infer<typeof checkoutSchema>) => {
    if (!WHATSAPP_ORDER_PHONE) {
      toast({
        title: "WhatsApp ma mconfigurich",
        description: "Zid VITE_WHATSAPP_ORDER_PHONE f .env bach tkhdem had l option.",
        variant: "destructive",
      });
      return;
    }

    const lines = [
      "Salam, bghit ndir commande mn Marzouki Guelmim:",
      "",
      ...items.map(
        (item) =>
          `- ${item.productName} | Pointure ${item.size} | Qty ${item.quantity} | ${(item.price * item.quantity).toFixed(2)}$`,
      ),
      "",
      `Majmou3: ${total.toFixed(2)}$`,
      `Livraison: ${delivery.toFixed(2)}$`,
      `Total: ${finalTotal.toFixed(2)}$`,
      "",
      `Telephone: ${values.customerPhone}`,
      `L3onwan: ${values.address}`,
    ];

    const targetNumber = normalizePhone(WHATSAPP_ORDER_PHONE);
    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/${targetNumber}?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const onSubmit = (values: z.infer<typeof checkoutSchema>) => {
    const normalizedPhone = normalizePhone(values.customerPhone);
    const now = Date.now();
    const customerTag = normalizedPhone.slice(-4) || `${now}`.slice(-4);
    const generatedName = `Client-${customerTag}`;
    const generatedEmail = `client-${customerTag}-${now}@swiftshoeshop.local`;

    createOrder.mutate(
      {
        data: {
          customerName: generatedName,
          customerEmail: generatedEmail,
          customerPhone: values.customerPhone,
          address: values.address,
          city: "Maroc",
          discountCode: undefined,
          items: items.map(item => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity
          }))
        }
      },
      {
        onSuccess: (order) => {
          clearCart();
          setLocation(`/order-confirmation/${order.id}`);
        },
        onError: () => {
          toast({
            title: "Ma t9ednash nkmlo commande",
            description: "3awed jarrab mn ba3d chwia.",
            variant: "destructive"
          });
        }
      }
    );
  };

  return (
    <Layout title="Finalisation" hideNav backButton>
      <div className="flex flex-col lg:flex-row gap-8 px-4 md:px-8 py-6 w-full">
        
        {/* Checkout Form */}
        <div className="flex-1 lg:max-w-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm">1</span>
                  Infos sra3a dyal livraison
                </h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Num telephone</FormLabel>
                        <FormControl>
                          <Input placeholder="06 12 34 56 78" className="h-12 bg-gray-50 border-transparent focus:bg-white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>L3onwan kamel</FormLabel>
                        <FormControl>
                          <Input placeholder="Dar, quartier, ville, code porte..." className="h-12 bg-gray-50 border-transparent focus:bg-white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-xs text-gray-500">
                    Ma kayn la formulaire twil la walo: ghir telephone w l3onwan, w hna nkmlo lik commande.
                  </p>
                </div>
              </div>

              {/* Mobile Pay Button */}
              <div className="block lg:hidden space-y-3">
                <Button 
                  type="submit" 
                  disabled={createOrder.isPending}
                  className="w-full h-14 rounded-full bg-gray-900 hover:bg-black text-white font-bold text-lg"
                >
                  {createOrder.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : `Nconfirmi commande - ${finalTotal.toFixed(2)}$`}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-14 rounded-full font-bold text-base"
                  onClick={form.handleSubmit(openWhatsAppOrder)}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Commander b WhatsApp (optionnel)
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-100 shrink-0">
          <div className="bg-gray-50 rounded-3xl p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4">F panier dyalk</h3>
            
            <div className="space-y-4 mb-6 max-h-75 overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex gap-3">
                  <div className="w-16 h-16 bg-white rounded-xl p-1 shrink-0 flex items-center justify-center border border-gray-100">
                    <img src={item.productImage} alt={item.productName} loading="lazy" decoding="async" width={128} height={128} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 py-1">
                    <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.productName}</h4>
                    <p className="text-xs text-gray-500">Pointure: {item.size} • Qte: {item.quantity}</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="h-px bg-gray-200 mb-6"></div>
            
            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Majmou3</span>
                <span className="font-medium text-gray-900">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Livraison</span>
                <span className="font-medium text-gray-900">${delivery.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-end mb-8">
              <span className="text-gray-900 font-bold">Total</span>
              <span className="text-2xl font-bold text-gray-900">${finalTotal.toFixed(2)}</span>
            </div>
            
            <div className="hidden lg:flex lg:flex-col lg:gap-3">
              <Button 
                onClick={form.handleSubmit(onSubmit)}
                disabled={createOrder.isPending}
                className="w-full h-14 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg"
              >
                {createOrder.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Nconfirmi commande"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-14 rounded-full font-bold text-base"
                onClick={form.handleSubmit(openWhatsAppOrder)}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Commander b WhatsApp (optionnel)
              </Button>
            </div>
            
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Paiement sahl w m2aman
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
