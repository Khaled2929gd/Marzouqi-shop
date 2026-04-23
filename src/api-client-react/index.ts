import {
  useMutation,
  useQuery,
  type QueryKey,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  SUPABASE_PRODUCT_IMAGES_BUCKET,
  ensureAdminSession,
  ensureSupabaseConfigured,
  supabase,
} from "@/lib/supabase";
import {
  OrderStatus,
  ListOrdersStatus,
  UpdateOrderStatusBodyStatus,
} from "./generated/api.schemas";
import type {
  Category,
  CreateOrderBody,
  CreateProductBody,
  DashboardStats,
  HealthStatus,
  ListOrdersParams,
  ListProductsParams,
  Order,
  OrderItem,
  Product,
  UpdateOrderStatusBody,
} from "./generated/api.schemas";

export { OrderStatus, ListOrdersStatus, UpdateOrderStatusBodyStatus };
export type {
  Category,
  CreateOrderBody,
  CreateProductBody,
  DashboardStats,
  HealthStatus,
  ListOrdersParams,
  ListProductsParams,
  Order,
  OrderItem,
  Product,
  UpdateOrderStatusBody,
};

export type ErrorType<T = unknown> = Error & { data?: T };
export type BodyType<T> = T;
export type AuthTokenGetter = () => Promise<string | null> | string | null;

type QueryHookOptions<TData> = {
  query?: Omit<
    UseQueryOptions<TData, Error, TData, QueryKey>,
    "queryKey" | "queryFn"
  > & {
    queryKey?: QueryKey;
  };
};

type MutationHookOptions<TData, TVariables, TContext = unknown> = {
  mutation?: Omit<
    UseMutationOptions<TData, Error, TVariables, TContext>,
    "mutationFn" | "mutationKey"
  >;
};

type ProductRow = {
  id: number;
  name: string;
  brand: string;
  description: string;
  price: number | string;
  original_price: number | string | null;
  image_url: string;
  images: unknown;
  category: string;
  sizes: unknown;
  rating: number | string;
  review_count: number;
  stock: number;
  featured: boolean;
  created_at: string;
};

type OrderRow = {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  address: string;
  city: string;
  status: string;
  items: unknown;
  subtotal: number | string;
  delivery: number | string;
  discount: number | string;
  total: number | string;
  created_at: string;
  updated_at: string;
};

type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  product_count: number;
};

type OrderProductRow = {
  id: number;
  name: string;
  image_url: string;
  price: number | string;
};

function toNumber(
  value: number | string | null | undefined,
  fallback = 0,
): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item));
}

function toNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item));
}

function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    description: row.description,
    price: toNumber(row.price),
    originalPrice:
      row.original_price === null || row.original_price === undefined
        ? null
        : toNumber(row.original_price),
    imageUrl: row.image_url,
    images: toStringArray(row.images),
    category: row.category,
    sizes: toNumberArray(row.sizes),
    rating: toNumber(row.rating, 4.5),
    reviewCount: toNumber(row.review_count, 0),
    stock: toNumber(row.stock, 0),
    featured: Boolean(row.featured),
    createdAt: row.created_at,
  };
}

function mapOrderItem(value: unknown): OrderItem {
  const source = value as Partial<OrderItem>;
  return {
    productId: toNumber(source?.productId, 0),
    productName: String(source?.productName ?? ""),
    productImage: String(source?.productImage ?? ""),
    size: toNumber(source?.size, 0),
    quantity: toNumber(source?.quantity, 0),
    price: toNumber(source?.price, 0),
  };
}

