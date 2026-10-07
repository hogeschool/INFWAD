import { useState } from "react";
import type { Product } from "../../types/Product";
import ProductForm from "./ProductForm";
import ProductList from "./ProductList";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: "Laptop", price: 1200 },
    { id: 2, name: "Phone", price: 800 },
    { id: 3, name: "Headphones", price: 150 },
  ]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
