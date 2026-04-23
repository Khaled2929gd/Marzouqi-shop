import { Link } from "wouter";
import { Product } from "@workspace/api-client-react";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <div
      className="group animate-card-fade-in"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <Link href={`/products/${product.id}`} className="flex flex-col">
        <div className="relative aspect-square w-full bg-[#1c1916] rounded-xl overflow-hidden p-4">
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="absolute top-2.5 start-2.5 bg-[#ff616d] text-white text-[10px] font-bold px-2 py-1 rounded-md z-10">
              PROMO
            </div>
          )}
          <img
            src={product.imageUrl}
            alt={product.name}
            loading={index < 4 ? "eager" : "lazy"}
            decoding="async"
            width={640}
            height={640}
            className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="pt-3 px-1">
          <p className="text-xs text-[#ff616d] font-medium mb-1">
            {product.brand}
          </p>
          <h3 className="text-sm font-semibold text-[#f0e8e0] leading-snug line-clamp-1 mb-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#f0e8e0]">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-[#6a5c56] line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
