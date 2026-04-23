import { Layout } from "../../components/layout";
import {
  getGetProductQueryKey,
  uploadProductImage,
  useCreateProduct,
  useGetProduct,
  useUpdateProduct,
  useListCategories,
  type Category,
} from "@workspace/api-client-react";
import { useRoute, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  Loader2,
  ArrowLeft,
  Upload,
  Sparkles,
  ImageIcon,
  Check,
  ChevronsUpDown,
  Plus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Slugify helper — matches the SQL view logic
const slugify = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

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
  featured: z.boolean().default(false),
});

// ── Category combobox ──────────────────────────────────────────────────────
// categories is a SQL VIEW — we can't insert into it.
// Instead: let admin pick existing OR type a new slug that will be set
// directly on the product. The new category auto-appears in the view after save.
function CategoryCombobox({
  value,
  onChange,
  categories,
}: {
  value: string;
  onChange: (v: string) => void;
  categories: Category[] | undefined;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Find selected category by slug or by raw value
  const selected = categories?.find(
    (c) => c.slug === value || c.name === value,
  );
  const displayLabel = selected ? selected.name : value || null;

  const filtered = query.trim()
    ? (categories ?? []).filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.slug.toLowerCase().includes(query.toLowerCase()),
      )
    : (categories ?? []);

  const exactMatch = (categories ?? []).some(
    (c) =>
      c.name.toLowerCase() === query.trim().toLowerCase() ||
      c.slug.toLowerCase() === query.trim().toLowerCase(),
  );

  const handleUseNew = () => {
    const slug = slugify(query.trim());
    if (!slug) return;
    onChange(slug);
    setQuery("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal border-[#2a2520] bg-[#242018] text-[#f0e8e0] hover:bg-[#2a2520]"
        >
          <span className={cn(!displayLabel && "text-[#6a5c56]")}>
            {displayLabel ?? "Sélectionner ou créer…"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 bg-[#1c1916] border-[#2a2520]"
        align="start"
      >
        <Command shouldFilter={false} className="bg-[#1c1916]">
          <CommandInput
            placeholder="Rechercher ou taper une nouvelle catégorie…"
            value={query}
            onValueChange={setQuery}
            className="text-[#f0e8e0]"
          />
          <CommandList>
            {(categories ?? []).length === 0 && !query.trim() && (
              <CommandEmpty className="text-[#9a8880]">
                Tapez un nom pour créer une nouvelle catégorie.
              </CommandEmpty>
            )}
            {filtered.length > 0 && (
              <CommandGroup heading="Catégories existantes">
                {filtered.map((cat) => (
                  <CommandItem
                    key={cat.id}
                    value={cat.slug}
                    onSelect={() => {
                      onChange(cat.slug === value ? "" : cat.slug);
                      setQuery("");
                      setOpen(false);
                    }}
                    className="text-[#f0e8e0] data-[selected=true]:bg-[#2a2520]"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        value === cat.slug || value === cat.name
                          ? "opacity-100 text-[#ff616d]"
                          : "opacity-0",
                      )}
                    />
                    <span className="flex-1">{cat.name}</span>
                    <span className="ml-2 text-xs text-[#6a5c56]">
                      {cat.slug}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {filtered.length === 0 && query.trim() && (
              <CommandEmpty className="text-[#9a8880]">
                Sera créée automatiquement lors de l&apos;enregistrement.
              </CommandEmpty>
            )}
            {query.trim() && !exactMatch && (
              <>
                <CommandSeparator className="bg-[#2a2520]" />
                <CommandGroup>
                  <CommandItem
                    value={`__new__${query}`}
                    onSelect={handleUseNew}
                    className="text-emerald-400 data-[selected=true]:bg-[#1a2a20] data-[selected=true]:text-emerald-300"
                  >
                    <Plus className="mr-2 h-4 w-4 shrink-0" />
                    Utiliser &ldquo;{slugify(query)}&rdquo; comme nouvelle
                    catégorie
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

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
    query: { enabled: isEdit && !!id, queryKey: getGetProductQueryKey(id) },
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
      sizes: "38, 39, 40, 41, 42, 43",
      stock: 100,
      featured: false,
    },
  });

  const watchedImageUrl = form.watch("imageUrl");
  useEffect(() => {
    if (
      watchedImageUrl &&
      (watchedImageUrl.startsWith("http") || watchedImageUrl.startsWith("/"))
    ) {
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
        featured: product.featured,
      });
      if (product.imageUrl) setPreviewUrl(product.imageUrl);
    }
  }, [isEdit, product, form]);

  const handleAutoFill = async () => {
    const name = form.getValues("name").trim();
    if (name.length < 2) {
      toast({
        title: "Entrez d'abord le nom du produit",
        variant: "destructive",
      });
      return;
    }
    setIsAutoFilling(true);
    const prompt = `Tu es un expert en sneakers. Pour le produit "${name}", génère un JSON avec exactement ces clés: brand (string), description (string, 1-2 phrases en français), price (number, prix réaliste en MAD), sizes (string, ex: "39, 40, 41, 42, 43"), category (string, une parmi: running/basketball/lifestyle/casual/football/training). Réponds UNIQUEMENT avec le JSON, sans markdown.`;
    try {
      const res = await fetch("https://api.a0.dev/ai/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          model: "gpt-4o-mini",
          seed: 42,
          jsonMode: true,
        }),
      });
      const raw = await res.text();
      let data: Record<string, unknown> = {};
      try {
        const m = raw.match(/\{[\s\S]*\}/);
        data = JSON.parse(m ? m[0] : raw);
      } catch {
        data = {};
      }
      const opts = { shouldDirty: true, shouldValidate: true };
      if (data.brand) form.setValue("brand", String(data.brand), opts);
      if (data.description)
        form.setValue("description", String(data.description), opts);
      if (data.price)
        form.setValue("price", Number(data.price), { shouldDirty: true });
      if (data.sizes)
        form.setValue("sizes", String(data.sizes), {
          shouldDirty: true,
          shouldValidate: true,
        });
      if (data.category) form.setValue("category", String(data.category), opts);
      toast({
        title: "Rempli avec succès !",
        description: "Vérifiez et ajustez si nécessaire.",
      });
    } catch {
      toast({ title: "Erreur lors de l'auto-fill", variant: "destructive" });
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setIsUploadingImage(true);
    try {
      const uploadedUrl = await uploadProductImage(file);
      form.setValue("imageUrl", uploadedUrl, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setPreviewUrl(uploadedUrl);
      toast({ title: "Image uploadée" });
    } catch (error) {
      setPreviewUrl(null);
      toast({
        title: "Échec de l'upload",
        description: error instanceof Error ? error.message : "Erreur",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const onSubmit = (values: z.infer<typeof productSchema>) => {
    const sizes = values.sizes
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && n > 0);
    const payload = { ...values, sizes, images: [] };
    if (isEdit) {
      updateProduct.mutate(
        { id, data: payload },
        {
          onSuccess: () => {
            toast({ title: "Produit mis à jour" });
            setLocation("/admin/products");
          },
          onError: () =>
            toast({ title: "Échec de la mise à jour", variant: "destructive" }),
        },
      );
    } else {
      createProduct.mutate(
        { data: payload },
        {
          onSuccess: () => {
            toast({ title: "Produit créé avec succès" });
            setLocation("/admin/products");
          },
          onError: () =>
            toast({ title: "Échec de la création", variant: "destructive" }),
        },
      );
    }
  };

  if (isEdit && isLoadingProduct) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={isEdit ? "Modifier Produit" : "Nouveau Produit"}>
      <div className="px-4 md:px-8 py-6 w-full max-w-3xl mx-auto pb-24 md:pb-12">
        <Button
          variant="ghost"
          className="mb-6 -ml-4 text-[#9a8880] hover:text-[#f0e8e0] hover:bg-[#1c1916]"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour
        </Button>

        <div className="bg-[#1c1916] border border-[#2a2520] p-5 md:p-8 rounded-3xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name + Auto-fill */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#9a8880]">
                      Nom du produit
                    </FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="Air Jordan 1 High"
                          className="flex-1 bg-[#242018] border-[#2a2520] text-[#f0e8e0] placeholder:text-[#6a5c56]"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        className="shrink-0 rounded-xl border-purple-800/50 bg-purple-900/20 text-purple-300 hover:bg-purple-900/40 gap-1.5"
                        onClick={handleAutoFill}
                        disabled={isAutoFilling}
                      >
                        {isAutoFilling ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
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
                      <FormLabel className="text-[#9a8880]">Marque</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nike"
                          className="bg-[#242018] border-[#2a2520] text-[#f0e8e0] placeholder:text-[#6a5c56]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-[#9a8880]">
                        Catégorie{" "}
                        <span className="text-xs font-normal text-[#6a5c56]">
                          (optionnel)
                        </span>
                      </FormLabel>
                      <CategoryCombobox
                        value={field.value}
                        onChange={field.onChange}
                        categories={categories}
                      />
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
                    <FormLabel className="text-[#9a8880]">
                      Description{" "}
                      <span className="text-xs font-normal text-[#6a5c56]">
                        (optionnel)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Description du produit…"
                        className="resize-none h-24 bg-[#242018] border-[#2a2520] text-[#f0e8e0] placeholder:text-[#6a5c56]"
                        {...field}
                      />
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
                      <FormLabel className="text-[#9a8880]">
                        Prix (د.م)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          className="bg-[#242018] border-[#2a2520] text-[#f0e8e0]"
                          {...field}
                        />
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
                      <FormLabel className="text-[#9a8880]">
                        Prix barré{" "}
                        <span className="text-xs font-normal text-[#6a5c56]">
                          (opt.)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="—"
                          className="bg-[#242018] border-[#2a2520] text-[#f0e8e0] placeholder:text-[#6a5c56]"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : null,
                            )
                          }
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
                      <FormLabel className="text-[#9a8880]">Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          className="bg-[#242018] border-[#2a2520] text-[#f0e8e0]"
                          {...field}
                        />
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
                    <FormLabel className="text-[#9a8880]">
                      Pointures (séparées par virgule)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="38, 39, 40, 41, 42, 43"
                        className="bg-[#242018] border-[#2a2520] text-[#f0e8e0] placeholder:text-[#6a5c56]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image upload */}
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#9a8880]">
                      Image du produit
                    </FormLabel>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="shrink-0 w-full sm:w-32 h-32 rounded-2xl border-2 border-dashed border-[#2a2520] bg-[#181512] flex items-center justify-center overflow-hidden">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Aperçu"
                            className="w-full h-full object-contain p-2"
                            onError={() => setPreviewUrl(null)}
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-[#6a5c56]" />
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <FormControl>
                          <Input
                            placeholder="https://… ou /images/shoe.png"
                            className="bg-[#242018] border-[#2a2520] text-[#f0e8e0] placeholder:text-[#6a5c56]"
                            {...field}
                          />
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
                          className="rounded-full w-full sm:w-auto border-[#2a2520] text-[#f0e8e0] hover:bg-[#242018]"
                          onClick={() => imageInputRef.current?.click()}
                          disabled={isUploadingImage}
                        >
                          {isUploadingImage ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-2" />
                          )}
                          {isUploadingImage
                            ? "Upload en cours…"
                            : "Uploader une image"}
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
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-[#2a2520] bg-[#181512] p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-[#f0e8e0]">
                        Produit en vedette
                      </FormLabel>
                      <p className="text-sm text-[#9a8880]">
                        Apparaît dans la section tendances de la page
                        d&apos;accueil.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-[#2a2520]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/admin/products")}
                  className="rounded-full border-[#2a2520] text-[#f0e8e0] hover:bg-[#242018]"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="rounded-full bg-red-600 hover:bg-red-700"
                >
                  {isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
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
