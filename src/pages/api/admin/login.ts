import type { APIRoute } from 'astro';
import { COOKIE, criarSessao, iguais, segredoDe } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, cookies, redirect }) => {
    const env = locals.runtime.env;
    if (!env.ADMIN_PASSWORD) return redirect('/admin?erro=config', 303);

    const form = await request.formData();
    const senha = String(form.get('senha') ?? '');
    const segredo = segredoDe(env);

    if (!(await iguais(senha, env.ADMIN_PASSWORD, segredo))) {
        // Atraso para dificultar tentativas em sequência
        await new Promise((r) => setTimeout(r, 1000));
        return redirect('/admin?erro=senha', 303);
    }

    const sessao = await criarSessao(segredo);
    cookies.set(COOKIE, sessao.valor, {
        httpOnly: true,
        secure: new URL(request.url).protocol === 'https:',
        sameSite: 'strict',
        path: '/',
        maxAge: sessao.maxAge
    });
    return redirect('/admin', 303);
};