function mapOrder(row: OrderRow): Order {
  const items = Array.isArray(row.items)
    ? row.items.map((item) => mapOrderItem(item))
    : [];

  return {
    id: row.id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone ?? undefined,
    address: row.address,
    city: row.city,
    status: row.status as Order["status"],
    items,
    subtotal: toNumber(row.subtotal),
    delivery: toNumber(row.delivery),
    discount: toNumber(row.discount),
    total: toNumber(row.total),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCategory(row: CategoryRow, fallbackId: number): Category {
  return {
    id: toNumber(row.id, fallbackId),
    name: String(row.name ?? ""),
    slug: String(row.slug ?? slugify(String(row.name ?? ""))),
    productCount: toNumber(row.product_count, 0),
  };
}

function resolveStorageUrl(pathOrUrl: string): string {
  if (!pathOrUrl) {
    return pathOrUrl;
  }

  if (
    /^https?:\/\//i.test(pathOrUrl) ||
    pathOrUrl.startsWith("/") ||
    pathOrUrl.startsWith("data:")
  ) {
    return pathOrUrl;
  }

  const { data } = supabase.storage
    .from(SUPABASE_PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(pathOrUrl);

  return data.publicUrl;
}

async function listProducts(params?: ListProductsParams): Promise<Product[]> {
  ensureSupabaseConfigured();

  const { data, error } = await supabase.from("products").select("*");
  if (error) {
    throw new Error(`Failed to list products: ${error.message}`);
  }

  let products = (data ?? []).map((row) => mapProduct(row as ProductRow));

  if (params?.search) {
    const search = params.search.toLowerCase();
    products = products.filter(
      (product) =>
        product.name.toLowerCase().includes(search) ||
        product.brand.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search),
    );
  }

  if (params?.category) {
    const requestedCategory = slugify(params.category);
    products = products.filter(
      (product) => slugify(product.category) === requestedCategory,
    );
  }

  if (params?.featured !== undefined) {
    products = products.filter(
      (product) => product.featured === params.featured,
    );
  }

  const minPrice = params?.minPrice;
  if (minPrice !== undefined) {
    products = products.filter((product) => product.price >= minPrice);
  }

  const maxPrice = params?.maxPrice;
  if (maxPrice !== undefined) {
    products = products.filter((product) => product.price <= maxPrice);
  }

  products.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return products;
}

async function getFeaturedProducts(): Promise<Product[]> {
  const products = await listProducts({ featured: true });
  return products.slice(0, 10);
}

async function getProduct(id: number): Promise<Product> {
  ensureSupabaseConfigured();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load product: ${error.message}`);
  }

  if (!data) {
    throw new Error("Product not found");
  }

  return mapProduct(data as ProductRow);
}

async function listCategories(): Promise<Category[]> {
  ensureSupabaseConfigured();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, product_count")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to list categories: ${error.message}`);
  }

  return (data ?? []).map((row, index) =>
    mapCategory(row as CategoryRow, index + 1),
  );
}

async function createCategory(name: string): Promise<Category> {
  ensureSupabaseConfigured();

  const slug = slugify(name);

  // Return existing category if slug already taken (idempotent)
  const { data: existing } = await supabase
    .from("categories")
    .select("id, name, slug, product_count")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    return mapCategory(existing as CategoryRow, (existing as CategoryRow).id);
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({ name: name.trim(), slug })
    .select("id, name, slug, product_count")
    .single();

  if (error) {
    throw new Error(`Failed to create category: ${error.message}`);
  }

  return mapCategory(data as CategoryRow, (data as CategoryRow).id);
}

