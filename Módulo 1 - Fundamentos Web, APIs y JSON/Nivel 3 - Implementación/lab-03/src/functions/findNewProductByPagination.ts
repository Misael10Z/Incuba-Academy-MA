export const findNewProductByPagination = async (
  paginationNumber: number,
  lackingProducts: number,
  skipCursor: number | null,
): Promise<unknown> => {
  const url: string = process.env.URL;
  const query: string = process.env.QUERY;
  const queryConnector: string = process.env.QUERY_CONNECTOR;
  const queryLimit: string = process.env.QUERY_LIMIT;
  const querySkip: string = process.env.QUERY_SKIP;
  const timeout: number = Number(process.env.TIMEOUT_LIMIT);
  const envSkipValue: number = Number(process.env.SKIP_VALUE);
  let skipValue: number = envSkipValue * (paginationNumber + 1);

  if (skipCursor !== null) skipValue = skipValue + skipCursor;

  const response = await fetch(
    `${url + query + queryLimit + lackingProducts + queryConnector + querySkip + skipValue}`,
    {
      signal: AbortSignal.timeout(timeout),
    },
  );

  if (!response.ok) throw Error("Fail to catch products.");

  //console.log(`Response: ${response.ok}.\nCode status: ${response.status}.`);

  const data: unknown = await response.json();

  return data;
};
