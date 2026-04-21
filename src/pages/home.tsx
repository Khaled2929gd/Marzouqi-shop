import { useGetFeaturedProducts, useListCategories } from "@workspace/api-client-react";
import { Layout } from "../components/layout";
import { ProductCard } from "../components/product-card";
import { Link } from "wouter";
import { ArrowRight, Zap, TrendingUp, ShieldCheck, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

function getCategoryLabel(name: string): string {
  const labels: Record<string, string> = {
    basketball: "Basket",
    lifestyle: "Style yawmiy",
    running: "Course",
    casual: "Casual",
    football: "Foot",
    training: "Training",
  };

  return labels[name.toLowerCase()] || name;
}

export default function Home() {
  const { data: featuredProducts, isLoading: isLoadingFeatured } = useGetFeaturedProducts();
  const { data: categories, isLoading: isLoadingCategories } = useListCategories();

  return (
    <Layout>
      <div className="flex-1 w-full pb-10">
        {/* Hero Section */}
        <section className="px-4 py-6 md:px-8 md:py-8">
          <div className="relative w-full rounded-3xl overflow-hidden bg-[#0c0c0e] min-h-[500px] md:min-h-[560px] shadow-2xl">

            {/* Background: blurred color orbs */}
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-red-700/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-950/40 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-600/5 rounded-full blur-2xl pointer-events-none" />
            {/* Subtle dot grid */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 flex flex-col md:flex-row items-center min-h-[500px] md:min-h-[560px]">

              {/* Left: text */}
              <div className="flex-1 px-7 pt-12 pb-6 md:px-14 md:py-16 flex flex-col items-center md:items-start text-center md:text-left">

                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 bg-red-600/15 border border-red-600/30 text-red-400 text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-7"
                >
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  New Drop · Collection 2025
                </motion.div>

                {/* Heading */}
                <motion.h2
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-[2.6rem] md:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight mb-5"
                >
                  Sneakers
                  <br />
                  <span className="text-red-500">Premium.</span>
                  <br />
                  <span className="text-gray-500 font-light text-3xl md:text-4xl">Livrés chez toi.</span>
                </motion.h2>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32 }}
                  className="text-gray-500 text-sm md:text-base max-w-xs md:max-w-sm mb-8 leading-relaxed"
                >
                  Les meilleures sneakers authentiques, sélectionnées pour toi. Style, confort et qualité garantis.
                </motion.p>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.42 }}
                  className="flex items-center gap-5 mb-8"
                >
                  <div>
                    <div className="text-xl font-black text-white">2 500+</div>
                    <div className="text-[11px] text-gray-600 mt-0.5">Clients</div>
                  </div>
                  <div className="w-px h-8 bg-gray-800" />
                  <div>
                    <div className="text-xl font-black text-white">4.9 <span className="text-red-500 text-base">★</span></div>
                    <div className="text-[11px] text-gray-600 mt-0.5">Note moy.</div>
                  </div>
                  <div className="w-px h-8 bg-gray-800" />
                  <div>
                    <div className="text-xl font-black text-white">100%</div>
                    <div className="text-[11px] text-gray-600 mt-0.5">Authentique</div>
                  </div>
                </motion.div>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.52 }}
                  className="flex items-center gap-3"
                >
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold px-7 py-3.5 rounded-full transition-all shadow-[0_0_24px_rgba(220,38,38,0.45)]"
                  >
                    Découvrir
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-semibold px-5 py-3.5 rounded-full border border-gray-700 hover:border-gray-500 transition-all"
                  >
                    Voir tout
                  </Link>
                </motion.div>
              </div>

              {/* Right: shoe */}
              <div className="flex-1 relative flex items-end md:items-center justify-center w-full pb-10 md:pb-0 md:pr-10 md:py-12 min-h-[280px] md:min-h-auto">

                {/* Red glow puddle under shoe */}
                <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 w-56 h-10 bg-red-600/40 blur-2xl rounded-full pointer-events-none" />

                {/* Floating shoe */}
                <motion.img
                  src="/images/shoe-1.png"
                  alt="Sneaker vedette"
                  width={900}
                  height={700}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  animate={{ y: [0, -16, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 w-full max-w-[280px] md:max-w-[420px] drop-shadow-[0_40px_60px_rgba(0,0,0,0.8)] -rotate-6"
                />

                {/* Floating chip: Tendance */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="absolute top-8 right-6 md:right-4 bg-white/8 backdrop-blur-md border border-white/10 text-white text-xs font-bold px-3.5 py-2 rounded-2xl flex items-center gap-1.5"
                >
                  🔥 <span>Tendance</span>
                </motion.div>

                {/* Floating chip: Starting price */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.85 }}
                  className="absolute bottom-16 md:bottom-20 left-4 md:left-2 bg-white/8 backdrop-blur-md border border-white/10 rounded-2xl px-3.5 py-2.5"
                >
                  <div className="text-[10px] text-gray-500 mb-0.5">À partir de</div>
                  <div className="text-white font-black text-lg leading-none">89<span className="text-red-400 text-sm">$</span></div>
                </motion.div>

              </div>
            </div>
          </div>
        </section>

        {/* Brands/Categories */}
        <section className="px-4 md:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Top marques</h3>
          </div>
          <div className="flex overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 gap-3 snap-x scrollbar-hide">
            {isLoadingCategories ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-28 rounded-full shrink-0" />
              ))
            ) : (
              <Link href="/products" className="shrink-0 snap-start bg-gray-900 text-white px-6 py-3 rounded-full font-semibold text-sm shadow-md hover:bg-gray-800 transition-colors">
                Koulchi
              </Link>
            )}
            
            {categories?.map((category, i) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="shrink-0 snap-start"
              >
                <Link 
                  href={`/products?category=${category.slug}`}
                  className="block bg-white border border-gray-100 text-gray-800 px-6 py-3 rounded-full font-semibold text-sm shadow-sm hover:border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  {getCategoryLabel(category.name)}
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="px-4 md:px-8 py-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-600" />
                Tal3in daba
              </h3>
              <p className="text-sm text-gray-500 mt-1">Aktr sneakers matloubin had simana</p>
            </div>
            <Link href="/products" className="text-sm font-semibold text-red-600 hover:text-red-700 hidden sm:block">
              Chof koulchi
            </Link>
          </div>

          {isLoadingFeatured ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <Skeleton className="h-4 w-1/3 mt-2" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-1/4 mt-2" />
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
          
          <div className="mt-8 sm:hidden">
            <Link href="/products" className="flex w-full items-center justify-center bg-gray-100 text-gray-900 font-semibold px-4 py-3 rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all">
              Chof ga3 lproduits
            </Link>
          </div>
        </section>

        {/* Value Props */}
        <section className="px-4 md:px-8 py-12 mb-8 bg-white border-y border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Livraison sria</h4>
              <p className="text-sm text-gray-500">Twslk commande dyalk f 2-3 iyam khdama.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">100% asli</h4>
              <p className="text-sm text-gray-500">Kol pair kaytverifa 9bel ma ykhrj mn 3andna.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <Star className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Qualite premium</h4>
              <p className="text-sm text-gray-500">Materyal mzyan w finition n9iya f kol modele.</p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
