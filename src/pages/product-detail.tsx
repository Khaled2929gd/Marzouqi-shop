import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import {
  getGetProductQueryKey,
  useGetProduct,
} from "@workspace/api-client-react";
import { Layout } from "../components/layout";
import { useCart } from "../context/CartContext";
import {
  Check,
  AlertCircle,
  ShoppingBag,
  ShieldCheck,
  Banknote,
  MessageCircle,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

function getLocalizedProductDescription(
  productName: string,
  fallback: string,
): string {
  const descriptions: Record<string, string> = {
    "Air Jordan 1 Retro High":
      "موديل هاي توب أيقوني من جلد فاخر مع راحة يومية ممتازة.",
    "Yeezy Boost 350 V2":
      "جزء علوي خفيف من الكنيت مع وسادة Boost للراحة طوال اليوم.",
    "Dunk Low Panda":
      "لوك لو توب كلاسيكي بألوان مريحة، يتناسب مع أي تنسيق يومي.",
    "New Balance 550":
      "ستايل فينتاج مستوحى من الملاعب مع راحة مثالية للاستخدام اليومي.",
    "Air Max 97 Silver Bullet":
      "طبقات علوية عاكسة مع وحدة هواء كاملة لإطلالة مميزة.",
    "Converse Chuck 70 High":
      "كانفاس كلاسيكي هاي توب مع وسادة محسّنة وتفاصيل ريترو.",
    "Gel-Kayano 30": "حذاء ركض للثبات مع فوم ناعم وانتقال سلس.",
    "Puma Suede Classic":
      "أيقونة ستريتوير من السويد الناعم بخطوط كلاسيكية أنيقة.",
  };
  return descriptions[productName] || fallback;
}

export default function ProductDetail() {
  const [match, params] = useRoute("/products/:id");
  const id = match ? parseInt(params.id) : 0;
  const [, setLocation] = useLocation();
  const {
    data: product,
    isLoading,
    isError,
  } = useGetProduct(id, {
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
          <div className="w-full md:w-1/2 aspect-square bg-[#1c1916] rounded-2xl" />
          <div className="w-full md:w-1/2 space-y-5 pt-4">
            <div className="h-4 bg-[#1c1916] w-20 rounded" />
            <div className="h-8 bg-[#1c1916] w-3/4 rounded" />
            <div className="h-7 bg-[#1c1916] w-1/4 rounded" />
            <div className="space-y-2 pt-4">
              <div className="h-3 bg-[#1c1916] w-full rounded" />
              <div className="h-3 bg-[#1c1916] w-2/3 rounded" />
            </div>
            <div className="pt-6">
              <div className="h-4 bg-[#1c1916] w-24 rounded mb-4" />
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-12 h-12 bg-[#1c1916] rounded-xl" />
                ))}
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
          <AlertCircle className="w-10 h-10 text-[#6a5c56] mb-4" />
          <h2 className="text-lg font-bold text-[#f0e8e0] mb-2">
            المنتج غير موجود
          </h2>
          <p className="text-sm text-[#9a8880] mb-6">
            ربما حُذف أو نفذ من المخزن.
          </p>
          <Button
            onClick={() => setLocation("/products")}
            variant="outline"
            className="rounded-full border-[#2a2520] text-[#f0e8e0] hover:bg-[#1c1916]"
          >
            ارجع للمتجر
          </Button>
        </div>
      </Layout>
    );
  }

  const images = [product.imageUrl, ...product.images];
  const localizedDescription = getLocalizedProductDescription(
    product.name,
    product.description,
  );

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
      quantity: 1,
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
      quantity: 1,
    });
    setLocation("/cart");
  };

  return (
    <Layout backButton hideNav>
      <div className="flex flex-col md:flex-row gap-0 md:gap-10 w-full pb-24 md:pb-12 md:p-8">
        {/* Images */}
        <div className="w-full md:w-[52%] flex flex-col gap-3">
          <div className="relative aspect-square w-full bg-[#1c1916] md:rounded-2xl overflow-hidden flex items-center justify-center p-8">
            <img
              key={activeImageIndex}
              src={images[activeImageIndex]}
              alt={product.name}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              width={1200}
              height={900}
              className="w-full h-full object-contain animate-img-fade"
            />
            {product.stock < 5 && product.stock > 0 && (
              <div className="absolute top-4 start-4 bg-[#2a1210] text-[#ff616d] text-xs font-semibold px-3 py-1 rounded-full border border-[#4a2020]">
                باقي {product.stock} فقط
              </div>
            )}
            {product.stock === 0 && (
              <div className="absolute top-4 start-4 bg-[#0d0b09] text-[#f0e8e0] text-xs font-semibold px-3 py-1 rounded-full border border-[#2a2520]">
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
                  className={`relative shrink-0 snap-start w-16 h-16 md:w-20 md:h-20 rounded-xl bg-[#1c1916] overflow-hidden border-2 transition-all ${activeImageIndex === i ? "border-[#ff616d]" : "border-transparent"}`}
                >
                  <img
                    src={img}
                    className="w-full h-full object-contain p-1.5"
                    alt={`صورة ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                    width={160}
                    height={160}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="w-full md:w-[48%] flex flex-col px-4 md:px-0 pt-5 md:pt-0">
          <div className="text-xs font-bold text-[#ff616d] uppercase tracking-widest mb-2">
            {product.brand}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#f0e8e0] leading-tight mb-3">
            {product.name}
          </h1>
          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-2xl font-black text-[#f0e8e0]">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-base text-[#6a5c56] line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 bg-[#2a1210] border border-[#4a2020] rounded-xl px-4 py-3 mb-6">
            <Banknote className="w-5 h-5 text-[#ff616d] shrink-0" />
            <div>
              <p className="text-sm font-bold text-[#f0e8e0]">
                الدفع عند الاستلام
              </p>
              <p className="text-xs text-[#9a8880]">
                ما خصك تدفع دبا — تدفع غير منين تجيك الطلبية
              </p>
            </div>
          </div>
          <p className="text-sm text-[#9a8880] leading-relaxed mb-7">
            {localizedDescription}
          </p>
          <div className="mb-7">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#f0e8e0]">اختر المقاس</h3>
              <button className="text-xs text-[#6a5c56] hover:text-[#ff616d] transition-colors">
                دليل المقاسات
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`h-12 rounded-xl flex items-center justify-center text-sm font-semibold transition-all ${selectedSize === size ? "bg-[#ff616d] text-white" : "bg-[#1c1916] text-[#c4b5ac] hover:bg-[#242018] hover:text-[#f0e8e0]"}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 py-4 border-t border-b border-[#2a2520] mb-7">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-[#ff616d] shrink-0" />
              <p className="text-xs text-[#9a8880]">
                كل منتج يتحقق منه قبل التوصيل — ضمان الأصالة.
              </p>
            </div>
            <a
              href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_ORDER_PHONE || ""}`.replace(
                /\s/g,
                "",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-xs text-[#ff616d] hover:text-[#ff5563] transition-colors"
            >
              <MessageCircle className="w-4 h-4 shrink-0" /> عندك سؤال؟ كلمنا
              على واتساب وسنردّ عليك فورًا
            </a>
          </div>
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0d0b09] border-t border-[#1e1a16] md:relative md:bg-transparent md:border-0 md:p-0 z-40 flex gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAdding}
              variant="outline"
              className="flex-1 h-12 rounded-full border-[#2a2520] hover:border-[#ff616d] hover:bg-[#2a1210] text-[#f0e8e0] font-semibold transition-all"
            >
              {isAdding ? (
                <span className="animate-badge-scale inline-flex">
                  <Check className="w-5 h-5 text-[#ff616d]" />
                </span>
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
              className="flex-1 h-12 rounded-full bg-[#ff616d] hover:bg-[#ff5563] text-white font-semibold"
            >
              اشتري الآن
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
