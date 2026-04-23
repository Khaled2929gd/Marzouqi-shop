import {
  useGetFeaturedProducts,
  useListCategories,
} from "@workspace/api-client-react";
import { Layout } from "../components/layout";
import { ProductCard } from "../components/product-card";
import { Link } from "wouter";
import { ShieldCheck, Truck, Banknote } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { FaWhatsapp } from "react-icons/fa";

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

const WA_NUMBER = (import.meta.env.VITE_WHATSAPP_ORDER_PHONE || "").replace(
  /\s/g,
  "",
);

export default function Home() {
  const { data: featuredProducts, isLoading: isLoadingFeatured } =
    useGetFeaturedProducts();
  const { data: categories, isLoading: isLoadingCategories } =
    useListCategories();

  return (
    <Layout>
      <div className="flex-1 w-full">
        {/* ═══════════════════════════════════════════════
            HERO — conversion-focused, mobile-first, Darija
        ═══════════════════════════════════════════════ */}
        <section
          className="relative overflow-hidden border-b border-[#1e1a16]"
          dir="rtl"
        >
          {/* Background image */}
          <img
            src="/heroo.png"
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            width={1600}
            height={900}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          {/* Strong dark overlay — 80% so text is always readable */}
          <div className="absolute inset-0 bg-black/80" />

          {/* ── Content stack ── */}
          <div className="relative z-10 flex flex-col items-center gap-4 px-4 pt-8 pb-7 max-w-lg mx-auto text-center">
            {/* 1 ▸ TOP BADGE */}
            <span className="-rotate-2 inline-block bg-[#ff616d] text-white text-sm font-black px-5 py-1.5 rounded-full shadow-lg tracking-wide">
              🔥 جديد
            </span>

            {/* 2 ▸ MAIN HEADLINE */}
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-white leading-tight drop-shadow-lg">
                نعال زوينين
              </h1>
              <div className="inline-block mt-2 bg-[#ff616d] text-white text-4xl md:text-5xl font-black px-4 py-1 rounded-xl leading-snug shadow-md">
                بثمن رخيص
              </div>
            </div>

            {/* 3 ▸ SUBTEXT */}
            <p className="text-white/90 text-lg md:text-xl font-bold leading-snug">
              توصيل حتى لباب دارك فـ
              <span className="text-[#ff616d]">ڭلميم</span>
            </p>

            {/* 4 ▸ TRUST ROW */}
            <div className="flex flex-wrap justify-center gap-2 w-full">
              <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2">
                <span className="text-[#4ADE80] font-black text-base leading-none">
                  ✔
                </span>
                <span className="text-white text-xs font-bold">
                  الدفع عند الاستلام
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2">
                <span className="text-[#4ADE80] font-black text-base leading-none">
                  ✔
                </span>
                <span className="text-white text-xs font-bold">
                  تبديل إلا ماعجبكش
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2">
                <span className="text-[#4ADE80] font-black text-base leading-none">
                  ✔
                </span>
                <span className="text-white text-xs font-bold">
                  توصيل فـڭلميم فقط
                </span>
              </div>
            </div>

            {/* 5 ▸ PRICE BADGE */}
            <div className="bg-[#2a1210] border-2 border-[#ff616d] rounded-2xl px-8 py-3 shadow-xl shadow-red-900/30 text-center">
              <p className="text-[#9a8880] text-sm font-bold leading-none mb-1">
                ابتداءً من
              </p>
              <p className="text-[#ff616d] font-black leading-none">
                <span className="text-5xl">49</span>
                <span className="text-2xl mr-1">درهم</span>
              </p>
            </div>

            {/* 6 ▸ PRIMARY CTA — WhatsApp */}
            <a
              href={`https://wa.me/${WA_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#1db954] active:scale-95 text-white font-black text-xl px-6 py-4 rounded-2xl transition-all shadow-2xl shadow-green-900/50"
            >
              <FaWhatsapp className="text-2xl shrink-0" />
              اطلب دابا فواتساب
            </a>

            {/* 7 ▸ SECONDARY CTA */}
            <Link
              href="/products"
              className="flex items-center justify-center w-full border-2 border-white/40 hover:border-white/70 hover:bg-white/10 active:scale-95 text-white font-bold text-base px-6 py-3 rounded-2xl transition-all"
            >
              شوف الكولكسيون
            </Link>

            {/* 8 ▸ SOCIAL PROOF STRIP */}
            <div className="flex items-center justify-center gap-3 pt-1">
              {/* Mini avatar circles */}
              <div className="flex" dir="ltr">
                {["🧕", "👩", "👩‍🦱", "👩‍🦳"].map((emoji, i) => (
                  <span
                    key={i}
                    style={{ marginLeft: i === 0 ? 0 : "-8px" }}
                    className="w-8 h-8 rounded-full border-2 border-[#ff616d] bg-[#0d0b09] flex items-center justify-center text-sm shadow"
                  >
                    {emoji}
                  </span>
                ))}
              </div>
              <p className="text-white/90 text-sm font-bold leading-snug">
                أكثر من 10,000 زبونة راضية&nbsp;⭐⭐⭐⭐⭐
              </p>
            </div>
          </div>
        </section>
        {/* ═══════════════════════ END HERO ═══════════════════════ */}

        {/* Category pills */}
        <section className="px-4 md:px-8 py-6 border-b border-[#1e1a16]">
          <div className="flex overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 gap-2 snap-x scrollbar-hide">
            {isLoadingCategories ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-24 rounded-full shrink-0" />
              ))
            ) : (
              <>
                <Link
                  href="/products"
                  className="shrink-0 snap-start bg-[#ff616d] text-white px-5 py-2 rounded-full font-medium text-sm"
                >
                  الكل
                </Link>
                {categories?.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.slug}`}
                    className="shrink-0 snap-start bg-[#1c1916] border border-[#2a2520] text-[#c4b5ac] px-5 py-2 rounded-full font-medium text-sm hover:border-[#ff616d] hover:text-[#ff616d] transition-colors"
                  >
                    {getCategoryLabel(category.name)}
                  </Link>
                ))}
              </>
            )}
          </div>
        </section>

        {/* Featured products */}
        <section className="px-4 md:px-8 py-10">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl font-black text-[#f0e8e0]">
              الأكثر مبيعًا
            </h2>
            <Link
              href="/products"
              className="text-sm text-[#9a8880] hover:text-[#ff616d] transition-colors"
            >
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts?.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}

          <div className="mt-8 md:hidden">
            <Link
              href="/products"
              className="flex w-full items-center justify-center border border-[#2a2520] text-[#c4b5ac] font-medium px-4 py-3 rounded-full hover:border-[#ff616d] hover:text-[#ff616d] active:scale-[0.98] transition-all text-sm"
            >
              جميع المنتجات
            </Link>
          </div>
        </section>

        {/* Trust features */}
        <section className="px-4 md:px-8 py-12 border-t border-[#1e1a16]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#2a1210] rounded-xl flex items-center justify-center shrink-0">
                <Banknote className="w-5 h-5 text-[#ff616d]" />
              </div>
              <div>
                <h4 className="font-bold text-[#f0e8e0] mb-1">
                  الدفع عند الاستلام
                </h4>
                <p className="text-sm text-[#9a8880] leading-relaxed">
                  ما خصك تدفع دبا — تدفع فقط منين تجيك الطلبية.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#1c1916] rounded-xl flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-[#f0e8e0]" />
              </div>
              <div>
                <h4 className="font-bold text-[#f0e8e0] mb-1">
                  توصيل لكلميم والجهة
                </h4>
                <p className="text-sm text-[#9a8880] leading-relaxed">
                  تصلك طلبيتك فـ ١–٣ أيام عمل لباب الدار.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#1c1916] rounded-xl flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#f0e8e0]" />
              </div>
              <div>
                <h4 className="font-bold text-[#f0e8e0] mb-1">
                  أصلي ١٠٠٪ مضمون
                </h4>
                <p className="text-sm text-[#9a8880] leading-relaxed">
                  كل زوج يتحقق منه قبل ما يخرج من عندنا.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
