import { Routes, Route } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { ProductsPage } from "./features/products/ProductsPage";
import { ProductDetailPage } from "./features/products/ProductDetailPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
