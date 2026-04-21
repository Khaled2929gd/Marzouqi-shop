import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { getGetProductQueryKey, useGetProduct } from "@workspace/api-client-react";
import { Layout } from "../components/layout";
import { useCart } from "../context/CartContext";
import { Check, AlertCircle, ShoppingBag, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

function getLocalizedProductDescription(productName: string, fallback: string): string {
  const descriptions: Record<string, string> = {
    "Air Jordan 1 Retro High": "موديل هاي توب أيقوني من جلد فاخر مع راحة يومية ممتازة.",
    "Yeezy Boost 350 V2": "جزء علوي خفيف من الكنيت مع وسادة Boost للراحة طوال اليوم.",
    "Dunk Low Panda": "لوك لو توب كلاسيكي بألوان مريحة، يتناسب مع أي تنسيق يومي.",
    "New Balance 550": "ستايل فينتاج مستوحى من الملاعب مع راحة مثالية للاستخدام اليومي.",
    "Air Max 97 Silver Bullet": "طبقات علوية عاكسة مع وحدة هواء كاملة لإطلالة مميزة.",
    "Converse Chuck 70 High": "كانفاس كلاسيكي هاي توب مع وسادة محسّنة وتفاصيل ريترو.",
    "Gel-Kayano 30": "حذاء ركض للثبات مع فوم ناعم وانتقال سلس.",
    "Puma Suede Classic": "أيقونة ستريتوير من السويد الناعم بخطوط كلاسيكية أنيقة.",
  };
  return descriptions[productName] || fallback;
}

export default function ProductDetail() {
  const [match, params] = useRoute("/products/:id");
  const id = match ? parseInt(params.id) : 0;
  const [, setLocation] = useLocation();

  const { data: product, isLoading, isError } = useGetProduct(id, {
    query: { enabled: !!id, queryKey: getGetProductQueryKey(id) },
  });
  const { addItem } = useCart();
  const { toast } = useToast();

  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  if (isLoading) {
    return (
      <Layout backButton>
        <div className="flex flex-col md:flex-row gap-8 px-4 md:px-8 py-8 w-full animate-pulse">
          <div className="w-full md:w-1/2 aspect-square bg-gray-100 rounded-2xl"></div>
          <div className="w-full md:w-1/2 space-y-5 pt-4">
            <div className="h-4 bg-gray-100 w-20 rounded"></div>
            <div className="h-8 bg-gray-100 w-3/4 rounded"></div>
            <div className="h-7 bg-gray-100 w-1/4 rounded"></div>
            <div className="space-y-2 pt-4">
              <div className="h-3 bg-gray-100 w-full rounded"></div>
              <div className="h-3 bg-gray-100 w-2/3 rounded"></div>
            </div>
            <div className="pt-6">
              <div className="h-4 bg-gray-100 w-24 rounded mb-4"></div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-12 h-12 bg-gray-100 rounded-xl"></div>)}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError || !product) {
    return (
      <Layout backButton>
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <AlertCircle className="w-10 h-10 text-gray-300 mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">المنتج غير موجود</h2>
          <p className="text-sm text-gray-500 mb-6">ربما حُذف أو نفذ من المخزن.</p>
          <Button onClick={() => setLocation("/products")} variant="outline" className="rounded-full">ارجع للمتجر</Button>
        </div>
      </Layout>
    );
  }

  const images = [product.imageUrl, ...product.images];
  const localizedDescription = getLocalizedProductDescription(product.name, product.description);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({ title: "اختر المقاس أولًا", variant: "destructive" });
      return;
    }
    setIsAdding(true);
    addItem({
      productId: product.id,
      productName: product.name,
      productImage: product.imageUrl,
      size: selectedSize,
      price: product.price,
      quantity: 1
    });
    setTimeout(() => {
      setIsAdding(false);
      toast({
        title: "تمت الإضافة للسلة",
        description: `${product.name} (مقاس ${selectedSize})`,
      });
    }, 600);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast({ title: "اختر المقاس أولًا", variant: "destructive" });
      return;
    }
    addItem({
      productId: product.id,
      productName: product.name,
      productImage: product.imageUrl,
      size: selectedSize,
      price: product.price,
      quantity: 1
    });
    setLocation("/cart");
  };

  return (
    <Layout backButton hideNav>
      <div className="flex flex-col md:flex-row gap-0 md:gap-10 w-full pb-24 md:pb-12 md:p-8">

        {/* Images */}
        <div className="w-full md:w-[52%] flex flex-col gap-3">
          <div className="relative aspect-square w-full bg-[#f5f5f5] md:rounded-2xl overflow-hidden flex items-center justify-center p-8">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                src={images[activeImageIndex]}
                alt={product.name}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                width={1200}
                height={900}
                className="w-full h-full object-contain"
              />
            </AnimatePresence>

            {product.stock < 5 && product.stock > 0 && (
              <div className="absolute top-4 start-4 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
                باقي {product.stock} فقط
              </div>
            )}
            {product.stock === 0 && (
              <div className="absolute top-4 start-4 bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-full">
                نفذ من المخزن
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 px-4 md:px-0 overflow-x-auto snap-x scrollbar-hide">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  aria-label={`عرض الصورة ${i + 1}`}
                  className={`relative shrink-0 snap-start w-16 h-16 md:w-20 md:h-20 rounded-xl bg-[#f5f5f5] overflow-hidden border-2 transition-all ${activeImageIndex === i ? "border-gray-900" : "border-transparent"}`}
                >
                  <img src={img} className="w-full h-full object-contain p-1.5" alt={`صورة ${i + 1}`} loading="lazy" decoding="async" width={160} height={160} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="w-full md:w-[48%] flex flex-col px-5 md:px-0 pt-6 md:pt-0">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            {product.brand}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-3">
            {product.name}
          </h1>

          <div className="flex items-baseline gap-3 mb-5" dir="ltr">
            <span className="text-2xl font-black text-gray-900">${product.price.toFixed(2)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-base text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>

          <p className="text-sm text-gray-500 leading-relaxed mb-7">{localizedDescription}</p>

          <div className="mb-7">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">اختر المقاس</h3>
              <button className="text-xs text-gray-400 hover:text-gray-900 transition-colors">دليل المقاسات</button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`
                    h-12 rounded-xl flex items-center justify-center text-sm font-semibold transition-all
                    ${selectedSize === size
                      ? "bg-gray-900 text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"}
                  `}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Authenticity note */}
          <div className="flex items-center gap-3 py-4 border-t border-b border-gray-100 mb-7">
            <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0" />
            <p className="text-xs text-gray-500">كل منتج يتحقق منه قبل التوصيل — ضمان الأصالة.</p>
          </div>

          {/* Action Buttons */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:relative md:bg-transparent md:border-0 md:p-0 z-40 flex gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAdding}
              variant="outline"
              className="flex-1 h-12 rounded-full border-gray-200 hover:border-gray-900 text-gray-900 font-semibold transition-all"
            >
              {isAdding ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Check className="w-5 h-5" />
                </motion.div>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 me-2" />
                  أضف للسلة
                </>
              )}
            </Button>

            <Button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-1 h-12 rounded-full bg-gray-900 hover:bg-black text-white font-semibold"
            >
              اشتري الآن
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
