import { useState, useEffect } from "react";
import { Layout } from "../components/layout";
import { ProductCard } from "../components/product-card";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

export default function Products() {
  const searchParams = new URLSearchParams(window.location.search);
  const initialCategory = searchParams.get("category") || "";

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: products, isLoading } = useListProducts({
    search: debouncedSearch || undefined,
    category: category || undefined,
  });

  const { data: categories } = useListCategories();

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setCategory("");
  };

  return (
    <Layout title="المتجر">
      <div className="flex flex-col md:flex-row gap-6 px-4 md:px-8 py-6 w-full">

        {/* Mobile Search & Filter Bar */}
        <div className="flex md:hidden gap-2">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="ابحث عن سنيكرز..."
              className="ps-9 bg-white border-gray-200 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 rounded-xl border-gray-200" aria-label="فتح الفلاتر">
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader className="mb-6">
                <SheetTitle>الفلاتر</SheetTitle>
              </SheetHeader>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-3">الأقسام</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setCategory("")}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === "" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    >
                      الكل
                    </button>
                    {categories?.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setCategory(cat.slug)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === cat.slug ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                      >
                        {getCategoryLabel(cat.name)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-24 space-y-8">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="ابحث عن منتج..."
                className="ps-9 bg-white border-gray-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="مسح البحث">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">الأقسام</h3>
                {category && (
                  <button onClick={() => setCategory("")} className="text-xs text-red-600 font-medium">مسح</button>
                )}
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => setCategory("")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${category === "" ? "bg-red-50 text-red-700" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <span>جميع المنتجات</span>
                </button>
                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.slug)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${category === cat.slug ? "bg-red-50 text-red-700" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    <span>{getCategoryLabel(cat.name)}</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{cat.productCount}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="hidden items-center justify-between mb-6 md:flex">
            <h2 className="text-2xl font-bold text-gray-900">
              {category ? getCategoryLabel(categories?.find(c => c.slug === category)?.name || "") : "جميع المنتجات"}
              <span className="text-gray-400 text-lg font-normal ms-2">
                ({products?.length || 0})
              </span>
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <Skeleton className="h-4 w-1/3 mt-2" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">ما لقيناش منتجات</h3>
              <p className="text-gray-500 max-w-sm mb-6">ما كاين حتى منتج يتناسب مع هذه الفلاتر.</p>
              <Button onClick={handleClearFilters} variant="outline" className="rounded-full">
                مسح الفلاتر
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
