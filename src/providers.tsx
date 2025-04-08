import { NuqsAdapter } from 'nuqs/adapters/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return <NuqsAdapter>{children}</NuqsAdapter>
}
