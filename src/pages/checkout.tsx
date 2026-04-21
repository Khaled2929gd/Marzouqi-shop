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
import { Link } from "wouter";

const checkoutSchema = z.object({
  customerPhone: z.string().min(8, "أدخل رقم هاتف صحيح"),
  address: z.string().min(6, "أدخل عنوانك الكامل")
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

  if (items.length === 0) {
    setLocation("/cart");
    return null;
  }

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { customerPhone: "", address: "" },
  });

  const openWhatsAppOrder = (values: z.infer<typeof checkoutSchema>) => {
    if (!WHATSAPP_ORDER_PHONE) {
      toast({
        title: "واتساب غير مضبوط",
        description: "أضف VITE_WHATSAPP_ORDER_PHONE في .env لتفعيل هذا الخيار.",
        variant: "destructive",
      });
      return;
    }

    const lines = [
      "السلام، بغيت ندير طلب من مرزوقي:",
      "",
      ...items.map(
        (item) =>
          `- ${item.productName} | مقاس ${item.size} | كمية ${item.quantity} | ${(item.price * item.quantity).toFixed(2)}$`,
      ),
      "",
      `المجموع: ${total.toFixed(2)}$`,
      `التوصيل: ${delivery.toFixed(2)}$`,
      `الإجمالي: ${finalTotal.toFixed(2)}$`,
      "",
      `الهاتف: ${values.customerPhone}`,
      `العنوان: ${values.address}`,
    ];

    const targetNumber = normalizePhone(WHATSAPP_ORDER_PHONE);
    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/${targetNumber}?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const onSubmit = (values: z.infer<typeof checkoutSchema>) => {
    const normalizedPhone = normalizePhone(values.customerPhone);
    const now = Date.now();
    const customerTag = normalizedPhone.slice(-4) || `${now}`.slice(-4);
    const generatedName = `عميل-${customerTag}`;
    const generatedEmail = `client-${customerTag}-${now}@marzouki.local`;

    createOrder.mutate(
      {
        data: {
          customerName: generatedName,
          customerEmail: generatedEmail,
          customerPhone: values.customerPhone,
          address: values.address,
          city: "المغرب",
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
            title: "ما قدرناش نكملوا الطلب",
            description: "عاود جرب من بعد شوية.",
            variant: "destructive"
          });
        }
      }
    );
  };

  return (
    <Layout title="إتمام الطلب" hideNav backButton>
      <div className="flex flex-col lg:flex-row gap-8 px-4 md:px-8 py-8 w-full">

        {/* Checkout Form */}
        <div className="flex-1 lg:max-w-xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <div>
                <h3 className="text-base font-bold text-gray-900 mb-5">معلومات التوصيل</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-gray-600">رقم الهاتف</FormLabel>
                        <FormControl>
                          <Input placeholder="06 12 34 56 78" className="h-12 bg-gray-50 border-transparent rounded-xl focus:bg-white" dir="ltr" {...field} />
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
                        <FormLabel className="text-sm text-gray-600">العنوان الكامل</FormLabel>
                        <FormControl>
                          <Input placeholder="الدار، الحي، المدينة..." className="h-12 bg-gray-50 border-transparent rounded-xl focus:bg-white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Mobile Pay Buttons */}
              <div className="block lg:hidden space-y-3 pt-2">
                <Button
                  type="submit"
                  disabled={createOrder.isPending}
                  className="w-full h-12 rounded-full bg-gray-900 hover:bg-black text-white font-semibold"
                >
                  {createOrder.isPending
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : <span dir="ltr">تأكيد الطلب — {finalTotal.toFixed(2)}$</span>
                  }
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 rounded-full font-medium border-gray-200"
                  onClick={form.handleSubmit(openWhatsAppOrder)}
                >
                  <MessageCircle className="w-4 h-4 me-2" />
                  اطلب بواتساب
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-88 shrink-0">
          <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
            <h3 className="font-black text-gray-900 mb-5">في سلتك</h3>

            <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pe-1 custom-scrollbar">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex gap-3">
                  <div className="w-14 h-14 bg-white rounded-xl p-1 shrink-0 flex items-center justify-center">
                    <img src={item.productImage} alt={item.productName} loading="lazy" decoding="async" width={128} height={128} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 py-0.5">
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{item.productName}</h4>
                    <p className="text-xs text-gray-400">مقاس {item.size} · ×{item.quantity}</p>
                    <p className="text-sm font-bold text-gray-900 mt-1" dir="ltr">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-px bg-gray-200 mb-5"></div>

            <div className="space-y-2 mb-5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>المجموع</span>
                <span className="font-medium text-gray-900" dir="ltr">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>التوصيل</span>
                <span className="font-medium text-gray-900" dir="ltr">${delivery.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-900 font-bold">الإجمالي</span>
              <span className="text-2xl font-black text-gray-900" dir="ltr">${finalTotal.toFixed(2)}</span>
            </div>

            <div className="hidden lg:flex lg:flex-col lg:gap-3">
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={createOrder.isPending}
                className="w-full h-12 rounded-full bg-gray-900 hover:bg-black text-white font-semibold"
              >
                {createOrder.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "تأكيد الطلب"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 rounded-full font-medium border-gray-200"
                onClick={form.handleSubmit(openWhatsAppOrder)}
              >
                <MessageCircle className="w-4 h-4 me-2" />
                اطلب بواتساب
              </Button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              دفع آمن وسهل
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
