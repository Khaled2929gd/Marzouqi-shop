import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { getGetProductQueryKey, useGetProduct } from "@workspace/api-client-react";
import { Layout } from "../components/layout";
import { useCart } from "../context/CartContext";
import { Star, Check, AlertCircle, ShoppingBag, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

function getLocalizedProductDescription(productName: string, fallback: string): string {
  const descriptions: Record<string, string> = {
    "Air Jordan 1 Retro High": "Model high-top iconique b cuir premium w confort mzyan kul nhar.",
    "Yeezy Boost 350 V2": "Upper knit khfif m3a cushioning Boost bach tkon merta7 tul nhar.",
    "Dunk Low Panda": "Colorway low-top classique, sahl tlebso m3a ay look dyal nhar.",
    "New Balance 550": "Style vintage inspire mn terrain, b confort li kaynfa3 l isti3mal yawmiy.",
    "Air Max 97 Silver Bullet": "Upper reflectif b layers m3a air unit kamla bach yban style.",
    "Converse Chuck 70 High": "Canvas classique high-top b cushioning ahsan w details retro.",
    "Gel-Kayano 30": "Chaussure stability l running, b foam n3im w transition smooth.",
    "Puma Suede Classic": "Icone streetwear b suede n3im w lignes retro nadfin.",
  };

  return descriptions[productName] || fallback;
}

export default function ProductDetail() {
  const [match, params] = useRoute("/products/:id");
  const id = match ? parseInt(params.id) : 0;
  const [, setLocation] = useLocation();
  
  const { data: product, isLoading, isError } = useGetProduct(id, {
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
        <div className="flex flex-col md:flex-row gap-8 px-4 md:px-8 py-6 w-full animate-pulse">
          <div className="w-full md:w-1/2 aspect-square bg-gray-200 rounded-3xl"></div>
          <div className="w-full md:w-1/2 space-y-6 pt-4">
            <div className="h-6 bg-gray-200 w-24 rounded"></div>
            <div className="h-10 bg-gray-200 w-3/4 rounded"></div>
            <div className="h-8 bg-gray-200 w-1/4 rounded"></div>
            <div className="space-y-2 pt-4">
              <div className="h-4 bg-gray-200 w-full rounded"></div>
              <div className="h-4 bg-gray-200 w-full rounded"></div>
              <div className="h-4 bg-gray-200 w-2/3 rounded"></div>
            </div>
            <div className="pt-6">
              <div className="h-6 bg-gray-200 w-32 rounded mb-4"></div>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-14 h-12 bg-gray-200 rounded-xl"></div>)}
              </div>
            </div>
            <div className="h-14 bg-gray-200 w-full rounded-full mt-8"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError || !product) {
    return (
      <Layout backButton>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Produit ma kaynch</h2>
          <p className="text-gray-500 mb-6">Yemken tms7 aw ma b9ach f stock.</p>
          <Button onClick={() => setLocation("/products")}>Rj3 lboutique</Button>
        </div>
      </Layout>
    );
  }

  const images = [product.imageUrl, ...product.images];
  const localizedDescription = getLocalizedProductDescription(product.name, product.description);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: "Khtar pointure 9bel",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    addItem({
      productId: product.id,
      productName: product.name,
      productImage: product.imageUrl,
      size: selectedSize,
      price: product.price,
      quantity: 1
    });

    setTimeout(() => {
      setIsAdding(false);
      toast({
        title: "Tzad l panier",
        description: `${product.name} (Pointure ${selectedSize})`,
      });
    }, 600);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast({
        title: "Khtar pointure 9bel",
        variant: "destructive",
      });
      return;
    }
    
    addItem({
      productId: product.id,
      productName: product.name,
      productImage: product.imageUrl,
      size: selectedSize,
      price: product.price,
      quantity: 1
    });
    
    setLocation("/cart");
  };

  return (
    <Layout backButton hideNav>
      <div className="flex flex-col md:flex-row gap-0 md:gap-12 w-full pb-24 md:pb-12 md:p-8">
        
        {/* Images */}
        <div className="w-full md:w-[55%] flex flex-col gap-4">
          <div className="relative aspect-square md:aspect-4/3 w-full bg-gray-50 md:rounded-3xl overflow-hidden flex items-center justify-center p-8">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImageIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                src={images[activeImageIndex]}
                alt={product.name}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                width={1200}
                height={900}
                className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
              />
            </AnimatePresence>
            
            {product.stock < 5 && product.stock > 0 && (
              <div className="absolute top-4 left-4 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full">
                Ba9i ghir {product.stock}!
              </div>
            )}
            {product.stock === 0 && (
              <div className="absolute top-4 left-4 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                Ma kaynch f stock
              </div>
            )}
          </div>
          
          {images.length > 1 && (
            <div className="flex gap-3 px-4 md:px-0 overflow-x-auto snap-x scrollbar-hide py-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  aria-label={`Afficher image ${i + 1} de ${product.name}`}
                  className={`relative shrink-0 snap-start w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gray-50 overflow-hidden border-2 transition-all ${activeImageIndex === i ? "border-red-600 ring-2 ring-red-600/20" : "border-transparent hover:border-gray-200"}`}
                >
                  <img src={img} className="w-full h-full object-contain p-2" alt={`Thumbnail ${i + 1}`} loading="lazy" decoding="async" width={192} height={192} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="w-full md:w-[45%] flex flex-col px-5 md:px-0 pt-6 md:pt-0">
          <div className="text-sm font-bold text-red-600 uppercase tracking-widest mb-2">
            {product.brand}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
              )}
            </div>
            
            <div className="w-px h-6 bg-gray-200"></div>
            
            <div className="flex items-center gap-1.5">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-gray-900">{product.rating.toFixed(1)}</span>
              <span className="text-gray-500 text-sm">({product.reviewCount} avis)</span>
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed mb-8">{localizedDescription}</p>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Khtar pointure</h3>
              <button className="text-sm text-gray-500 underline underline-offset-4 hover:text-gray-900">Guide des tailles</button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`
                    relative h-14 rounded-xl flex items-center justify-center text-lg font-medium transition-all
                    ${selectedSize === size 
                      ? "bg-red-600 text-white shadow-[0_4px_14px_rgba(220,38,38,0.3)] ring-2 ring-red-600 ring-offset-2" 
                      : "bg-gray-50 text-gray-900 border border-gray-100 hover:bg-gray-100 hover:border-gray-200"}
                  `}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-8 border border-gray-100">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-gray-900">Garantie d'authenticite</h4>
                <p className="text-xs text-gray-500 mt-1">Kol produit kaytverifa 9bel livraison.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons - Fixed to bottom on mobile */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t border-gray-100 md:relative md:bg-transparent md:border-0 md:p-0 z-40 flex gap-3">
            <Button 
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAdding}
              variant="outline"
              className="flex-1 h-14 rounded-full border-2 border-gray-200 hover:border-red-600 hover:bg-red-50 hover:text-red-700 text-gray-900 text-base font-bold transition-all"
            >
              {isAdding ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Check className="w-5 h-5 text-red-600" />
                </motion.div>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Zid l panier
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-1 h-14 rounded-full bg-gray-900 hover:bg-black text-white text-base font-bold shadow-lg"
            >
              Chri daba
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
