# Axia Soluções — site institucional

Site da **Axia Soluções** e dos produtos **Axia Chat** (atendimento multicanal), **Axia DNS** (filtro DNS e segurança) e **Axia ID** (certificado digital ICP-Brasil).

Feito com [Astro](https://astro.build) + Tailwind CSS, gerado como site **estático** e pronto para o **Cloudflare Pages**.

## Rodar localmente

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # gera a pasta dist/
npm run preview  # visualiza o build
```

## Publicar no Cloudflare Pages

1. No painel da Cloudflare: **Workers & Pages → Create → Pages → Connect to Git** e selecione este repositório.
2. Configurações de build:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - Variável de ambiente (opcional): `NODE_VERSION` = `22`
3. Clique em **Save and Deploy**. Depois, em **Custom domains**, adicione o domínio da empresa.

Os arquivos `public/_headers` (cabeçalhos de segurança e cache) e `src/pages/404.astro` são reconhecidos automaticamente pelo Cloudflare Pages.

## O que editar antes de publicar

| O quê | Onde |
| --- | --- |
| Número do WhatsApp, e-mail, telefone, cidade | `src/data/site.ts` |
| Clientes do carrossel (nomes e logotipos) | `src/data/clientes.ts` + imagens em `public/clientes/` |
| Domínio do site | `astro.config.mjs` (`site`), `public/robots.txt` e `public/sitemap.xml` |
| Textos das seções | `src/pages/index.astro` |

## Estrutura

```
src/
  components/   Header, Footer, botão flutuante do WhatsApp, carrossel de clientes, ícones
  data/         Dados de contato e lista de clientes
  layouts/      Layout base com SEO (meta tags, Open Graph, schema.org)
  pages/        Página inicial e 404
  styles/       Estilos globais (Tailwind)
public/         Favicon, imagem de compartilhamento, robots, sitemap, _headers
```
