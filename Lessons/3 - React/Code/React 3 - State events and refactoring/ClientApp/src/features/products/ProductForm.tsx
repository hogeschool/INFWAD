import { useState } from "react";
import type { SubmitEvent } from "react";
import type { Product } from "../../types/Product";
import styles from "./Products.module.css";

type ProductFormProps = {
  editingProduct: Product | null;
  onAdd: (name: string, price: number) => void;
  onUpdate: (product: Product) => void;
  onCancel: () => void;
};

export default function ProductForm({
  editingProduct,
  onAdd,
  onUpdate,
  onCancel,
}: ProductFormProps) {
  const [name, setName] = useState(editingProduct?.name ?? "");
  const [price, setPrice] = useState(editingProduct?.price ?? 0);

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (name.trim() === "" || price <= 0) {
      return;
    }
    if (editingProduct) {
      onUpdate({ id: editingProduct.id, name, price });
    } else {
      onAdd(name, price);
    }
    setName("");
    setPrice(0);
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
