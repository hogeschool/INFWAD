import { useState, useEffect } from "react";
import type { Product } from "../../types/Product";
import { ProductForm } from "./ProductForm";
import { ProductList } from "./ProductList";

type ProductResponse = {
  id: number;
  title: string;
  price: number;
};

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/products.json");
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data: ProductResponse[] = await response.json();
        setProducts(
          data.map((item) => ({
            id: item.id,
            name: item.title,
            price: item.price,
          })),
        );
      } catch (err) {
        console.error(err);
        setError("Could not load products.");
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  function addProduct(name: string, price: number) {
    const newProduct: Product = { id: Date.now(), name, price };
    setProducts([...products, newProduct]);
  }

  function updateProduct(updated: Product) {
    setProducts(products.map((p) => (p.id === updated.id ? updated : p)));
    setEditingProduct(null);
  }

  function deleteProduct(id: number) {
    setProducts(products.filter((p) => p.id !== id));
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
        products={products}
        onEdit={startEditing}
        onDelete={deleteProduct}
      />
    </div>
  );
}
