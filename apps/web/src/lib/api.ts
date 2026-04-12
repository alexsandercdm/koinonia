/// <reference types="vite/client" />
import { authClient } from './auth'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function getAuthHeaders(): Promise<Record<string, string>> {
  const session = await authClient.getSession()
  const token = session?.data?.session?.token
  if (!token) {
    window.location.replace('/login')
    throw new Error('Unauthenticated')
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
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

  if (response.status === 401) {
    window.location.replace('/login')
    throw new Error('Unauthenticated')
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    const message =
      (errorBody as { message?: string }).message ||
      `HTTP ${response.status}: ${response.statusText}`
    throw new Error(message)
  }

  return response.json() as Promise<T>
}
