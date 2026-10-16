import { mkdir, writeFile } from "node:fs/promises";

import type { Products } from "../types/productType.ts";

const jsons_directory: string =
  process.env.RESULTS_DIRECTORY + "stored_products";

export async function createJSON(data: Products, paginationNumber: number) {
  await mkdir(`${jsons_directory}`, {
    recursive: true,
  });
  await writeFile(
    `${jsons_directory}/pagination_${paginationNumber + 1}.json`,
    JSON.stringify(data, null, 2),
    "utf-8",
  );
}
