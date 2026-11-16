import type { Category } from "../types/Category";
import { baseUrl, errorFromResponse } from "./http";

export async function getAll(): Promise<Category[]> {
  const response = await fetch(`${baseUrl}/api/categories`);
  if (!response.ok) {
    throw await errorFromResponse(response);
  }
  return response.json();
}
