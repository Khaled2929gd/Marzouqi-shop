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
        <section className="px-4 py-6 md:px-8 md:py-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative w-full rounded-3xl overflow-hidden bg-linear-to-br from-red-600 to-gray-800 shadow-xl"
          >
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_38%),radial-gradient(circle_at_85%_0%,rgba(255,255,255,0.22),transparent_34%)]"></div>
            <div className="relative z-10 px-6 py-12 md:px-12 md:py-20 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center md:text-left">
                <span className="inline-block py-1 px-3 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md">
                  Collection jdida 2025
                </span>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight tracking-tight">
                  Dkhol b style <br className="hidden md:block"/> li kayban.
                </h2>
                <p className="text-red-100 text-sm md:text-base max-w-md mx-auto md:mx-0 mb-8">
                  Khtrna lik sneakers top, asliyin w b design li kayjib l3in.
                </p>
                <Link href="/products" className="inline-flex items-center justify-center bg-white text-red-900 font-bold px-8 py-3.5 rounded-full hover:bg-gray-50 active:scale-95 transition-all shadow-[0_4px_14px_rgba(0,0,0,0.2)]">
                  Chof lproduits
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
              <div className="flex-1 w-full flex justify-center md:justify-end">
                <img 
                  src="/images/shoe-1.png" 
                  alt="Featured Sneaker" 
                  width={900}
                  height={700}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="w-full max-w-[320px] md:max-w-112.5 drop-shadow-[0_20px_30px_rgba(0,0,0,0.4)] -rotate-12 hover:rotate-0 transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
          </motion.div>
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
