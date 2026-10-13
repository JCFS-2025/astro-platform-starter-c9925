import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// Publicado no Cloudflare Pages (build: `npm run build`, saída: `dist`).
// As páginas leem as configurações do painel /admin, salvas no Cloudflare KV (binding AXIA_KV).
// https://astro.build/config
export default defineConfig({
    site: 'https://axiasolucoes.com.br',
    output: 'static',
    adapter: cloudflare({
        // Em desenvolvimento, simula o KV e as variáveis localmente a partir de wrangler.local.toml e .dev.vars
        platformProxy: { enabled: true, configPath: 'wrangler.local.toml' },
        imageService: 'passthrough'
    }),
    vite: {
        plugins: [tailwindcss()]
    }
});
