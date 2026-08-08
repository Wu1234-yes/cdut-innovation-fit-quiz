import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const radarHeroSourceUrl = new URL(
  './src/components/RadarHero.tsx',
  import.meta.url,
)
const radarHeroSource = readFileSync(radarHeroSourceUrl, 'utf8')
const radarLicenseMatch = radarHeroSource.match(/^\/\*![\s\S]*?\*\//)

if (!radarLicenseMatch) {
  throw new Error('RadarHero license comment is missing')
}

const radarLicenseNotice = radarLicenseMatch[0]
const configuredBasePath = process.env.VITE_BASE_PATH ?? '/'
const basePathWithLeadingSlash = configuredBasePath.startsWith('/')
  ? configuredBasePath
  : `/${configuredBasePath}`
const basePath = basePathWithLeadingSlash.endsWith('/')
  ? basePathWithLeadingSlash
  : `${basePathWithLeadingSlash}/`

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    {
      enforce: 'post',
      generateBundle(_options, bundle) {
        for (const output of Object.values(bundle)) {
          if (
            output.type === 'chunk' &&
            output.facadeModuleId
              ?.replaceAll('\\', '/')
              .endsWith('/src/components/RadarHero.tsx')
          ) {
            output.code = `${radarLicenseNotice}\n${output.code}`
          }
        }
      },
      name: 'preserve-radar-license-notice',
    },
  ],
})
