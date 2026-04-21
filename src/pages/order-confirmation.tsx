import { Layout } from "../components/layout";
import { useRoute, Link } from "wouter";
import { getGetOrderQueryKey, useGetOrder } from "@workspace/api-client-react";
import { CheckCircle2, Package, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function OrderConfirmation() {
  const [match, params] = useRoute("/order-confirmation/:id");
  const id = match ? parseInt(params.id) : 0;

  const { data: order, isLoading } = useGetOrder(id, {
    query: { enabled: !!id, queryKey: getGetOrderQueryKey(id) },
  });

  if (isLoading) {
    return (
      <Layout hideNav>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-12 h-12 bg-gray-100 rounded-full animate-pulse"></div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout hideNav>
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-4">الطلب غير موجود</h2>
          <Link href="/"><Button variant="outline" className="rounded-full">ارجع للرئيسية</Button></Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideNav>
      <div className="max-w-lg mx-auto w-full px-4 py-12 md:py-20 flex flex-col items-center text-center">

        {/* Success icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 18, stiffness: 220 }}
          className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-10 h-10 text-gray-900" />
        </motion.div>

        <motion.h1
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-2xl md:text-3xl font-black text-gray-900 mb-2"
        >
          تم تسجيل طلبك!
        </motion.h1>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.22 }}
          className="text-sm text-gray-500 mb-8"
        >
          شكرًا، طلبك قيد المعالجة وسيصلك قريبًا.
        </motion.p>

        {/* Order summary card */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full bg-gray-50 rounded-2xl p-6 mb-6 text-start"
        >
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">رقم الطلب</p>
              <p className="font-mono font-bold text-gray-900 text-sm" dir="ltr">#{order.id.toString().padStart(6, '0')}</p>
            </div>
            <div className="text-end">
              <p className="text-xs text-gray-400 mb-1">الإجمالي</p>
              <p className="font-bold text-gray-900" dir="ltr">${order.total.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 mb-5">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900 mb-0.5">عنوان التوصيل</p>
              <p className="text-xs text-gray-500">{order.address}</p>
              <p className="text-xs text-gray-500">{order.city}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4">
            <h4 className="text-xs font-bold text-gray-900 mb-3">المنتجات ({order.items.reduce((acc, i) => acc + i.quantity, 0)})</h4>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-[#f5f5f5] rounded-lg flex items-center justify-center shrink-0">
                      <img src={item.productImage} alt={item.productName} loading="lazy" decoding="async" width={72} height={72} className="w-full h-full object-contain p-0.5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900 line-clamp-1">{item.productName}</p>
                      <p className="text-[11px] text-gray-400">مقاس {item.size} · ×{item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-900" dir="ltr">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 w-full"
        >
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full rounded-full h-11 font-medium border-gray-200">
              <Home className="w-4 h-4 me-2" />
              الرئيسية
            </Button>
          </Link>
          <Link href="/products" className="flex-1">
            <Button className="w-full rounded-full h-11 font-semibold bg-gray-900 hover:bg-black">
              كمّل التسوق
              <ArrowLeft className="w-4 h-4 ms-2 rtl-flip" />
            </Button>
          </Link>
        </motion.div>

      </div>
    </Layout>
  );
}
