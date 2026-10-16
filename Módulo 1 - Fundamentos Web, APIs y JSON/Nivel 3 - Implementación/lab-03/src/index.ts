import { depurateProducts } from "./modules/depurateProducts.ts";
import { productsByPagination } from "./modules/productsByPagination.ts";
import { transformProducts } from "./modules/transformProducts.ts";
import { validateProducts } from "./modules/validateProducts.ts";

import { createJSON } from "./functions/createJSON.ts";
import { logger } from "./functions/logger.ts";
import { isRecord } from "./type_guard/isRecord.ts";

try {
  const initScript: number = performance.now();

  console.log("Initializting script...");
  await logger.info("Initializating script...");

  const limitValue: number = Number(process.env.LIMIT_VALUE);

  let paginationNumber: number = 0;
  let endFlag: boolean = false;
  let totalProducts: number = 0;
  let validFoundProducts: number = 0;
  let currentSkipCursor: number | null = null;

  console.log("Processing...");
  while (!endFlag) {
    await logger.info(`Initializating pagination ${paginationNumber + 1}...`);

    const init = performance.now();

    const data = await productsByPagination(
      paginationNumber,
      currentSkipCursor,
    );

    const validatedData = await validateProducts(
      data,
      paginationNumber,
      currentSkipCursor,
    );

    totalProducts = validatedData.total;

    const depuratedData = await depurateProducts(
      validatedData,
      paginationNumber,
      validatedData.skipCursor,
    );

    currentSkipCursor = depuratedData.skipCursor;

    const { transformedProducts, productsQuantity } = transformProducts(
      depuratedData.products,
    );

    await createJSON(transformedProducts, paginationNumber);

    validFoundProducts += transformedProducts.length;

    paginationNumber++;

    const finish = performance.now();

    await logger.info(
      `Pagination ${paginationNumber} processed, JSON file generated.`,
    );
    await logger.info("Results", {
      page: paginationNumber,
      products: productsQuantity,
      duplicates: depuratedData.duplicatedProducts,
      executionTime: finish - init,
    });

    if (transformedProducts.length < limitValue) endFlag = true;
  }

  const finishScript: number = performance.now();

  await logger.info("Script finished", {
    totalProducts: totalProducts,
    validFoundProducts: validFoundProducts,
    totalExecutionTime: finishScript - initScript,
  });
  console.log("Script finished, check the results folder.");
} catch (e: unknown) {
  console.log(e);

  await logger.error("Error during the script.", {
    errorName: e.name,
    errorMessage: e.message,
    errorStack: e.stack,
  });
}
