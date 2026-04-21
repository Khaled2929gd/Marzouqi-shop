import { Link, useLocation } from "wouter";
import { ShoppingBag, Home, LayoutGrid, ArrowLeft } from "lucide-react";
import { useCart } from "../context/CartContext";
import { ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Layout({ children, hideNav = false, backButton = false, title }: { children: ReactNode; hideNav?: boolean; backButton?: boolean; title?: string }) {
  const [location] = useLocation();
  const { itemCount } = useCart();
  const isAdmin = location.startsWith("/admin");

  useEffect(() => {
    document.title = title ? `${title} | مرزوقي` : "مرزوقي - متجر الأحذية";
  }, [title]);

  return (
    <div className="min-h-dvh flex flex-col bg-white pb-16 md:pb-0" dir={isAdmin ? "ltr" : undefined}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-60 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-gray-900"
      >
        {isAdmin ? "Skip to main content" : "انتقل إلى المحتوى الرئيسي"}
      </a>

      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 flex-none h-14 md:h-16 flex items-center justify-between px-4 md:px-8" role="banner">
        <div className="flex items-center gap-3">
          {backButton ? (
            <button
              onClick={() => window.history.back()}
              aria-label={isAdmin ? "Back" : "رجوع"}
              className="p-2 -ms-2 rounded-full hover:bg-gray-50 active:scale-95 transition-transform text-gray-900"
            >
              <ArrowLeft className={`w-5 h-5 ${!isAdmin ? "rtl-flip" : ""}`} />
            </button>
          ) : (
            <Link href="/" className="font-sans text-gray-900 leading-none">
              <span className="block text-xl md:text-2xl font-black tracking-tight">Marzouki</span>
            </Link>
          )}
          {title && <h1 className="text-base font-semibold text-gray-900">{title}</h1>}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {!isAdmin && (
            <nav className="flex items-center gap-6 me-4" aria-label="التنقل الرئيسي">
              <Link href="/" className={`text-sm font-medium transition-colors ${location === "/" ? "text-gray-900" : "text-gray-400 hover:text-gray-900"}`}>الرئيسية</Link>
              <Link href="/products" className={`text-sm font-medium transition-colors ${location === "/products" ? "text-gray-900" : "text-gray-400 hover:text-gray-900"}`}>المتجر</Link>
            </nav>
          )}

          <Link
            href="/cart"
            aria-label={`${isAdmin ? "Cart" : "السلة"}${itemCount > 0 ? `، ${itemCount} ${isAdmin ? "items" : "منتجات"}` : ""}`}
            className="relative p-2 rounded-full hover:bg-gray-50 active:scale-95 transition-transform text-gray-900"
          >
            <ShoppingBag className="w-5 h-5" />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-1 right-1 w-4 h-4 bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center rounded-full"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Mobile top nav cart */}
        <div className="flex md:hidden">
          <Link
            href="/cart"
            aria-label={`${isAdmin ? "Cart" : "السلة"}${itemCount > 0 ? `، ${itemCount}` : ""}`}
            className="relative p-2 -me-2 rounded-full hover:bg-gray-50 active:scale-95 transition-transform text-gray-900"
          >
            <ShoppingBag className="w-5 h-5" />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-1 right-1 w-4 h-4 bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center rounded-full"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1 flex flex-col w-full mx-auto max-w-7xl" role="main">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      {!hideNav && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around px-4 z-50 pb-safe" aria-label={isAdmin ? "Mobile navigation" : "التنقل السفلي"}>
          <Link href="/" className={`flex flex-col items-center gap-1 p-2 w-16 ${location === "/" ? "text-gray-900" : "text-gray-300 hover:text-gray-900"}`}>
            <Home className="w-5 h-5" strokeWidth={location === "/" ? 2.5 : 1.5} />
            <span className="text-[10px] font-medium">{isAdmin ? "Home" : "الرئيسية"}</span>
          </Link>
          <Link href="/products" className={`flex flex-col items-center gap-1 p-2 w-16 ${location === "/products" ? "text-gray-900" : "text-gray-300 hover:text-gray-900"}`}>
            <LayoutGrid className="w-5 h-5" strokeWidth={location === "/products" ? 2.5 : 1.5} />
            <span className="text-[10px] font-medium">{isAdmin ? "Store" : "المتجر"}</span>
          </Link>
          <Link href="/cart" className={`flex flex-col items-center gap-1 p-2 w-16 relative ${location === "/cart" ? "text-gray-900" : "text-gray-300 hover:text-gray-900"}`}>
            <div className="relative">
              <ShoppingBag className="w-5 h-5" strokeWidth={location === "/cart" ? 2.5 : 1.5} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-gray-900 text-white text-[8px] font-bold flex items-center justify-center rounded-full border border-white">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{isAdmin ? "Cart" : "السلة"}</span>
          </Link>
        </nav>
      )}
    </div>
  );
}
