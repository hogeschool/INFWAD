import { useState } from "react";
import type { Product } from "../../types/Product";
import * as productsApi from "../../api/products";
import { useFetch } from "../../hooks/useFetch";
import { ProductForm } from "./ProductForm";
import { ProductList } from "./ProductList";
import type { ProductData } from "../../api/products";

export function ProductsPage() {
  const [search, setSearch] = useState("");

  const {
    data: products,
    loading,
    error,
    setData: setProducts,
  } = useFetch(() => productsApi.getAll(search), [search]);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function addProduct(data: ProductData) {
    try {
      const created = await productsApi.create(data);
      setProducts([...(products ?? []), created]);
      setSaveError(null);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Could not save the product.",
      );
    }
  }

  async function updateProduct(id: number, data: ProductData) {
    try {
      const updated = await productsApi.update(id, data);
      setProducts(
        (products ?? []).map((p) => (p.id === updated.id ? updated : p)),
      );
      setEditingProduct(null);
      setSaveError(null);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Could not save the product.",
      );
    }
  }

  async function deleteProduct(id: number) {
    try {
      await productsApi.remove(id);
      setProducts((products ?? []).filter((p) => p.id !== id));
      setSaveError(null);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Could not delete the product.",
      );
    }
  }

  function startEditing(product: Product) {
    setEditingProduct(product);
  }

  function cancelEdit() {
    setEditingProduct(null);
  }

  if (loading && products === null) {
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
      {saveError && <p>{saveError}</p>}

      <input
        type="search"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ProductList
        products={products ?? []}
        onEdit={startEditing}
        onDelete={deleteProduct}
      />
    </div>
  );
}
