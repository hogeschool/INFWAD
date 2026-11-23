import { useState } from "react";
import type { SubmitEvent } from "react";
import type { Product } from "../../types/Product";
import type { ProductData } from "../../api/products";
import * as categoriesApi from "../../api/categories";
import { useFetch } from "../../hooks/useFetch";
import styles from "./Products.module.css";

type ProductFormProps = {
  editingProduct: Product | null;
  onAdd: (data: ProductData) => void;
  onUpdate: (id: number, data: ProductData) => void;
  onCancel: () => void;
};

export function ProductForm({
  editingProduct,
  onAdd,
  onUpdate,
  onCancel,
}: ProductFormProps) {
  const [name, setName] = useState(editingProduct?.name ?? "");
  const [price, setPrice] = useState(editingProduct?.price ?? 0);
  const [categoryId, setCategoryId] = useState(
    editingProduct?.category.id ?? 0,
  );
  const { data: categories } = useFetch(categoriesApi.getAll, []);

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    // if (name.trim() === "" || price <= 0 || categoryId === 0) {
    //   return;
    // }
    const data: ProductData = { name, price, categoryId };
    if (editingProduct) {
      onUpdate(editingProduct.id, data);
    } else {
      onAdd(data);
    }
    setName("");
    setPrice(0);
    setCategoryId(0);
  }

  return (
    <div className={styles["product-form"]}>
      <form onSubmit={handleSubmit}>
        <h2>{editingProduct ? "Edit product" : "Add product"}</h2>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <input
          type="number"
          value={price}
          onChange={(event) => setPrice(Number(event.target.value))}
        />
        <select
          value={categoryId}
          onChange={(event) => setCategoryId(Number(event.target.value))}
        >
          <option value={0}>Choose a category</option>
          {(categories ?? []).map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <button type="submit">{editingProduct ? "Save" : "Add"}</button>
        {editingProduct && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </form>
    </div>
  );
}
