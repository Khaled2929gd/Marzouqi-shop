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
  description: z.string().min(10, "Description requise"),
  price: z.coerce.number().min(0.01, "Prix doit être supérieur à 0"),
  originalPrice: z.coerce.number().optional().nullable(),
  imageUrl: z.string().url("URL invalide"),
  category: z.string().min(1, "Catégorie requise"),
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
      <div className="px-4 md:px-8 py-6 w-full max-w-3xl mx-auto pb-24 md:pb-12">
        <Button
          variant="ghost"
          className="mb-6 -ml-4 hover:bg-transparent hover:text-red-600"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <div className="bg-white border border-gray-100 p-5 md:p-8 rounded-3xl shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Product name + AI auto-fill */}
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
                        className="shrink-0 rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 gap-1.5"
                        onClick={handleAutoFill}
                        disabled={isAutoFilling}
                        title="Remplir automatiquement avec l'IA (français)"
                      >
                        {isAutoFilling
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Sparkles className="w-4 h-4" />
                        }
                        <span className="hidden sm:inline text-sm font-medium">
                          {isAutoFilling ? "En cours…" : "Auto-fill"}
                        </span>
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marque</FormLabel>
                      <FormControl>
                        <Input placeholder="Nike" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
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

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Description du produit en français…" className="resize-none h-24" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="originalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix barré ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Optionnel"
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
                    <FormItem className="col-span-2 sm:col-span-1">
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

              {/* Image upload with preview */}
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image du produit</FormLabel>
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Preview box */}
                      <div className="shrink-0 w-full sm:w-32 h-32 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Aperçu"
                            className="w-full h-full object-contain p-2"
                            onError={() => setPreviewUrl(null)}
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <FormControl>
                          <Input placeholder="https://… ou /images/shoe.png" {...field} />
                        </FormControl>
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-full w-full sm:w-auto"
                          onClick={() => imageInputRef.current?.click()}
                          disabled={isUploadingImage}
                        >
                          {isUploadingImage
                            ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            : <Upload className="w-4 h-4 mr-2" />
                          }
                          {isUploadingImage ? "Upload en cours…" : "Uploader une image"}
                        </Button>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-gray-100 p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Produit en vedette</FormLabel>
                      <p className="text-sm text-gray-500">
                        Ce produit apparaîtra dans la section tendances de la page d'accueil.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/admin/products")}
                  className="rounded-full"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="rounded-full bg-red-600 hover:bg-red-700"
                >
                  {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isEdit ? "Enregistrer" : "Créer le produit"}
                </Button>
              </div>

            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
}
