import type { Product } from "../types/Product";
import { baseUrl, errorFromResponse } from "./http";

type ProductResponse = {
  id: number;
  title: string;
  price: number;
};

function toProduct(raw: ProductResponse): Product {
  return {
    id: raw.id,
    name: raw.title,
    price: raw.price,
  };
}

export async function getAll(): Promise<Product[]> {
  const response = await fetch(`${baseUrl}/api/products`);
  if (!response.ok) {
    throw await errorFromResponse(response);
  }
  const raw: ProductResponse[] = await response.json();
  return raw.map(toProduct);
}

export async function getById(id: number): Promise<Product> {
  const response = await fetch(`${baseUrl}/api/products/${id}`);
  if (!response.ok) {
    throw await errorFromResponse(response);
  }
  const raw: ProductResponse = await response.json();
  return toProduct(raw);
}
