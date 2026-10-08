import { useState } from "react";
import type { Product } from "../../types/Product";
import { ProductForm } from "./ProductForm";
import { ProductList } from "./ProductList";
import { useFetch } from "../../hooks/useFetch";

type ProductResponse = {
  id: number;
  title: string;
  price: number;
};

export function ProductsPage() {
  const {
    data: products,
    loading,
    error,
    setData: setProducts,
  } = useFetch<ProductResponse[], Product[]>("/products.json", (raw) =>
    raw.map((item) => ({ id: item.id, name: item.title, price: item.price })),
  );
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  function addProduct(name: string, price: number) {
    const newProduct: Product = { id: Date.now(), name, price };
    setProducts([...(products ?? []), newProduct]);
  }

  function updateProduct(updated: Product) {
    setProducts(
      (products ?? []).map((p) => (p.id === updated.id ? updated : p)),
    );
    setEditingProduct(null);
  }

  function deleteProduct(id: number) {
    setProducts((products ?? []).filter((p) => p.id !== id));
  }

  function startEditing(product: Product) {
    setEditingProduct(product);
  }

  function cancelEdit() {
    setEditingProduct(null);
  }

  if (loading) {
    return <p>Loading products...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Products</h1>
      <ProductForm
        key={editingProduct?.id ?? "new"}
        editingProduct={editingProduct}
        onAdd={addProduct}
        onUpdate={updateProduct}
        onCancel={cancelEdit}
      />
      <ProductList
        products={products ?? []}
        onEdit={startEditing}
        onDelete={deleteProduct}
      />
    </div>
  );
}
