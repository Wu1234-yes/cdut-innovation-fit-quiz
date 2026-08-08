import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
const configuredBasePath = process.env.VITE_BASE_PATH ?? '/'
const basePathWithLeadingSlash = configuredBasePath.startsWith('/')
  ? configuredBasePath
  : `/${configuredBasePath}`
const basePath = basePathWithLeadingSlash.endsWith('/')
  ? basePathWithLeadingSlash
  : `${basePathWithLeadingSlash}/`

export default defineConfig({
  base: basePath,
  plugins: [react()],
})