async function createProduct(body: CreateProductBody): Promise<Product> {
  ensureSupabaseConfigured();
  await ensureAdminSession();

  const imageUrl = resolveStorageUrl(body.imageUrl);
  const images = (body.images ?? []).map((image) => resolveStorageUrl(image));

  const payload = {
    name: body.name,
    brand: body.brand,
    description: body.description,
    price: body.price,
    original_price: body.originalPrice ?? null,
    image_url: imageUrl,
    images,
    category: body.category,
    sizes: body.sizes,
    stock: body.stock,
    featured: body.featured,
  };

  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create product: ${error.message}`);
  }

  return mapProduct(data as ProductRow);
}

async function updateProduct(
  id: number,
  body: CreateProductBody,
): Promise<Product> {
  ensureSupabaseConfigured();
  await ensureAdminSession();

  const imageUrl = resolveStorageUrl(body.imageUrl);
  const images = (body.images ?? []).map((image) => resolveStorageUrl(image));

  const payload = {
    name: body.name,
    brand: body.brand,
    description: body.description,
    price: body.price,
    original_price: body.originalPrice ?? null,
    image_url: imageUrl,
    images,
    category: body.category,
    sizes: body.sizes,
    stock: body.stock,
    featured: body.featured,
  };

  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }

  return mapProduct(data as ProductRow);
}

async function deleteProduct(id: number): Promise<void> {
  ensureSupabaseConfigured();
  await ensureAdminSession();

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    throw new Error(`Failed to delete product: ${error.message}`);
  }
}

async function listOrders(params?: ListOrdersParams): Promise<Order[]> {
  ensureSupabaseConfigured();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list orders: ${error.message}`);
  }

  let orders = (data ?? []).map((row) => mapOrder(row as OrderRow));

  if (params?.status) {
    orders = orders.filter((order) => order.status === params.status);
  }

  return orders;
}

async function getOrder(id: number): Promise<Order> {
  ensureSupabaseConfigured();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load order: ${error.message}`);
  }

  if (!data) {
    throw new Error("Order not found");
  }

  return mapOrder(data as OrderRow);
}

async function createOrder(body: CreateOrderBody): Promise<Order> {
  ensureSupabaseConfigured();

  const productIds = Array.from(
    new Set(body.items.map((item) => item.productId)),
  );
  if (productIds.length === 0) {
    throw new Error("Order must contain at least one item.");
  }

  const { data: productRows, error: productError } = await supabase
    .from("products")
    .select("id, name, image_url, price")
    .in("id", productIds);

  if (productError) {
    throw new Error(`Failed to validate products: ${productError.message}`);
  }

  const productMap = new Map<number, OrderProductRow>();
  for (const row of productRows ?? []) {
    const product = row as OrderProductRow;
    productMap.set(product.id, product);
  }

  let subtotal = 0;
  const items: OrderItem[] = [];

  for (const item of body.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} not found.`);
    }

    const price = toNumber(product.price, 0);
    subtotal += price * item.quantity;

    items.push({
      productId: product.id,
      productName: product.name,
      productImage: product.image_url,
      size: item.size,
      quantity: item.quantity,
      price,
    });
  }

  const delivery = 5;
  const hasDiscount = Boolean(
    body.discountCode && body.discountCode.trim() !== "",
  );
  const discount = hasDiscount ? subtotal * 0.1 : 0;
  const total = subtotal + delivery - discount;

  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer_name: body.customerName,
      customer_email: body.customerEmail,
      customer_phone: body.customerPhone ?? null,
      address: body.address,
      city: body.city,
      status: "pending",
      items,
      subtotal: subtotal.toFixed(2),
      delivery: delivery.toFixed(2),
      discount: discount.toFixed(2),
      total: total.toFixed(2),
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create order: ${error.message}`);
  }

  return mapOrder(data as OrderRow);
}

async function updateOrderStatus(
  id: number,
  body: UpdateOrderStatusBody,
): Promise<Order> {
  ensureSupabaseConfigured();
  await ensureAdminSession();

  const { data, error } = await supabase
    .from("orders")
    .update({
      status: body.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update order status: ${error.message}`);
  }

  return mapOrder(data as OrderRow);
}

