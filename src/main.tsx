import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Context } from '@aivenio/aquarium'
import '@aivenio/aquarium/dist/styles.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Context>
      <App />
    </Context>
  </StrictMode>,
)
