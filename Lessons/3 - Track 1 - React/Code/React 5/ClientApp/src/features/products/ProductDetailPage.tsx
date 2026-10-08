import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import type { Product } from "../../types/Product";

type ProductResponse = {
  id: number;
  title: string;
  price: number;
};

export function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await fetch(`/products/${id}.json`);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data: ProductResponse = await response.json();
        setProduct({ id: data.id, name: data.title, price: data.price });
      } catch (err) {
        console.error(err);
        setError("Could not load this product.");
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  if (loading) {
    return <p>Loading product...</p>;
  }

  if (error || !product) {
    return <p>{error ?? "Product not found."}</p>;
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <p>€{product.price}</p>
      <Link to="/products">Back to products</Link>
    </div>
  );
}
