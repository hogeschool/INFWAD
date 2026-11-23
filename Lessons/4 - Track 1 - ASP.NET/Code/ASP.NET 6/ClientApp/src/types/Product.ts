import type { Category } from "./Category";

export type Product = {
  id: number;
  name: string;
  price: number;
  category: Category;
};
