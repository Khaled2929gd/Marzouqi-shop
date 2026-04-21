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
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-9 h-9 text-gray-400" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">سلتك فارغة</h2>
          <p className="text-gray-500 text-sm max-w-xs mx-auto mb-8">ما زلت ما أضفتيش حتى حذاء.</p>
          <Button
            size="lg"
            onClick={() => setLocation("/products")}
            className="rounded-full px-8 h-12 text-sm font-semibold bg-gray-900 hover:bg-black"
          >
            ابدأ التسوق
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`السلة (${itemCount})`} hideNav>
      <div className="flex flex-col lg:flex-row gap-8 px-4 md:px-8 py-8 w-full pb-32 lg:pb-12">

        {/* Cart Items */}
        <div className="flex-1">
          <div className="space-y-3">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={`${item.productId}-${item.size}`}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
                  className="flex gap-4 py-4 border-b border-gray-100 last:border-0"
                >
                  <Link href={`/products/${item.productId}`} className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-[#f5f5f5] rounded-xl p-2 flex items-center justify-center">
                    <img src={item.productImage} alt={item.productName} loading="lazy" decoding="async" width={320} height={320} className="w-full h-full object-contain" />
                  </Link>

                  <div className="flex flex-1 flex-col justify-between py-0.5">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <Link href={`/products/${item.productId}`} className="font-semibold text-gray-900 leading-tight line-clamp-1 hover:text-gray-600 transition-colors text-sm">
                          {item.productName}
                        </Link>
                        <div className="text-xs text-gray-400 mt-0.5">مقاس {item.size}</div>
                      </div>
                      <div className="font-bold text-gray-900 text-sm shrink-0" dir="ltr">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center bg-gray-50 rounded-full" dir="ltr">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                          aria-label={`تقليل الكمية لـ ${item.productName}`}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center font-semibold text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                          aria-label={`زيادة الكمية لـ ${item.productName}`}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId, item.size)}
                        aria-label={`حذف ${item.productName} من السلة`}
                        className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-rose-500 transition-colors"
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
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
            <h3 className="font-black text-gray-900 mb-6">ملخص الطلب</h3>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>المجموع</span>
                <span className="text-gray-900 font-medium" dir="ltr">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>التوصيل</span>
                <span className="text-gray-900 font-medium" dir="ltr">${delivery.toFixed(2)}</span>
              </div>
            </div>

            <div className="h-px bg-gray-200 mb-6"></div>

            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-900 font-bold">الإجمالي</span>
              <span className="text-2xl font-black text-gray-900" dir="ltr">${finalTotal.toFixed(2)}</span>
            </div>

            <Button
              onClick={() => setLocation("/checkout")}
              className="w-full h-12 rounded-full bg-gray-900 hover:bg-black text-white font-semibold flex items-center justify-center gap-2"
            >
              إتمام الطلب
              <ArrowLeft className="w-4 h-4 rtl-flip" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
