# Axia Soluções — site institucional

Site da **Axia Soluções** e dos produtos **Axia Chat** (atendimento multicanal), **Axia DNS** (filtro DNS e segurança) e **Axia ID** (certificado digital ICP-Brasil).

Feito com [Astro](https://astro.build) + Tailwind CSS e publicado no **Cloudflare Pages**. Contatos, clientes do carrossel e outros dados são editados pelo **painel em `/admin`**, sem mexer no código.

## Painel gerenciador (`/admin`)

Acesse `https://seu-dominio/admin` e entre com a senha de administrador. No painel é possível alterar:

| Seção | O que muda no site |
| --- | --- |
| Contato | Número do WhatsApp (todos os botões e o balão), mensagem inicial, telefone, e-mail, horário, cidade e CNPJ do rodapé |
| Redes sociais | Ícones de Instagram, Facebook, LinkedIn e YouTube no rodapé |
| Balão do WhatsApp | Liga/desliga, título, texto e quanto tempo depois ele aparece |
| Tela inicial | Tempo de cada slide do carrossel de produtos |
| Clientes | Título e lista do carrossel de clientes: adicionar, remover, reordenar e enviar logotipos |
| Google e redes | Título e descrição que aparecem no Google e ao compartilhar o link |

As alterações aparecem no site em até 1 minuto depois de salvar. Os logotipos enviados são redimensionados automaticamente.

## Publicar no Cloudflare Pages

1. **Conectar o repositório:** no painel da Cloudflare, vá em **Workers & Pages → Create → Pages → Connect to Git** e selecione este repositório.
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
2. **Criar o armazenamento do painel:** em **Storage & Databases → KV → Create**, crie um namespace (ex.: `axia-site`).
3. **Ligar o armazenamento ao site:** no projeto, abra **Settings → Bindings → Add → KV namespace** e preencha:
   - Variable name: `AXIA_KV`
   - KV namespace: o que você criou no passo 2
4. **Definir a senha do painel:** em **Settings → Variables and Secrets**, adicione como **Secret**:
   - `ADMIN_PASSWORD`: a senha para entrar no painel
   - `SESSION_SECRET`: um texto longo e aleatório (protege o login; se mudar, todos precisam entrar de novo)
5. **Publicar de novo:** em **Deployments**, use **Retry deployment** (ou faça um novo commit) para as configurações valerem.

Sem o passo 3 o site funciona com os dados padrão de `src/lib/settings.ts`, mas o painel não consegue salvar. Sem o passo 4 o painel fica bloqueado.

## Rodar localmente

```bash
npm install
cp .dev.vars.example .dev.vars   # senha do painel em desenvolvimento
npm run dev                      # http://localhost:4321  (painel em /admin)
npm run preview                  # gera o build e roda como no Cloudflare: http://localhost:8788
```

Em desenvolvimento, o armazenamento é simulado localmente (pasta `.wrangler/`).

## Logo

Arquivos em `public/`:

- `logo.svg` / `logo.png`: logo completo para fundo claro
- `logo-branco.svg` / `logo-branco.png`: logo completo para fundo escuro
- `logo-simbolo.svg`: só o símbolo (também usado como favicon)
- `logo-icone.svg` / `logo-icone-512.png`: símbolo em ícone quadrado, para foto de perfil (WhatsApp, Instagram etc.)

## Estrutura

```
src/
  components/   Header, Footer, carrossel da tela inicial, botão do WhatsApp, carrossel de clientes, ícones
  layouts/      Layout base com SEO (meta tags, Open Graph, schema.org)
  lib/          Configurações do painel (settings.ts), login (auth.ts) e lógica do painel (painel.ts)
  pages/        Página inicial, 404, painel (/admin), API do painel (/api/admin) e logotipos enviados (/media)
  middleware.ts Carrega as configurações em cada página e protege o painel
  styles/       Estilos globais (Tailwind)
public/         Logo, favicon, imagem de compartilhamento, robots, sitemap, _headers
```

Textos fixos das seções ficam em `src/pages/index.astro` e `src/components/HeroCarousel.astro`.
