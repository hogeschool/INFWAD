import { useParams, Link } from "react-router";
import { useFetch } from "../../hooks/useFetch";
import * as productsApi from "../../api/products";

export function ProductDetailPage() {
  const { id } = useParams();
  const {
    data: product,
    loading,
    error,
  } = useFetch(() => productsApi.getById(Number(id)), [id]);

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
