import { Layout } from "../../components/layout";
import {
  useListProducts,
  useDeleteProduct,
  getListProductsQueryKey,
} from "@workspace/api-client-react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatPrice } from "@/lib/utils";

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data: products, isLoading } = useListProducts();
  const deleteProduct = useDeleteProduct();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredProducts = products?.filter(
    (p) =>
      p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  const handleDelete = (id: number) => {
    deleteProduct.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Produit supprimé" });
          queryClient.invalidateQueries({
            queryKey: getListProductsQueryKey(),
          });
        },
        onError: () =>
          toast({ title: "Échec de la suppression", variant: "destructive" }),
      },
    );
  };

  const DeleteButton = ({ id, name }: { id: number; name: string }) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="w-8 h-8 rounded-lg border-rose-900/50 hover:bg-rose-900/30 hover:text-rose-400 text-rose-500"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-[#1c1916] border-[#2a2520]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[#f0e8e0]">
            Supprimer le produit
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[#9a8880]">
            Supprimer {name} ? Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-[#2a2520] text-[#f0e8e0] hover:bg-[#242018]">
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-rose-600 hover:bg-rose-700"
            onClick={() => handleDelete(id)}
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <Layout title="Produits">
      <div className="px-4 md:px-8 py-6 w-full max-w-6xl mx-auto pb-24 md:pb-12 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a5c56]" />
            <Input
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-[#1c1916] border-[#2a2520] text-[#f0e8e0] placeholder:text-[#6a5c56]"
            />
          </div>
          <Link href="/admin/products/new">
            <Button className="rounded-full bg-red-600 hover:bg-red-700 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </Link>
        </div>

        <div className="bg-[#1c1916] border border-[#2a2520] rounded-3xl overflow-hidden">
          {/* Mobile card list */}
          <div className="md:hidden divide-y divide-[#2a2520]">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 flex gap-3 items-center">
                  <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-8 w-16 rounded-lg" />
                </div>
              ))
            ) : filteredProducts?.length === 0 ? (
              <p className="p-8 text-center text-[#6a5c56] text-sm">
                Aucun produit trouvé.
              </p>
            ) : (
              filteredProducts?.map((product) => (
                <div key={product.id} className="p-4 flex gap-3 items-center">
                  <div className="w-14 h-14 bg-[#242018] rounded-xl p-1 border border-[#2a2520] shrink-0">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[#f0e8e0] text-sm truncate">
                      {product.name}
                    </div>
                    <div className="text-xs text-[#9a8880] uppercase tracking-wide">
                      {product.brand} · {product.category}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-semibold text-sm text-[#f0e8e0]">
                        {formatPrice(product.price)}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${product.stock > 10 ? "bg-emerald-900/40 text-emerald-300" : product.stock > 0 ? "bg-amber-900/40 text-amber-300" : "bg-rose-900/40 text-rose-300"}`}
                      >
                        {product.stock} en stock
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-8 h-8 rounded-lg border-[#2a2520] text-[#9a8880] hover:text-[#f0e8e0] hover:bg-[#242018]"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <DeleteButton id={product.id} name={product.name} />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2a2520] text-xs uppercase tracking-wider text-[#6a5c56] bg-[#181512]">
                  <th className="p-4 font-semibold w-16">Image</th>
                  <th className="p-4 font-semibold">Nom & Marque</th>
                  <th className="p-4 font-semibold">Prix</th>
                  <th className="p-4 font-semibold">Stock</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2520] text-sm">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="p-4">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-40 mb-2" />
                        <Skeleton className="h-3 w-20" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-16" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-12" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-8 w-16 ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : filteredProducts?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#6a5c56]">
                      Aucun produit trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredProducts?.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-[#242018] transition-colors group"
                    >
                      <td className="p-4">
                        <div className="w-12 h-12 bg-[#242018] rounded-xl p-1 border border-[#2a2520]">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-[#f0e8e0] mb-0.5">
                          {product.name}
                        </div>
                        <div className="text-xs text-[#9a8880] uppercase tracking-wider">
                          {product.brand} · {product.category}
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-[#f0e8e0]">
                        {formatPrice(product.price)}
                        {product.originalPrice &&
                          product.originalPrice > product.price && (
                            <span className="text-xs text-[#6a5c56] line-through block font-normal">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${product.stock > 10 ? "bg-emerald-900/40 text-emerald-300" : product.stock > 0 ? "bg-amber-900/40 text-amber-300" : "bg-rose-900/40 text-rose-300"}`}
                        >
                          {product.stock} en stock
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Button
                              variant="outline"
                              size="icon"
                              className="w-8 h-8 rounded-lg border-[#2a2520] text-[#9a8880] hover:text-[#f0e8e0] hover:bg-[#1c1916]"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <DeleteButton id={product.id} name={product.name} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
