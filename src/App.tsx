import { Suspense, lazy } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "./context/CartContext";
import { AdminRoute } from "./components/admin-route";

const Home = lazy(() => import("./pages/home"));
const Products = lazy(() => import("./pages/products"));
const ProductDetail = lazy(() => import("./pages/product-detail"));
const Cart = lazy(() => import("./pages/cart"));
const Checkout = lazy(() => import("./pages/checkout"));
const OrderConfirmation = lazy(() => import("./pages/order-confirmation"));
const AdminDashboard = lazy(() => import("./pages/admin/dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/products"));
const AdminProductForm = lazy(() => import("./pages/admin/product-form"));
const AdminOrders = lazy(() => import("./pages/admin/orders"));
const AdminLogin = lazy(() => import("./pages/admin/login"));
const NotFound = lazy(() => import("./pages/not-found"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  const RouteFallback = () => (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50" role="status" aria-live="polite">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-red-600" />
      <span className="sr-only">Chargement...</span>
    </div>
  );

  const HomeRoute = () => (
    <Suspense fallback={<RouteFallback />}>
      <Home />
    </Suspense>
  );

  const ProductsRoute = () => (
    <Suspense fallback={<RouteFallback />}>
      <Products />
    </Suspense>
  );

  const ProductDetailRoute = () => (
    <Suspense fallback={<RouteFallback />}>
      <ProductDetail />
    </Suspense>
  );

  const CartRoute = () => (
    <Suspense fallback={<RouteFallback />}>
      <Cart />
    </Suspense>
  );

  const CheckoutRoute = () => (
    <Suspense fallback={<RouteFallback />}>
      <Checkout />
    </Suspense>
  );

  const OrderConfirmationRoute = () => (
    <Suspense fallback={<RouteFallback />}>
      <OrderConfirmation />
    </Suspense>
  );

  const AdminLoginRoute = () => (
    <Suspense fallback={<RouteFallback />}>
      <AdminLogin />
    </Suspense>
  );

  const AdminDashboardRoute = () => (
    <AdminRoute>
      <Suspense fallback={<RouteFallback />}>
        <AdminDashboard />
      </Suspense>
    </AdminRoute>
  );

  const AdminProductsRoute = () => (
    <AdminRoute>
      <Suspense fallback={<RouteFallback />}>
        <AdminProducts />
      </Suspense>
    </AdminRoute>
  );

  const AdminProductFormRoute = () => (
    <AdminRoute>
      <Suspense fallback={<RouteFallback />}>
        <AdminProductForm />
      </Suspense>
    </AdminRoute>
  );

  const AdminOrdersRoute = () => (
    <AdminRoute>
      <Suspense fallback={<RouteFallback />}>
        <AdminOrders />
      </Suspense>
    </AdminRoute>
  );

  const NotFoundRoute = () => (
    <Suspense fallback={<RouteFallback />}>
      <NotFound />
    </Suspense>
  );

  return (
    <Switch>
      <Route path="/" component={HomeRoute} />
      <Route path="/products" component={ProductsRoute} />
      <Route path="/products/:id" component={ProductDetailRoute} />
      <Route path="/cart" component={CartRoute} />
      <Route path="/checkout" component={CheckoutRoute} />
      <Route path="/order-confirmation/:id" component={OrderConfirmationRoute} />
      
      {/* Admin routes */}
      <Route path="/admin/login" component={AdminLoginRoute} />
      <Route path="/admin" component={AdminDashboardRoute} />
      <Route path="/admin/products" component={AdminProductsRoute} />
      <Route path="/admin/products/new" component={AdminProductFormRoute} />
      <Route path="/admin/products/:id/edit" component={AdminProductFormRoute} />
      <Route path="/admin/orders" component={AdminOrdersRoute} />

      <Route component={NotFoundRoute} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
