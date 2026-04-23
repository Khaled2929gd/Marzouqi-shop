import { Link, useLocation } from "wouter";
import { ShoppingBag, Home, LayoutGrid, ArrowLeft } from "lucide-react";
import { useCart } from "../context/CartContext";
import { ReactNode, useEffect } from "react";

export function Layout({
  children,
  hideNav = false,
  backButton = false,
  title,
}: {
  children: ReactNode;
  hideNav?: boolean;
  backButton?: boolean;
  title?: string;
}) {
  const [location] = useLocation();
  const { itemCount } = useCart();
  const isAdmin = location.startsWith("/admin");

  useEffect(() => {
    document.title = title
      ? `${title} | حميزات مرزوقي كلميم`
      : "حميزات مرزوقي كلميم - أحسن الجزم فالمنطقة";
  }, [title]);

  return (
    <div
      className="min-h-dvh flex flex-col bg-[#0d0b09] pb-16 md:pb-0"
      dir={isAdmin ? "ltr" : "rtl"}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-60 focus:rounded-md focus:bg-[#2a1210] focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#f0e8e0]"
      >
        {isAdmin ? "Skip to main content" : "انتقل إلى المحتوى الرئيسي"}
      </a>

      <header
        className="sticky top-0 z-50 flex-none border-b border-[#1e1a16] bg-[#0d0b09]/95 backdrop-blur-sm h-16 flex items-center justify-between px-4 md:px-8"
        role="banner"
      >
        <div className="flex items-center gap-3">
          {backButton ? (
            <button
              onClick={() => window.history.back()}
              aria-label={isAdmin ? "Back" : "رجوع"}
              className="p-2 -ms-2 rounded-full hover:bg-[#1c1916] active:scale-95 transition-transform text-[#f0e8e0]"
            >
              <ArrowLeft className={`w-5 h-5 ${!isAdmin ? "rtl-flip" : ""}`} />
            </button>
          ) : (
            <Link href="/" className="flex items-center leading-none group">
              <div className="flex flex-col gap-0 items-stretch" dir="ltr">
                <div className="flex items-baseline gap-2 whitespace-nowrap">
                  <span className="font-black italic text-[#ff616d] text-xl md:text-2xl tracking-tight leading-none">
                    Hmizat
                  </span>
                  <span className="font-semibold text-white text-xl md:text-2xl tracking-wide leading-none">
                    Marzouki
                  </span>
                </div>
                <div className="h-[2px] bg-[#ff616d] w-full mt-1 rounded-full" />
              </div>
            </Link>
          )}
          {title && (
            <h1 className="text-base font-semibold text-[#f0e8e0] truncate max-w-[200px] sm:max-w-xs">
              {title}
            </h1>
          )}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {!isAdmin && (
            <nav
              className="flex items-center gap-6 me-4"
              aria-label="التنقل الرئيسي"
            >
              <Link
                href="/"
                className={`text-sm font-medium transition-colors ${location === "/" ? "text-[#ff616d]" : "text-[#9a8880] hover:text-[#f0e8e0]"}`}
              >
                الرئيسية
              </Link>
              <Link
                href="/products"
                className={`text-sm font-medium transition-colors ${location === "/products" ? "text-[#ff616d]" : "text-[#9a8880] hover:text-[#f0e8e0]"}`}
              >
                المتجر
              </Link>
            </nav>
          )}
          <Link
            href="/cart"
            aria-label={`${isAdmin ? "Cart" : "السلة"}${itemCount > 0 ? `، ${itemCount}` : ""}`}
            className="relative p-2 rounded-full hover:bg-[#1c1916] active:scale-95 transition-transform text-[#f0e8e0]"
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span
                key={itemCount}
                className="animate-badge-scale absolute top-1 right-1 w-4 h-4 bg-[#ff616d] text-white text-[10px] font-bold flex items-center justify-center rounded-full"
              >
                {itemCount}
              </span>
            )}
          </Link>
        </div>

        <div className="flex md:hidden">
          <Link
            href="/cart"
            aria-label={`${isAdmin ? "Cart" : "السلة"}${itemCount > 0 ? `، ${itemCount}` : ""}`}
            className="relative p-2 -me-2 rounded-full hover:bg-[#1c1916] active:scale-95 transition-transform text-[#f0e8e0]"
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span
                key={itemCount}
                className="animate-badge-scale absolute top-1 right-1 w-4 h-4 bg-[#ff616d] text-white text-[10px] font-bold flex items-center justify-center rounded-full"
              >
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      <main
        id="main-content"
        className="flex-1 flex flex-col w-full mx-auto max-w-7xl"
        role="main"
      >
        {children}
      </main>

      {!hideNav && (
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0d0b09] border-t border-[#1e1a16] flex items-center justify-around px-4 z-50 pb-safe"
          aria-label={isAdmin ? "Mobile navigation" : "التنقل السفلي"}
        >
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 p-2 w-16 ${location === "/" ? "text-[#ff616d]" : "text-[#6a5a54] hover:text-[#f0e8e0]"}`}
          >
            <Home
              className="w-5 h-5"
              strokeWidth={location === "/" ? 2.5 : 1.5}
            />
            <span className="text-[10px] font-medium">
              {isAdmin ? "Home" : "الرئيسية"}
            </span>
          </Link>
          <Link
            href="/products"
            className={`flex flex-col items-center gap-1 p-2 w-16 ${location === "/products" ? "text-[#ff616d]" : "text-[#6a5a54] hover:text-[#f0e8e0]"}`}
          >
            <LayoutGrid
              className="w-5 h-5"
              strokeWidth={location === "/products" ? 2.5 : 1.5}
            />
            <span className="text-[10px] font-medium">
              {isAdmin ? "Store" : "المتجر"}
            </span>
          </Link>
          <Link
            href="/cart"
            className={`flex flex-col items-center gap-1 p-2 w-16 relative ${location === "/cart" ? "text-[#ff616d]" : "text-[#6a5a54] hover:text-[#f0e8e0]"}`}
          >
            <div className="relative">
              <ShoppingBag
                className="w-5 h-5"
                strokeWidth={location === "/cart" ? 2.5 : 1.5}
              />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-[#ff616d] text-white text-[8px] font-bold flex items-center justify-center rounded-full border border-[#0d0b09]">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">
              {isAdmin ? "Cart" : "السلة"}
            </span>
          </Link>
        </nav>
      )}
    </div>
  );
}
