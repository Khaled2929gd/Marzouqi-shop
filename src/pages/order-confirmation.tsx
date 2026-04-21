import { Layout } from "../components/layout";
import { useRoute, Link } from "wouter";
import { getGetOrderQueryKey, useGetOrder } from "@workspace/api-client-react";
import { CheckCircle2, Package, ArrowLeft, Home } from "lucide-react";
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
        <div className="flex items-center justify-center h-[60vh] animate-pulse">
          <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout hideNav>
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">الطلب غير موجود</h2>
          <Link href="/">
            <Button>ارجع للرئيسية</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideNav>
      <div className="max-w-2xl mx-auto w-full px-4 py-12 md:py-20 flex flex-col items-center text-center">

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
          className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
        >
          تم تسجيل طلبك!
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-500 mb-8 max-w-md"
        >
          شكرًا جزيلًا، طلبك الآن قيد المعالجة وسيصلك قريبًا.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm mb-8"
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">رقم الطلب</p>
              <p className="font-mono font-bold text-gray-900" dir="ltr">#{order.id.toString().padStart(6, '0')}</p>
            </div>
            <div className="text-start">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">الإجمالي</p>
              <p className="font-bold text-gray-900" dir="ltr">${order.total.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div className="text-start">
              <p className="font-semibold text-gray-900 mb-1">عنوان التوصيل:</p>
              <p className="text-sm text-gray-500 leading-relaxed">{order.address}</p>
              <p className="text-sm text-gray-500">{order.city}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4">
            <h4 className="text-sm font-bold text-gray-900 mb-3">المنتجات ({order.items.reduce((acc, i) => acc + i.quantity, 0)})</h4>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded border border-gray-100 p-1">
                      <img src={item.productImage} alt={item.productName} loading="lazy" decoding="async" width={80} height={80} className="w-full h-full object-contain" />
                    </div>
                    <div className="text-start">
                      <p className="font-medium text-gray-900 line-clamp-1">{item.productName}</p>
                      <p className="text-xs text-gray-500">مقاس: {item.size} · كمية: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-medium" dir="ltr">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 w-full md:w-auto"
        >
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto rounded-full h-12 px-8 font-semibold">
              <Home className="w-4 h-4 me-2" />
              الرئيسية
            </Button>
          </Link>
          <Link href="/products">
            <Button className="w-full sm:w-auto rounded-full h-12 px-8 font-semibold bg-red-600 hover:bg-red-700">
              كمّل التسوق
              <ArrowLeft className="w-4 h-4 ms-2" />
            </Button>
          </Link>
        </motion.div>

      </div>
    </Layout>
  );
}
