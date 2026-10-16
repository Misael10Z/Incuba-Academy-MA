export async function productsByPagination(
  paginationNumber: number,
  currentSkipCursor: number | null,
): Promise<unknown> {
  const url: string = process.env.URL;
  const query: string = process.env.QUERY;
  const queryConnector: string = process.env.QUERY_CONNECTOR;
  const queryLimit: string = process.env.QUERY_LIMIT;
  const querySkip: string = process.env.QUERY_SKIP;
  //const queryDelay: string = process.env.QUERY_DELAY;
  //const delayValue: number = Number(process.env.DELAY_VALUE);

  const limitValue: number = Number(process.env.LIMIT_VALUE);
  let envSkipValue: number = Number(process.env.SKIP_VALUE ?? 0);
  let skipValue: number = envSkipValue * paginationNumber;

  if (currentSkipCursor !== null) skipValue = skipValue + currentSkipCursor;

  const timeout: number = Number(process.env.TIMEOUT_LIMIT);

  const response = await fetch(
    `${url + query + queryLimit + limitValue + queryConnector + querySkip + skipValue}`,
    {
      signal: AbortSignal.timeout(timeout),
    },
  );

  /*const response = await fetch(
      `${url + query + queryLimit + limitValue + queryConnector + querySkip + skipValue + queryConnector + queryDelay + delayValue}`,
      {
        signal: AbortSignal.timeout(timeout - 2000),
      },
    );*/

  /*const response = await fetch("https://dummyjson.com/http/503", {
      signal: AbortSignal.timeout(timeout),
    });*/

  if (!response.ok) throw Error("Fail to catch products.");

  //console.log(`Response: ${response.ok}.\nCode status: ${response.status}.`);

  const data: unknown = await response.json();

  return data;
}
