import { completeProductsBatch } from "../functions/completeProductsBatch.ts";
import { logger } from "../functions/logger.ts";
import { isRecord } from "../type_guard/isRecord.ts";

import type {
  DepurationResult,
  Products,
  ProductsResponse,
  ProductsSet,
} from "../types/productType.ts";

export function productsDepuration(data: ProductsResponse | ProductsSet) {
  let duplicatedProducts: number = 0;
  let depuratedProducts: Products = data.products.filter(
    (product, index, arr) => {
      const productIndex = arr.findIndex((p) => p.id === product.id);

      if (productIndex === index) {
        return true;
      } else {
        duplicatedProducts++;

        logger.warn("Duplicate element detected", {
          element_id: isRecord(product) ? product.id : undefined,
        });

        return false;
      }
    },
  );

  return { depuratedProducts, duplicatedProducts };
}

export async function depurateProducts(
  data: ProductsResponse,
  paginationNumber: number,
  secondSkipCursor: number | null,
): Promise<DepurationResult> {
  /*let duplicatedProducts: number = 0;
  let depuratedProducts: Products = data.products.filter(
    (product, index, arr) => {
      const productIndex = arr.findIndex((p) => p.id === product.id);

      if (productIndex === index) {
        return true;
      } else {
        duplicatedProducts++;

        logger.warn("Duplicate element detected", {
          element_id: isRecord(product) ? product.id : undefined,
        });

        return false;
      }
    },
  );*/

  const depurationResults = productsDepuration(data);

  let batchCompletationResults = await completeProductsBatch(
    depurationResults.depuratedProducts,
    paginationNumber,
    secondSkipCursor,
    true,
  );

  /*if (products.length !== 0) {
    const newDepuratedProducts = depurateProducts();
  }*/

  return {
    products: batchCompletationResults.products,
    duplicatedProducts: depurationResults.duplicatedProducts,
    skipCursor: batchCompletationResults.skipCursor,
  };
}
