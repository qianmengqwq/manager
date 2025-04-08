import { NuqsAdapter } from 'nuqs/adapters/react'
import { ModalStackContainer } from 'rc-modal-sheet/motion'
import { SWRConfig } from 'swr'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <SWRConfig
        value={{
          fetcher: url => fetch(url).then(res => res.json()),
        }}
      >
        <ModalStackContainer>
          {children}
        </ModalStackContainer>
      </SWRConfig>
    </NuqsAdapter>
  )
}
