import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <div className='bg-accent'>test</div>
    </StrictMode>,
)
