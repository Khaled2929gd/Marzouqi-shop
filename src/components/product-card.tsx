import { Link } from "wouter";
import { Product } from "@workspace/api-client-react";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="group"
    >
      <Link href={`/products/${product.id}`} className="flex flex-col">
        <div className="relative aspect-square w-full bg-[#f5f5f5] rounded-xl overflow-hidden p-5">
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="absolute top-2.5 start-2.5 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-md z-10">
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
            className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="pt-3 px-0.5">
          <p className="text-xs text-gray-400 font-medium mb-1">{product.brand}</p>
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-1 mb-2">{product.name}</h3>
          <div className="flex items-center gap-2" dir="ltr">
            <span className="font-bold text-gray-900">${product.price.toFixed(2)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