async function getDashboardStats(): Promise<DashboardStats> {
  ensureSupabaseConfigured();

  const [ordersResult, productsResult] = await Promise.all([
    supabase.from("orders").select("total, status"),
    supabase.from("products").select("id", { count: "exact", head: true }),
  ]);

  if (ordersResult.error) {
    throw new Error(
      `Failed to load dashboard stats: ${ordersResult.error.message}`,
    );
  }

  if (productsResult.error) {
    throw new Error(
      `Failed to count products: ${productsResult.error.message}`,
    );
  }

  const orderRows = ordersResult.data ?? [];
  const totalRevenue = orderRows.reduce((sum, row) => {
    const order = row as { total: number | string };
    return sum + toNumber(order.total, 0);
  }, 0);

  const totalOrders = orderRows.length;
  const pendingOrders = orderRows.filter((row) => {
    const order = row as { status: string };
    return order.status === "pending";
  }).length;

  return {
    totalRevenue,
    totalOrders,
    totalProducts: productsResult.count ?? 0,
    pendingOrders,
    revenueChange: 12.5,
    ordersChange: 8.3,
  };
}

async function getRecentOrders(): Promise<Order[]> {
  ensureSupabaseConfigured();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(`Failed to load recent orders: ${error.message}`);
  }

  return (data ?? []).map((row) => mapOrder(row as OrderRow));
}

