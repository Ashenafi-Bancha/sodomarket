/** Small typed wrapper around fetch for the /api/v1 endpoints. */

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  const res = await fetch(`/api/v1${path}`, {
    method,
    headers: body && !isForm ? { 'Content-Type': 'application/json' } : undefined,
    body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
    credentials: 'same-origin',
  });
  let json: { success?: boolean; data?: T; error?: string } = {};
  try {
    json = await res.json();
  } catch {
    // Non-JSON response.
  }
  if (!res.ok || json.success === false) {
    throw new ApiClientError(json.error || 'Something went wrong. Please try again.', res.status);
  }
  return json.data as T;
}

export const api = {
  get: <T,>(path: string) => request<T>('GET', path),
  post: <T,>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T,>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T,>(path: string) => request<T>('DELETE', path),
};

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}
