import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,    // 5 minutes — background refetch threshold
      gcTime: 1000 * 60 * 60 * 24, // 24 hours — keep in memory/storage
      retry: 1,
    },
  },
})

const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
})

// Must be called once at module level, NOT inside a React component.
// Calling inside a component re-registers on every render.
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours — matches gcTime
  dehydrateOptions: {
    shouldDehydrateQuery: (query) =>
      // SECURITY (ASVS V3): exclude session/auth queries from localStorage.
      // Better Auth session tokens must stay in memory only.
      !query.queryKey.includes('session') && !query.queryKey.includes('auth'),
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
