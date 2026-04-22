import { useGetFeaturedProducts, useListCategories } from "@workspace/api-client-react";
import { Layout } from "../components/layout";
import { ProductCard } from "../components/product-card";
import { Link } from "wouter";
import { ArrowLeft, ShieldCheck, Truck, RotateCcw } from "lucide-react";
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

        {/* Hero */}
        <section
          className="relative min-h-[480px] md:min-h-[560px] flex items-end md:items-center border-b border-gray-100 overflow-hidden"
          style={{ backgroundImage: "url('/images/shoe-1.png')", backgroundSize: "40%", backgroundRepeat: "no-repeat", backgroundPosition: "left 5% center" }}
        >
          <div className="relative z-10 px-6 md:px-14 py-14 md:py-0 md:ms-auto md:w-1/2">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.05] mb-6">
              سنيكرز<br />بريميوم.
            </h1>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black active:scale-95 text-white font-medium px-7 py-3 rounded-full transition-all text-sm"
            >
              اكتشف المتجر
              <ArrowLeft className="w-4 h-4 rtl-flip" />
            </Link>
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
