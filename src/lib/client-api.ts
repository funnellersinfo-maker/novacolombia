"use client";

// Cliente HTTP tipado para las APIs de la tienda
export class ApiError extends Error {
  status: number;
  payload: Record<string, unknown>;
  constructor(message: string, status: number, payload: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
  get fieldErrors(): Record<string, string> {
    const e = this.payload.errors;
    return e && typeof e === "object" ? (e as Record<string, string>) : {};
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    credentials: "same-origin",
  });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* respuesta vacía */
  }
  if (!res.ok) {
    const payload = (data as Record<string, unknown>) ?? {};
    const message =
      typeof payload.error === "string" ? payload.error : typeof payload.message === "string" ? payload.message : `Error ${res.status}`;
    throw new ApiError(message, res.status, payload);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
