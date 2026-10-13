import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Site estático: publicado no Cloudflare Pages (build: `npm run build`, saída: `dist`)
// https://astro.build/config
export default defineConfig({
    site: 'https://axiasolucoes.com.br',
    output: 'static',
    vite: {
        plugins: [tailwindcss()]
    }
});
