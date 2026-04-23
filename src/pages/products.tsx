import { useState, useEffect } from "react";
import { Layout } from "../components/layout";
import { ProductCard } from "../components/product-card";
import {
  useListProducts,
  useListCategories,
} from "@workspace/api-client-react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
      <div className="flex flex-col md:flex-row gap-8 px-4 md:px-8 py-8 w-full">
        {/* Mobile search + filter */}
        <div className="flex md:hidden gap-2">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a5c56]" />
            <Input
              placeholder="ابحث عن سنيكرز..."
              className="ps-9 bg-[#1c1916] border-transparent rounded-full text-[#f0e8e0] placeholder:text-[#6a5c56]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 rounded-full border-[#2a2520] bg-[#1c1916] text-[#f0e8e0] hover:bg-[#242018]"
                aria-label="فتح الفلاتر"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-[#0d0b09] border-[#2a2520]"
            >
              <SheetHeader className="mb-6">
                <SheetTitle className="text-[#f0e8e0]">الفلاتر</SheetTitle>
              </SheetHeader>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-sm text-[#f0e8e0] mb-3">
                    الأقسام
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setCategory("")}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === "" ? "bg-[#ff616d] text-white" : "bg-[#1c1916] text-[#c4b5ac] hover:bg-[#242018] hover:text-[#ff616d]"}`}
                    >
                      الكل
                    </button>
                    {categories?.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setCategory(cat.slug)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === cat.slug ? "bg-[#ff616d] text-white" : "bg-[#1c1916] text-[#c4b5ac] hover:bg-[#242018] hover:text-[#ff616d]"}`}
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

        {/* Desktop sidebar */}
        <aside className="hidden md:block w-48 shrink-0">
          <div className="sticky top-20 space-y-8">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a5c56]" />
              <Input
                placeholder="ابحث..."
                className="ps-9 bg-[#1c1916] border-transparent rounded-full text-[#f0e8e0] placeholder:text-[#6a5c56]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-[#6a5c56] hover:text-[#ff616d]"
                  aria-label="مسح البحث"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-[#6a5c56] uppercase tracking-widest">
                  الأقسام
                </h3>
                {category && (
                  <button
                    onClick={() => setCategory("")}
                    className="text-xs text-[#6a5c56] hover:text-[#ff616d]"
                  >
                    مسح
                  </button>
                )}
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setCategory("")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${category === "" ? "font-semibold text-[#f0e8e0] bg-[#242018]" : "text-[#9a8880] hover:text-[#f0e8e0] hover:bg-[#1c1916]"}`}
                >
                  <span>جميع المنتجات</span>
                </button>
                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.slug)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${category === cat.slug ? "font-semibold text-[#f0e8e0] bg-[#242018]" : "text-[#9a8880] hover:text-[#f0e8e0] hover:bg-[#1c1916]"}`}
                  >
                    <span>{getCategoryLabel(cat.name)}</span>
                    <span className="text-xs text-[#6a5c56]">
                      {cat.productCount}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          <div className="hidden items-center justify-between mb-8 md:flex">
            <h2 className="text-xl font-black text-[#f0e8e0]">
              {category
                ? getCategoryLabel(
                    categories?.find((c) => c.slug === category)?.name || "",
                  )
                : "جميع المنتجات"}
              <span className="text-[#6a5c56] text-base font-normal ms-2">
                ({products?.length || 0})
              </span>
            </h2>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="h-3 w-1/3 mt-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/4" />
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
              <div className="w-14 h-14 bg-[#1c1916] rounded-full flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-[#ff616d]" />
              </div>
              <h3 className="text-base font-bold text-[#f0e8e0] mb-2">
                ما لقيناش منتجات
              </h3>
              <p className="text-sm text-[#9a8880] max-w-sm mb-6">
                ما كاين حتى منتج يتناسب مع هذه الفلاتر.
              </p>
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="rounded-full border-[#2a2520] text-[#f0e8e0] hover:bg-[#1c1916]"
              >
                مسح الفلاتر
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
