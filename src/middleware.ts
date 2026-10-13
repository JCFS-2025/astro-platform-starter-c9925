import { defineMiddleware } from 'astro:middleware';
import { getSettings } from './lib/settings';
import { COOKIE, segredoDe, sessaoValida } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
    const env: Env = (context.locals as any).runtime?.env ?? {};
    const { pathname } = context.url;

    // Páginas pré-renderizadas no build não têm acesso ao Cloudflare: usam os valores padrão.
    context.locals.settings = await getSettings(env.AXIA_KV);
    context.locals.admin = false;

    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
        context.locals.admin = await sessaoValida(context.cookies.get(COOKIE)?.value, segredoDe(env));

        // Proteção contra envios de outros sites (CSRF)
        if (context.request.method !== 'GET') {
            const origem = context.request.headers.get('origin');
            if (origem && origem !== context.url.origin) return new Response('Origem não permitida', { status: 403 });
        }

        const publico = pathname === '/admin' || pathname === '/admin/' || pathname === '/api/admin/login';
        if (!publico && !context.locals.admin) return new Response('Não autorizado', { status: 401 });
    }

    const resposta = await next();
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
        resposta.headers.set('Cache-Control', 'no-store');
        resposta.headers.set('X-Robots-Tag', 'noindex, nofollow');
    }
    return resposta;
});
