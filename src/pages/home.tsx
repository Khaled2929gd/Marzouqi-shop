import { useGetFeaturedProducts, useListCategories } from "@workspace/api-client-react";
import { Layout } from "../components/layout";
import { ProductCard } from "../components/product-card";
import { Link } from "wouter";
import { ArrowLeft, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

function getCategoryLabel(name: string): string {
  const labels: Record<string, string> = {
    basketball: "كرة السلة",
    lifestyle: "ستايل يومي",
    running: "الجري",
    casual: "كاجوال",
    football: "كرة القدم",
    training: "تدريب",
  };
  return labels[name.toLowerCase()] || name;
}

export default function Home() {
  const { data: featuredProducts, isLoading: isLoadingFeatured } = useGetFeaturedProducts();
  const { data: categories, isLoading: isLoadingCategories } = useListCategories();

  return (
    <Layout>
      <div className="flex-1 w-full">

        {/* Hero — editorial split */}
        <section className="flex flex-col md:flex-row min-h-[480px] md:min-h-[560px] border-b border-gray-100">

          {/* Text side (start = right in RTL) */}
          <div className="flex-1 flex flex-col justify-center px-6 md:px-14 py-12 md:py-20 order-2 md:order-1">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-5"
            >
              كوليكشن 2025
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight mb-5"
            >
              سنيكرز<br />
              بريميوم.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.16 }}
              className="text-gray-500 text-base max-w-xs mb-8 leading-relaxed"
            >
              أحذية أصلية مختارة، تصلك لباب الدار.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.24 }}
              className="flex items-center gap-3"
            >
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black active:scale-95 text-white font-semibold px-7 py-3 rounded-full transition-all text-sm"
              >
                اكتشف المتجر
                <ArrowLeft className="w-4 h-4 rtl-flip" />
              </Link>
            </motion.div>
          </div>

          {/* Image side (end = left in RTL) */}
          <div className="relative flex-1 bg-[#f5f5f5] flex items-center justify-center p-8 md:p-12 min-h-[300px] order-1 md:order-2">
            <motion.img
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              src="/images/shoe-1.png"
              alt="سنيكر مميز"
              width={900}
              height={700}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="relative z-10 w-full max-w-[260px] md:max-w-[400px] drop-shadow-xl rotate-6"
            />
            <div className="absolute bottom-6 end-6 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
              <p className="text-[10px] text-gray-400 mb-0.5">ابتداءً من</p>
              <p className="font-black text-gray-900 text-lg leading-none" dir="ltr">89<span className="text-gray-400 text-sm font-medium">$</span></p>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="px-4 md:px-8 py-8 border-b border-gray-100">
          <div className="flex overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 gap-2 snap-x scrollbar-hide">
            {isLoadingCategories ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-24 rounded-full shrink-0" />
              ))
            ) : (
              <>
                <Link href="/products" className="shrink-0 snap-start bg-gray-900 text-white px-5 py-2 rounded-full font-medium text-sm transition-colors">
                  الكل
                </Link>
                {categories?.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.slug}`}
                    className="shrink-0 snap-start bg-white border border-gray-200 text-gray-700 px-5 py-2 rounded-full font-medium text-sm hover:border-gray-900 hover:text-gray-900 transition-colors"
                  >
                    {getCategoryLabel(category.name)}
                  </Link>
                ))}
              </>
            )}
          </div>
        </section>

        {/* Featured Products */}
        <section className="px-4 md:px-8 py-10">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900">الأكثر مبيعًا</h2>
            <Link href="/products" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              شوف الكل
            </Link>
          </div>

          {isLoadingFeatured ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="h-3 w-1/3 mt-2" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {featuredProducts?.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}

          <div className="mt-8 sm:hidden">
            <Link
              href="/products"
              className="flex w-full items-center justify-center border border-gray-200 text-gray-700 font-medium px-4 py-3 rounded-full hover:border-gray-900 hover:text-gray-900 active:scale-[0.98] transition-all text-sm"
            >
              جميع المنتجات
            </Link>
          </div>
        </section>

        {/* Value Props */}
        <section className="px-4 md:px-8 py-12 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">توصيل سريع</h4>
                <p className="text-sm text-gray-500 leading-relaxed">تصلك طلبيتك خلال ٢–٣ أيام عمل.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">١٠٠٪ أصلي</h4>
                <p className="text-sm text-gray-500 leading-relaxed">كل زوج يتحقق منه قبل ما يخرج من عندنا.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">إرجاع مضمون</h4>
                <p className="text-sm text-gray-500 leading-relaxed">ما رضيتيش؟ نقبلوا الإرجاع خلال ١٤ يوم.</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
}
