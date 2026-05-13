export const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS",
  "access-control-allow-headers": "authorization,content-type,x-cron-secret",
};

export class HttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

export function httpError(status: number, message: string): HttpError {
  return new HttpError(status, message);
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

export function htmlResponse(html: string): Response {
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
