import { Layout } from "../components/layout";
import { useCart } from "../context/CartContext";
import { useLocation } from "wouter";
import { useCreateOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { MessageCircle, Phone, MapPin, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const WHATSAPP_ORDER_PHONE = import.meta.env.VITE_WHATSAPP_ORDER_PHONE || "";

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createOrder = useCreateOrder();

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const delivery = 5.0;
  const finalTotal = total + delivery;

  if (items.length === 0) {
    setLocation("/cart");
    return null;
  }

  const validatePhone = (phoneNum: string): boolean => {
    const normalized = normalizePhone(phoneNum);
    // Accept 13 digits for +212XXXXXXXXX or 10 digits for 0XXXXXXXXX
    if (normalized.length !== 13 && normalized.length !== 10) {
      setPhoneError("رقم الهاتف خاصو يبدا بـ +212");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (phoneError) setPhoneError("");
  };

  const handleConfirmOrder = () => {
    if (!validatePhone(phone)) return;

    const normalizedPhone = normalizePhone(phone);
    const now = Date.now();
    const customerTag = normalizedPhone.slice(-4) || `${now}`.slice(-4);
    const generatedName = `عميل-${customerTag}`;
    const generatedEmail = `client-${customerTag}-${now}@marzouki.local`;

    createOrder.mutate(
      {
        data: {
          customerName: generatedName,
          customerEmail: generatedEmail,
          customerPhone: phone,
          address: address || "سيتم التواصل",
          city: "المغرب",
          discountCode: undefined,
          items: items.map((item) => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
          })),
        },
      },
      {
        onSuccess: (order) => {
          clearCart();
          setLocation(`/order-confirmation/${order.id}`);
        },
        onError: () => {
          toast({
            title: "ما قدرناش نكملوا الطلب",
            description: "عاود جرب من بعد شوية",
            variant: "destructive",
          });
        },
      },
    );
  };

  const handleWhatsAppOrder = () => {
    if (!validatePhone(phone)) return;

    if (!WHATSAPP_ORDER_PHONE) {
      toast({
        title: "واتساب غير متوفر",
        description: "جرب الطريقة الأخرى",
        variant: "destructive",
      });
      return;
    }

    const lines = [
      "السلام عليكم، بغيت ندير طلب:",
      "",
      ...items.map(
        (item) =>
          `• ${item.productName} - مقاس ${item.size} - عدد ${item.quantity} - ${(item.price * item.quantity).toFixed(2)}$`,
      ),
      "",
      `المجموع: ${finalTotal.toFixed(2)}$`,
      "",
      `رقم الهاتف: ${phone}`,
      address ? `العنوان: ${address}` : "",
    ];

    const targetNumber = normalizePhone(WHATSAPP_ORDER_PHONE);
    const text = encodeURIComponent(lines.filter(Boolean).join("\n"));
    window.open(
      `https://wa.me/${targetNumber}?text=${text}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <Layout title="أكمل الطلب" hideNav backButton>
      <div className="min-h-screen bg-white px-4 py-6 pb-32">
        {/* Simple Order Summary */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-bold text-gray-900">طلبك</h2>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}`}
                className="flex gap-3 items-center"
              >
                <div className="w-16 h-16 bg-white rounded-xl p-1 shrink-0">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-base text-gray-900">
                    {item.productName}
                  </p>
                  <p className="text-gray-600 text-sm">
                    مقاس {item.size} × {item.quantity}
                  </p>
                </div>
                <p className="font-bold text-lg text-gray-900" dir="ltr">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}

            <div className="border-t-2 border-gray-200 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">
                  المجموع الكامل
                </span>
                <span className="text-2xl font-black text-green-600" dir="ltr">
                  ${finalTotal.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">التوصيل داخل</p>
            </div>
          </div>
        </div>

        {/* HUGE Phone Input */}
        <div className="mb-6">
          <label className="block mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-6 h-6 text-gray-700" />
              <span className="text-xl font-bold text-gray-900">
                رقم الهاتف ديالك
              </span>
            </div>
            <p className="text-base text-gray-600 mb-3">مثال: +212768605202</p>
            <input
              type="tel"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+212768605202"
              dir="ltr"
              className={`
                w-full h-20 px-6 text-3xl font-bold text-center
                border-4 rounded-2xl bg-gray-50
                focus:outline-none focus:border-blue-500 focus:bg-white
                transition-all
                ${phoneError ? "border-red-500" : "border-gray-200"}
              `}
            />
            {phoneError && (
              <p className="text-red-600 text-lg font-bold mt-2 text-center">
                ⚠️ {phoneError}
              </p>
            )}
          </label>
        </div>

        {/* Optional Address */}
        <div className="mb-8">
          <label className="block">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-6 h-6 text-gray-700" />
              <span className="text-lg font-bold text-gray-900">
                العنوان (اختياري)
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              إذا بغيتي التوصيل لدار، كتب العنوان
            </p>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="مثال: 12 زنقة المسيرة، الرباط"
              className="
                w-full h-16 px-5 text-lg
                border-2 border-gray-200 rounded-xl bg-gray-50
                focus:outline-none focus:border-blue-500 focus:bg-white
                transition-all
              "
            />
          </label>
        </div>

        {/* Fixed Bottom Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-gray-100 p-4 space-y-3 shadow-2xl">
          {/* Main Confirm Button - MASSIVE */}
          <Button
            onClick={handleConfirmOrder}
            disabled={createOrder.isPending || !phone}
            className="
              w-full h-20 text-2xl font-black rounded-2xl
              bg-green-600 hover:bg-green-700 active:bg-green-800
              text-white shadow-xl
              disabled:bg-gray-300 disabled:text-gray-500
              transition-all transform active:scale-95
            "
          >
            {createOrder.isPending ? (
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mb-1"></div>
                <span className="text-lg">جاري التحضير...</span>
              </div>
            ) : (
              <span>✓ أكد الطلب الآن</span>
            )}
          </Button>

          {/* WhatsApp Button */}
          <Button
            onClick={handleWhatsAppOrder}
            disabled={!phone}
            type="button"
            className="
              w-full h-16 text-xl font-bold rounded-xl
              bg-white hover:bg-gray-50 active:bg-gray-100
              text-green-600 border-4 border-green-600
              disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300
              transition-all transform active:scale-95
            "
          >
            <MessageCircle className="w-6 h-6 ml-2" />
            أو اطلب بواتساب
          </Button>
        </div>
      </div>
    </Layout>
  );
}
