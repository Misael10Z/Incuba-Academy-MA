import { isRecord } from "../type_guard/isRecord.ts";
import { isProduct } from "../type_guard/isProduct.ts";
import { assertProductsResponse } from "../asserts/assertProductsResponse.ts";
import { logger } from "../functions/logger.ts";
import { completeProductsBatch } from "../functions/completeProductsBatch.ts";

import type {
  Product,
  Products,
  ProductsResponseWithCursor,
} from "../types/productType.ts";

export function validProducts(products: unknown[]): Products {
  return products.filter((p): p is Product => {
    if (isProduct(p)) return true;

    logger.warn("Invalid element detected", {
      element_id: isRecord(p) ? p.id : "Is not an object, ID not found",
    });

    return false;
  });
}

export async function validateProducts(
  data: unknown,
  paginationNumber: number,
  firstSkipCursor: number | null,
): Promise<ProductsResponseWithCursor> {
  assertProductsResponse(data);

  let validatedProducts: Products = validProducts(data.products);

  const { products, skipCursor } = await completeProductsBatch(
    validatedProducts,
    paginationNumber,
    firstSkipCursor,
  );

  return { ...data, products, skipCursor };
}
