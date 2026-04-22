import { Layout } from "../../components/layout";
import {
  getGetProductQueryKey,
  uploadProductImage,
  useCreateProduct,
  useGetProduct,
  useUpdateProduct,
  useListCategories,
} from "@workspace/api-client-react";
import { useRoute, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Loader2, ArrowLeft, Upload, Sparkles, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const productSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  brand: z.string().min(2, "Marque requise"),
  description: z.string().optional().default(""),
  price: z.coerce.number().min(0.01, "Prix doit être supérieur à 0"),
  originalPrice: z.coerce.number().optional().nullable(),
  imageUrl: z.string().url("URL invalide"),
  category: z.string().optional().default(""),
  sizes: z.string().min(1, "Pointures requises"),
  stock: z.coerce.number().min(0, "Stock ne peut pas être négatif"),
  featured: z.boolean().default(false)
});

export default function AdminProductForm() {
  const [match, params] = useRoute("/admin/products/:id/edit");
  const isEdit = !!match;
  const id = isEdit ? parseInt(params.id) : 0;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { data: categories } = useListCategories();
  const { data: product, isLoading: isLoadingProduct } = useGetProduct(id, {
    query: {
      enabled: isEdit && !!id,
      queryKey: getGetProductQueryKey(id),
    },
  });

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const isPending = createProduct.isPending || updateProduct.isPending;

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      brand: "",
      description: "",
      price: 0,
      originalPrice: null,
      imageUrl: "",
      category: "",
      sizes: "",
      stock: 0,
      featured: false
    }
  });

  // Update preview when imageUrl field changes manually
  const watchedImageUrl = form.watch("imageUrl");
  useEffect(() => {
    if (watchedImageUrl && (watchedImageUrl.startsWith("http") || watchedImageUrl.startsWith("/"))) {
      setPreviewUrl(watchedImageUrl);
    }
  }, [watchedImageUrl]);

  useEffect(() => {
    if (isEdit && product) {
      form.reset({
        name: product.name,
        brand: product.brand,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        imageUrl: product.imageUrl,
        category: product.category,
        sizes: product.sizes.join(", "),
        stock: product.stock,
        featured: product.featured
      });
      if (product.imageUrl) setPreviewUrl(product.imageUrl);
    }
  }, [isEdit, product, form]);

  const handleAutoFill = async () => {
    const name = form.getValues("name").trim();
    if (name.length < 2) {
      toast({ title: "Entrez d'abord le nom du produit", variant: "destructive" });
      return;
    }

    setIsAutoFilling(true);
    try {
      const prompt = `Tu es un expert en sneakers. Pour le produit "${name}", génère uniquement un objet JSON valide (sans texte avant ou après, sans markdown) avec ces clés exactes:
"brand" (la marque, ex: Nike),
"description" (2 phrases marketing en français),
"price" (prix USD suggéré, nombre),
"category" (une parmi: basketball, lifestyle, running, casual, football, training),
"sizes" (pointures européennes comma-separated, ex: "38, 39, 40, 41, 42, 43").`;

      const res = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          model: "mistral",
          seed: 42,
          jsonMode: true,
        }),
      });

      if (!res.ok) throw new Error("Réponse invalide");

      const raw = await res.text();
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(raw);
      } catch {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Format JSON invalide");
        data = JSON.parse(jsonMatch[0]);
      }

      if (data.brand) form.setValue("brand", String(data.brand), { shouldDirty: true, shouldValidate: true });
      if (data.description) form.setValue("description", String(data.description), { shouldDirty: true, shouldValidate: true });
      if (data.price && !form.getValues("price")) form.setValue("price", Number(data.price), { shouldDirty: true });
      if (data.category) form.setValue("category", String(data.category), { shouldDirty: true, shouldValidate: true });
      if (data.sizes) form.setValue("sizes", String(data.sizes), { shouldDirty: true });

      toast({ title: "Infos remplies automatiquement !", description: "Vérifiez et ajustez si nécessaire." });
    } catch {
      toast({ title: "Échec de l'auto-remplissage", description: "Réessayez dans un moment.", variant: "destructive" });
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show local preview immediately before upload completes
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    setIsUploadingImage(true);
    try {
      const uploadedUrl = await uploadProductImage(file);
      form.setValue("imageUrl", uploadedUrl, { shouldDirty: true, shouldValidate: true });
      setPreviewUrl(uploadedUrl);
      toast({ title: "Image uploadée", description: "URL remplie depuis Supabase Storage." });
    } catch (error) {
      setPreviewUrl(null);
      const message = error instanceof Error ? error.message : "Upload failed";
      toast({ title: "Échec de l'upload", description: message, variant: "destructive" });
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  };

  const onSubmit = (values: z.infer<typeof productSchema>) => {
    const sizes = values.sizes
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n));

    const payload = { ...values, sizes, images: [] };

    if (isEdit) {
      updateProduct.mutate(
        { id, data: payload },
        {
          onSuccess: () => {
            toast({ title: "Produit mis à jour" });
            setLocation("/admin/products");
          },
          onError: () => toast({ title: "Échec de la mise à jour", variant: "destructive" })
        }
      );
    } else {
      createProduct.mutate(
        { data: payload },
        {
          onSuccess: () => {
            toast({ title: "Produit créé avec succès" });
            setLocation("/admin/products");
          },
          onError: () => toast({ title: "Échec de la création", variant: "destructive" })
        }
      );
    }
  };

  if (isEdit && isLoadingProduct) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={isEdit ? "Modifier Produit" : "Nouveau Produit"}>
      <div className="px-4 md:px-8 py-8 w-full max-w-2xl mx-auto">

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            {/* Name + Auto-fill */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du produit</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="Air Jordan 1 High" className="flex-1" {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0 gap-1.5 text-purple-700 border-purple-200 hover:bg-purple-50"
                      onClick={handleAutoFill}
                      disabled={isAutoFilling}
                    >
                      {isAutoFilling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span className="hidden sm:inline text-sm">Auto-fill</span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Brand + Category */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marque</FormLabel>
                    <FormControl><Input placeholder="Nike" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-500">Catégorie <span className="text-xs font-normal">(optionnel)</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map(cat => (
                          <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Price + Original price + Stock */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix ($)</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="originalPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-500">Barré ($) <span className="text-xs font-normal">(opt.)</span></FormLabel>
                    <FormControl>
                      <Input
                        type="number" step="0.01" placeholder="—"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Sizes */}
            <FormField
              control={form.control}
              name="sizes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pointures (séparées par virgule)</FormLabel>
                  <FormControl>
                    <Input placeholder="38, 39, 40, 41, 42, 43" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image */}
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <div className="flex gap-3">
                    <div className="shrink-0 w-20 h-20 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
                      {previewUrl
                        ? <img src={previewUrl} alt="Aperçu" className="w-full h-full object-contain p-1" onError={() => setPreviewUrl(null)} />
                        : <ImageIcon className="w-6 h-6 text-gray-300" />
                      }
                    </div>
                    <div className="flex-1 space-y-2">
                      <FormControl>
                        <Input placeholder="https://… ou /images/shoe.png" {...field} />
                      </FormControl>
                      <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleImageUpload} />
                      <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => imageInputRef.current?.click()} disabled={isUploadingImage}>
                        {isUploadingImage ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 mr-1.5" />}
                        {isUploadingImage ? "Upload…" : "Uploader"}
                      </Button>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description — optional, collapsed */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-500">Description <span className="text-xs font-normal">(optionnel)</span></FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description du produit…" className="resize-none h-20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Featured */}
            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">Produit en vedette (page d'accueil)</FormLabel>
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setLocation("/admin/products")} className="rounded-full">
                Annuler
              </Button>
              <Button type="submit" disabled={isPending} className="rounded-full">
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEdit ? "Enregistrer" : "Créer"}
              </Button>
            </div>

          </form>
        </Form>
      </div>
    </Layout>
  );
}
