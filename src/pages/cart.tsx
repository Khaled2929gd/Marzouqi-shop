import { Layout } from "../components/layout";
import { useCart } from "../context/CartContext";
import { Link, useLocation } from "wouter";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const { items, updateQuantity, removeItem, total, itemCount } = useCart();
  const [, setLocation] = useLocation();

  const delivery = 5.00;
  const finalTotal = items.length > 0 ? total + delivery : 0;

  if (items.length === 0) {
    return (
      <Layout title="السلة" hideNav>
        <div className="flex flex-col items-center justify-center flex-1 py-20 px-4 text-center h-[calc(100vh-64px)]">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">سلتك فارغة</h2>
          <p className="text-gray-500 max-w-sm mx-auto mb-8">ما زلت ما أضفتيش حتى حذاء. ابدأ الآن واختر اللي تبغى.</p>
          <Button
            size="lg"
            onClick={() => setLocation("/products")}
            className="rounded-full px-8 h-14 text-base font-bold"
          >
            ابدأ التسوق
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`السلة (${itemCount})`} hideNav>
      <div className="flex flex-col lg:flex-row gap-8 px-4 md:px-8 py-6 w-full pb-32 lg:pb-12">

        {/* Cart Items */}
        <div className="flex-1">
          <div className="space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={`${item.productId}-${item.size}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  className="flex gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                >
                  <Link href={`/products/${item.productId}`} className="shrink-0 w-20 h-20 sm:w-28 sm:h-28 bg-gray-50 rounded-2xl p-2 flex items-center justify-center">
                    <img src={item.productImage} alt={item.productName} loading="lazy" decoding="async" width={320} height={320} className="w-full h-full object-contain drop-shadow-md" />
                  </Link>

                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <Link href={`/products/${item.productId}`} className="font-bold text-gray-900 leading-tight line-clamp-2 hover:text-red-600 transition-colors">
                          {item.productName}
                        </Link>
                        <div className="text-sm text-gray-500 mt-1">مقاس {item.size}</div>
                      </div>
                      <div className="font-bold text-gray-900 shrink-0" dir="ltr">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center bg-gray-50 rounded-full border border-gray-200" dir="ltr">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                          aria-label={`تقليل الكمية لـ ${item.productName}`}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                          aria-label={`زيادة الكمية لـ ${item.productName}`}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId, item.size)}
                        aria-label={`حذف ${item.productName} من السلة`}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-rose-500 bg-gray-50 hover:bg-rose-50 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-gray-900 rounded-3xl p-6 text-white sticky top-24">
            <h3 className="text-xl font-bold mb-6">ملخص الطلب</h3>

            <div className="space-y-4 mb-6 text-gray-300">
              <div className="flex justify-between">
                <span>المجموع</span>
                <span className="text-white font-medium" dir="ltr">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>التوصيل</span>
                <span className="text-white font-medium" dir="ltr">${delivery.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>الخصم</span>
                <span dir="ltr">$0.00</span>
              </div>
            </div>

            <div className="h-px bg-gray-800 mb-6"></div>

            <div className="flex justify-between items-end mb-8">
              <span className="text-gray-300">الإجمالي</span>
              <span className="text-3xl font-bold text-white" dir="ltr">${finalTotal.toFixed(2)}</span>
            </div>

            <Button
              onClick={() => setLocation("/checkout")}
              className="w-full h-14 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-lg flex items-center justify-center gap-2"
            >
              إتمام الطلب
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