export async function uploadProductImage(file: File): Promise<string> {
  ensureSupabaseConfigured();
  await ensureAdminSession();

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filePath = `products/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(SUPABASE_PRODUCT_IMAGES_BUCKET)
    .upload(filePath, file, {
      upsert: false,
      contentType: file.type || undefined,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const { data } = supabase.storage
    .from(SUPABASE_PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

function useTypedQuery<TData>(
  defaultQueryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: QueryHookOptions<TData>,
): UseQueryResult<TData, Error> & { queryKey: QueryKey } {
  const resolvedQueryKey = options?.query?.queryKey ?? defaultQueryKey;

  const query = useQuery({
    ...(options?.query ?? {}),
    queryKey: resolvedQueryKey,
    queryFn,
  });

  return { ...query, queryKey: resolvedQueryKey };
}

export const getHealthCheckQueryKey = () => ["health"] as const;

export function useHealthCheck(
  options?: QueryHookOptions<HealthStatus>,
): UseQueryResult<HealthStatus, Error> & { queryKey: QueryKey } {
  return useTypedQuery(
    getHealthCheckQueryKey(),
    async () => ({ status: "ok" }),
    options,
  );
}

export const getListProductsQueryKey = (params?: ListProductsParams) =>
  params ? (["products", params] as const) : (["products"] as const);

export function useListProducts(
  params?: ListProductsParams,
  options?: QueryHookOptions<Product[]>,
): UseQueryResult<Product[], Error> & { queryKey: QueryKey } {
  return useTypedQuery(
    getListProductsQueryKey(params),
    () => listProducts(params),
    options,
  );
}

export const getGetFeaturedProductsQueryKey = () =>
  ["products", "featured"] as const;

export function useGetFeaturedProducts(
  options?: QueryHookOptions<Product[]>,
): UseQueryResult<Product[], Error> & { queryKey: QueryKey } {
  return useTypedQuery(
    getGetFeaturedProductsQueryKey(),
    getFeaturedProducts,
    options,
  );
}

export const getGetProductQueryKey = (id: number) =>
  ["products", "detail", id] as const;

export function useGetProduct(
  id: number,
  options?: QueryHookOptions<Product>,
): UseQueryResult<Product, Error> & { queryKey: QueryKey } {
  return useTypedQuery(
    getGetProductQueryKey(id),
    () => getProduct(id),
    options,
  );
}

export const getListCategoriesQueryKey = () => ["categories"] as const;

export function useListCategories(
  options?: QueryHookOptions<Category[]>,
): UseQueryResult<Category[], Error> & { queryKey: QueryKey } {
  return useTypedQuery(getListCategoriesQueryKey(), listCategories, options);
}

export function useCreateCategory<TContext = unknown>(
  options?: MutationHookOptions<Category, { name: string }, TContext>,
): UseMutationResult<Category, Error, { name: string }, TContext> {
  return useMutation({
    mutationKey: ["createCategory"],
    mutationFn: async ({ name }) => createCategory(name),
    ...(options?.mutation ?? {}),
  });
}

export function useCreateProduct<TContext = unknown>(
  options?: MutationHookOptions<Product, { data: CreateProductBody }, TContext>,
): UseMutationResult<Product, Error, { data: CreateProductBody }, TContext> {
  return useMutation({
    mutationKey: ["createProduct"],
    mutationFn: async ({ data }) => createProduct(data),
    ...(options?.mutation ?? {}),
  });
}

export function useUpdateProduct<TContext = unknown>(
  options?: MutationHookOptions<
    Product,
    { id: number; data: CreateProductBody },
    TContext
  >,
): UseMutationResult<
  Product,
  Error,
  { id: number; data: CreateProductBody },
  TContext
> {
  return useMutation({
    mutationKey: ["updateProduct"],
    mutationFn: async ({ id, data }) => updateProduct(id, data),
    ...(options?.mutation ?? {}),
  });
}

export function useDeleteProduct<TContext = unknown>(
  options?: MutationHookOptions<void, { id: number }, TContext>,
): UseMutationResult<void, Error, { id: number }, TContext> {
  return useMutation({
    mutationKey: ["deleteProduct"],
    mutationFn: async ({ id }) => deleteProduct(id),
    ...(options?.mutation ?? {}),
  });
}

export const getListOrdersQueryKey = (params?: ListOrdersParams) =>
  params ? (["orders", params] as const) : (["orders"] as const);

export function useListOrders(
  params?: ListOrdersParams,
  options?: QueryHookOptions<Order[]>,
): UseQueryResult<Order[], Error> & { queryKey: QueryKey } {
  return useTypedQuery(
    getListOrdersQueryKey(params),
    () => listOrders(params),
    options,
  );
}

export const getGetOrderQueryKey = (id: number) =>
  ["orders", "detail", id] as const;

export function useGetOrder(
  id: number,
  options?: QueryHookOptions<Order>,
): UseQueryResult<Order, Error> & { queryKey: QueryKey } {
  return useTypedQuery(getGetOrderQueryKey(id), () => getOrder(id), options);
}

export function useCreateOrder<TContext = unknown>(
  options?: MutationHookOptions<Order, { data: CreateOrderBody }, TContext>,
): UseMutationResult<Order, Error, { data: CreateOrderBody }, TContext> {
  return useMutation({
    mutationKey: ["createOrder"],
    mutationFn: async ({ data }) => createOrder(data),
    ...(options?.mutation ?? {}),
  });
}

export function useUpdateOrderStatus<TContext = unknown>(
  options?: MutationHookOptions<
    Order,
    { id: number; data: UpdateOrderStatusBody },
    TContext
  >,
): UseMutationResult<
  Order,
  Error,
  { id: number; data: UpdateOrderStatusBody },
  TContext
> {
  return useMutation({
    mutationKey: ["updateOrderStatus"],
    mutationFn: async ({ id, data }) => updateOrderStatus(id, data),
    ...(options?.mutation ?? {}),
  });
}

export const getGetDashboardStatsQueryKey = () =>
  ["stats", "dashboard"] as const;

export function useGetDashboardStats(
  options?: QueryHookOptions<DashboardStats>,
): UseQueryResult<DashboardStats, Error> & { queryKey: QueryKey } {
  return useTypedQuery(
    getGetDashboardStatsQueryKey(),
    getDashboardStats,
    options,
  );
}

export const getGetRecentOrdersQueryKey = () =>
  ["stats", "recent-orders"] as const;

export function useGetRecentOrders(
  options?: QueryHookOptions<Order[]>,
): UseQueryResult<Order[], Error> & { queryKey: QueryKey } {
  return useTypedQuery(getGetRecentOrdersQueryKey(), getRecentOrders, options);
}

export function setBaseUrl(_url: string | null): void {
  // No-op for Supabase transport; kept for compatibility with previous API client.
}

export function setAuthTokenGetter(_getter: AuthTokenGetter | null): void {
  // No-op for Supabase transport; auth is handled by Supabase session management.
}
