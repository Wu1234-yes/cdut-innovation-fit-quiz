import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './voyage/App'
import './voyage/styles/tokens.css'
import './voyage/styles/base.css'
import './voyage/styles/controls.css'
import './voyage/styles/characters.css'
import './voyage/styles/cosmic-stage.css'
import './voyage/styles/intro.css'
import './voyage/styles/hub.css'
import './voyage/styles/journey.css'
import './voyage/styles/result.css'
import './voyage/styles/film-reel.css'
import './voyage/styles/screening-room.css'
import './voyage/styles/atlas.css'
import './voyage/styles/archive.css'
import './voyage/styles/motion.css'
import './voyage/styles/mobile.css'
import './voyage/styles/new-voyage.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
