import { TweeterResponse } from "tweeter-shared";

const HEADERS = { "Access-Control-Allow-Origin": "*" };

function makeResponse(statusCode: number, body: object) {
  return { statusCode, headers: HEADERS, body: JSON.stringify(body) };
}

/**
 * Template Method: wraps every lambda handler with uniform JSON parsing,
 * validation (→ 400), execution (→ 200), and error handling (→ 500).
 *
 * @param errorDefault  Factory that fills in response-type-specific default
 *                      fields (e.g. `items: null, hasMore: false`) for errors.
 * @param validate      Returns an error message string, or null when valid.
 * @param execute       Runs the business logic and returns the full success response.
 */
export function makeHandler<REQ, RES extends TweeterResponse>(
  errorDefault: (message: string) => RES,
  validate: (req: REQ) => string | null,
  execute: (req: REQ) => Promise<RES>
): (event: any) => Promise<any> {
  return async (event: any) => {
    try {
      const req: REQ = JSON.parse(event.body);
      const errorMsg = validate(req);
      if (errorMsg) {
        return makeResponse(400, errorDefault(errorMsg));
      }
      return makeResponse(200, await execute(req));
    } catch (error) {
      return makeResponse(500, errorDefault((error as Error).message));
    }
  };
}
