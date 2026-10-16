import type { Products, ProductsAndCursor } from "../types/productType.ts";

import { findNewProductByPagination } from "./findNewProductByPagination.ts";
import { assertProductsResponse } from "../asserts/assertProductsResponse.ts";
import { validProducts } from "../modules/validateProducts.ts";
import { productsDepuration } from "../modules/depurateProducts.ts";

export async function completeProductsBatch(
  products: Products,
  paginationNumber: number,
  skipCursor: number | null,
  depurationFlag: boolean = false,
): Promise<ProductsAndCursor> {
  const limitValue: number = Number(process.env.LIMIT_VALUE);
  //let skipCursor: number = newSkipCursor;

  while (products.length < limitValue) {
    const lackingProducts: number = limitValue - products.length;

    const newData: unknown = await findNewProductByPagination(
      paginationNumber,
      lackingProducts,
      skipCursor,
    );

    assertProductsResponse(newData);

    if (newData.products.length === 0) break;

    if (skipCursor === null) skipCursor = 0;

    skipCursor += newData.products.length;

    products.push(...validProducts(newData.products));

    if (depurationFlag) {
      const depuratedResults = productsDepuration({ products });
      products = depuratedResults.depuratedProducts;
    }
  }
  return { products, skipCursor };
}
