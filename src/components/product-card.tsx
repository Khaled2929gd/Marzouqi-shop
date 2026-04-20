import { Link } from "wouter";
import { Star } from "lucide-react";
import { Product } from "@workspace/api-client-react";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group"
    >
      <Link href={`/products/${product.id}`} className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-red-100 transition-all duration-300">
        <div className="relative aspect-square w-full bg-gray-50 overflow-hidden p-6">
          {product.featured && (
            <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider z-10">
              Top
            </div>
          )}
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="absolute top-3 right-3 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
              PROMO
            </div>
          )}
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            loading="lazy"
            decoding="async"
            width={640}
            height={640}
            className="w-full h-full object-contain object-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)] group-hover:scale-105 group-hover:-translate-y-2 transition-transform duration-500" 
          />
        </div>
        <div className="p-4 flex flex-col flex-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{product.brand}</div>
          <h3 className="font-bold text-gray-900 leading-tight mb-2 line-clamp-2">{product.name}</h3>
          
          <div className="mt-auto">
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-gray-700">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({product.reviewCount})</span>
            </div>
            
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
                )}
                <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
