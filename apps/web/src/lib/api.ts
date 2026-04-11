import { authClient } from './auth'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function getAuthHeaders(): Promise<Record<string, string>> {
  const session = await authClient.getSession()
  if (session?.data?.session?.token) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.data.session.token}`,
    }
  }
  return { 'Content-Type': 'application/json' }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...headers,
      ...(options?.headers || {}),
    },
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    const message =
      (errorBody as { message?: string }).message ||
      `HTTP ${response.status}: ${response.statusText}`
    throw new Error(message)
  }

  return response.json() as Promise<T>
}
