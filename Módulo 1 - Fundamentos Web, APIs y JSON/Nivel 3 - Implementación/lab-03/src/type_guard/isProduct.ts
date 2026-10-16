import type { Product } from "../types/productType.ts";

import { isRecord } from "./isRecord.ts";

export function isProduct(p: unknown): p is Product {
  if (!isRecord(p)) return false;

  return (
    typeof p.id === "number" &&
    typeof p.title === "string" &&
    typeof p.category === "string" &&
    typeof p.price === "number"
  );
}
