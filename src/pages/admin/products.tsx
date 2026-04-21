import { Layout } from "../../components/layout";
import { useListProducts, useDeleteProduct, getListProductsQueryKey } from "@workspace/api-client-react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
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

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const { data: products, isLoading } = useListProducts();
  const deleteProduct = useDeleteProduct();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const filteredProducts = products?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: number) => {
    deleteProduct.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Produit supprimé" });
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        },
        onError: () => {
          toast({ title: "Échec de la suppression", variant: "destructive" });
        }
      }
    );
  };

  const DeleteButton = ({ id, name }: { id: number; name: string }) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon" className="w-8 h-8 rounded-lg border-rose-200 hover:bg-rose-50 hover:text-rose-600 text-rose-500">
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le produit</AlertDialogTitle>
          <AlertDialogDescription>
            Supprimer {name} ? Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-gray-200"
            />
          </div>
          <Link href="/admin/products/new">
            <Button className="rounded-full bg-red-600 hover:bg-red-700 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </Link>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)]">

          {/* Mobile card list */}
          <div className="md:hidden divide-y divide-gray-100">
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
              <p className="p-8 text-center text-gray-500 text-sm">Aucun produit trouvé.</p>
            ) : (
              filteredProducts?.map((product) => (
                <div key={product.id} className="p-4 flex gap-3 items-center">
                  <div className="w-14 h-14 bg-gray-50 rounded-xl p-1 border border-gray-100 shrink-0">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-sm truncate">{product.name}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">{product.brand} · {product.category}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-semibold text-sm text-gray-900">${product.price.toFixed(2)}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${product.stock > 10 ? "bg-emerald-50 text-emerald-700" : product.stock > 0 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}>
                        {product.stock} en stock
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Button variant="outline" size="icon" className="w-8 h-8 rounded-lg">
                        <Edit className="w-4 h-4 text-gray-600" />
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
                <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 bg-gray-50/50">
                  <th className="p-4 font-semibold w-16">Image</th>
                  <th className="p-4 font-semibold">Nom & Marque</th>
                  <th className="p-4 font-semibold">Prix</th>
                  <th className="p-4 font-semibold">Stock</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="p-4"><Skeleton className="h-12 w-12 rounded-xl" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-40 mb-2" /><Skeleton className="h-3 w-20" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-12" /></td>
                      <td className="p-4"><Skeleton className="h-8 w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredProducts?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">Aucun produit trouvé.</td>
                  </tr>
                ) : (
                  filteredProducts?.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="p-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl p-1 border border-gray-100">
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900 mb-0.5">{product.name}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">{product.brand} · {product.category}</div>
                      </td>
                      <td className="p-4 font-semibold text-gray-900">
                        ${product.price.toFixed(2)}
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-xs text-gray-400 line-through block font-normal">${product.originalPrice.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${product.stock > 10 ? "bg-emerald-50 text-emerald-700" : product.stock > 0 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}>
                          {product.stock} en stock
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Button variant="outline" size="icon" className="w-8 h-8 rounded-lg">
                              <Edit className="w-4 h-4 text-gray-600" />
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
