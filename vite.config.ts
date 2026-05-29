# Generate the updated vite.config.ts with PWA support
vite_config = '''import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'unsplash-images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 24 * 60 * 60
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Palacio de Oro - Luxury Resort',
        short_name: 'Palacio de Oro',
        description: 'Luxury Resort & Fine Dining - Book rooms, order food, and experience golden paradise.',
        theme_color: '#D4AF37',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon-72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icon-96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icon-128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icon-144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icon-152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icon-384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any'
          }
        ],
        categories: ['travel', 'food', 'lifestyle'],
        screenshots: [
          {
            src: '/screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: '/screenshot-narrow.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
'''

with open('/mnt/agents/output/vite.config.ts', 'w', encoding='utf-8') as f:
    f.write(vite_config)

# Also generate the package.json dependency update instructions
instructions = '''
=== PWA SETUP FOR PALACIO DE ORO ===

Since wala kang terminal, eto ang gagawin mo:

1. COPY PASTE ang bagong vite.config.ts sa repo mo (replace mo yung luma)

2. Sa GitHub web interface, i-edit ang package.json at idagdag ito sa "devDependencies":

   "vite-plugin-pwa": "^0.21.0"

   (katabi ng ibang devDependencies, tapos lagyan ng comma)

3. Gawan mo ng icons folder sa public/:
   - Gawan mo ng simpleng gold icon (pwedeng text lang na "P" sa gold background)
   - I-generate mo sa https://favicon.io/ or https://www.pwabuilder.com/imageGenerator
   - Sizes needed: 72, 96, 128, 144, 152, 192, 384, 512
   - Ilagay sa public/ folder (e.g., public/icon-192.png)

4. Sa index.html, idagdag ito sa <head>:
   <meta name="theme-color" content="#D4AF37">
   <meta name="apple-mobile-web-app-capable" content="yes">
   <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

5. Pag may laptop ka na (August):
   npm install
   npm run build
   git push
   Vercel auto-deploy

6. Test: Visit mo yung live URL sa Chrome Android, may lalabas na "Add to Home Screen"
'''

with open('/mnt/agents/output/PWA_SETUP_INSTRUCTIONS.txt', 'w', encoding='utf-8') as f:
    f.write(instructions)

print("Done! Generated files:")
print("1. vite.config.ts")
print("2. PWA_SETUP_INSTRUCTIONS.txt")
