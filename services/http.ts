import { API_BASE_URL } from '@/config';
import { getToken, getCachedToken } from '@/services/token';

type Json = Record<string, any>;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  let token = getCachedToken();
  if (!token) token = await getToken();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const baseHeaders: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const headers: Record<string, string> = isFormData
    ? baseHeaders
    : { 'Content-Type': 'application/json', ...baseHeaders };
  const body = isFormData
    ? options.body
    : options.body !== undefined && typeof options.body !== 'string'
      ? JSON.stringify(options.body)
      : options.body;
  const res = await fetch(url, { method: options.method || 'GET', headers, body, credentials: 'include' });
  const text = await res.text();
  let data: Json | null = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {}
  if (!res.ok) {
    const message = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(message);
  }
  return (data as unknown) as T;
}

function get<T>(path: string, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
  return request<T>(path, { ...options, method: 'GET' });
}

function post<T>(path: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
  return request<T>(path, { ...options, method: 'POST', body });
}

function patch<T>(path: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
  return request<T>(path, { ...options, method: 'PATCH', body });
}

function del<T>(path: string, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
  return request<T>(path, { ...options, method: 'DELETE' });
}

export const http = { request, get, post, patch, del };
