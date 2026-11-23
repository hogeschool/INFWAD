import type { Product } from "../types/Product";
import { baseUrl, errorFromResponse } from "./http";

type ProductResponse = {
  id: number;
  title: string;
  price: number;
  category: { id: number; name: string };
};

function toProduct(raw: ProductResponse): Product {
  return {
    id: raw.id,
    name: raw.title,
    price: raw.price,
    category: raw.category,
  };
}

function toRequestBody(data: ProductData) {
  return {
    title: data.name,
    price: data.price,
    categoryId: data.categoryId,
  };
}

export type ProductData = {
  name: string;
  price: number;
  categoryId: number;
};

export async function getAll(search?: string): Promise<Product[]> {
  const url = search
    ? `${baseUrl}/api/products?search=${encodeURIComponent(search)}`
    : `${baseUrl}/api/products`;

  const response = await fetch(url);
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

export async function create(data: ProductData): Promise<Product> {
  const response = await fetch(`${baseUrl}/api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toRequestBody(data)),
  });
  if (!response.ok) {
    throw await errorFromResponse(response);
  }
  const raw: ProductResponse = await response.json();
  return toProduct(raw);
}

export async function update(id: number, data: ProductData): Promise<Product> {
  const response = await fetch(`${baseUrl}/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toRequestBody(data)),
  });
  if (!response.ok) {
    throw await errorFromResponse(response);
  }
  const raw: ProductResponse = await response.json();
  return toProduct(raw);
}

export async function remove(id: number): Promise<void> {
  const response = await fetch(`${baseUrl}/api/products/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw await errorFromResponse(response);
  }
}
