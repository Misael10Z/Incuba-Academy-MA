import type { RawProductsResponse } from "../types/productType.ts";

import { isRecord } from "../type_guard/isRecord.ts";

export function assertProductsResponse(
  data: unknown,
): asserts data is RawProductsResponse {
  if (!isRecord(data)) throw Error("Body response is not an object.");

  if (!("products" in data)) throw Error('Property "products" not exist.');

  if (!data.products) throw Error('"products" is void.');

  if (!Array.isArray(data.products)) throw Error('"products" is not an array');

  if (!("total" in data)) throw Error('Property "total" not exist.');

  if (typeof data.total !== "number") throw Error('"total" is not a number');
}
