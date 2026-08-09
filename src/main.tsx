import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './night-voyage/App'
import './night-voyage/styles/tokens.css'
import './night-voyage/styles/base.css'
import './night-voyage/styles/controls.css'
import './night-voyage/styles/characters.css'
import './night-voyage/styles/cosmic-stage.css'
import './night-voyage/styles/intro.css'
import './night-voyage/styles/hub.css'
import './night-voyage/styles/journey.css'
import './night-voyage/styles/result.css'
import './night-voyage/styles/film-reel.css'
import './night-voyage/styles/screening-room.css'
import './night-voyage/styles/atlas.css'
import './night-voyage/styles/archive.css'
import './night-voyage/styles/motion.css'
import './night-voyage/styles/mobile.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
