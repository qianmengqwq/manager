import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

import { Toaster } from 'react-hot-toast'
import { Providers } from './providers'
// Import the generated route tree
import { routeTree } from './routeTree.gen'

import './index.css'

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <Providers>
        <Toaster />
        <RouterProvider router={router} />
      </Providers>
    </StrictMode>,
  )
}
