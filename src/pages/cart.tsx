import { Layout } from "../components/layout";
import { useCart } from "../context/CartContext";
import { Link, useLocation } from "wouter";
import {
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export default function Cart() {
  const { items, updateQuantity, removeItem, total, itemCount } = useCart();
  const [, setLocation] = useLocation();
  const delivery = 5.0;
  const finalTotal = items.length > 0 ? total + delivery : 0;

  if (items.length === 0) {
    return (
      <Layout title="السلة" hideNav>
        <div className="flex flex-col items-center justify-center flex-1 py-20 px-4 text-center h-[calc(100vh-64px)]">
          <div className="w-20 h-20 bg-[#1c1916] rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-9 h-9 text-[#ff616d]" />
          </div>
          <h2 className="text-xl font-black text-[#f0e8e0] mb-2">سلتك فارغة</h2>
          <p className="text-[#9a8880] text-sm max-w-xs mx-auto mb-8">
            ما زلت ما أضفتيش حتى حذاء.
          </p>
          <Button
            size="lg"
            onClick={() => setLocation("/products")}
            className="rounded-full px-8 h-12 text-sm font-semibold bg-[#ff616d] hover:bg-[#ff5563]"
          >
            ابدأ التسوق
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`السلة (${itemCount})`} hideNav>
      <div className="flex flex-col lg:flex-row gap-8 px-4 md:px-8 py-8 w-full pb-24 lg:pb-12">
        <div className="flex-1">
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}`}
                className="flex gap-4 py-4 border-b border-[#1e1a16] last:border-0"
              >
                <Link
                  href={`/products/${item.productId}`}
                  className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-[#1c1916] rounded-xl p-2 flex items-center justify-center"
                >
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    loading="lazy"
                    decoding="async"
                    width={320}
                    height={320}
                    className="w-full h-full object-contain"
                  />
                </Link>
                <div className="flex flex-1 flex-col justify-between py-0.5">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <Link
                        href={`/products/${item.productId}`}
                        className="font-semibold text-[#f0e8e0] leading-tight line-clamp-1 hover:text-[#ff616d] transition-colors text-sm"
                      >
                        {item.productName}
                      </Link>
                      <div className="text-xs text-[#6a5c56] mt-0.5">
                        مقاس {item.size}
                      </div>
                    </div>
                    <div className="font-bold text-[#f0e8e0] text-sm shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div
                      className="flex items-center bg-[#1c1916] rounded-full"
                      dir="ltr"
                    >
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.size,
                            item.quantity - 1,
                          )
                        }
                        aria-label={`تقليل الكمية`}
                        className="w-8 h-8 flex items-center justify-center text-[#6a5c56] hover:text-[#ff616d] transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center font-semibold text-sm text-[#f0e8e0]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.size,
                            item.quantity + 1,
                          )
                        }
                        aria-label={`زيادة الكمية`}
                        className="w-8 h-8 flex items-center justify-center text-[#6a5c56] hover:text-[#ff616d] transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.size)}
                      aria-label={`حذف`}
                      className="w-8 h-8 flex items-center justify-center text-[#3a3028] hover:text-[#ff616d] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-[#1c1916] rounded-2xl p-6 sticky top-20">
            <h3 className="font-black text-[#f0e8e0] mb-6">ملخص الطلب</h3>
            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between text-[#9a8880]">
                <span>المجموع</span>
                <span className="text-[#f0e8e0] font-medium">
                  {formatPrice(total)}
                </span>
              </div>
              <div className="flex justify-between text-[#9a8880]">
                <span>التوصيل</span>
                <span className="text-[#f0e8e0] font-medium">
                  {formatPrice(delivery)}
                </span>
              </div>
            </div>
            <div className="h-px bg-[#2a2520] mb-6" />
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#f0e8e0] font-bold">الإجمالي</span>
              <span className="text-2xl font-black text-[#f0e8e0]">
                {formatPrice(finalTotal)}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-[#2a1210] border border-[#4a2020] rounded-xl px-3 py-2.5 mb-5">
              <Banknote className="w-4 h-4 text-[#ff616d] shrink-0" />
              <p className="text-xs text-[#9a8880] font-medium">
                الدفع عند الاستلام — تدفع فقط منين تجيك الطلبية
              </p>
            </div>
            <Button
              onClick={() => setLocation("/checkout")}
              className="w-full h-12 rounded-full bg-[#ff616d] hover:bg-[#ff5563] text-white font-semibold flex items-center justify-center gap-2"
            >
              إتمام الطلب <ArrowLeft className="w-4 h-4 rtl-flip" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
