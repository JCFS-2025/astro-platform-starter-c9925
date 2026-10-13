import type { APIRoute } from 'astro';
import { SETTINGS_KEY, getSettings, sanitize } from '../../../lib/settings';

export const prerender = false;

const json = (dados: unknown, status = 200) =>
    new Response(JSON.stringify(dados), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

export const GET: APIRoute = async ({ locals }) => json(await getSettings(locals.runtime.env.AXIA_KV));

export const PUT: APIRoute = async ({ request, locals }) => {
    const kv = locals.runtime.env.AXIA_KV;
    if (!kv) return json({ erro: 'O armazenamento AXIA_KV não está configurado no Cloudflare.' }, 500);

    let corpo: Record<string, unknown>;
    try {
        corpo = await request.json();
    } catch {
        return json({ erro: 'Dados inválidos.' }, 400);
    }

    const anterior = await getSettings(kv);
    const novo = sanitize(corpo);
    await kv.put(SETTINGS_KEY, JSON.stringify(novo));

    // Apaga logotipos enviados pelo painel que não são mais usados
    const usados = new Set(novo.clientes.map((c) => c.logo));
    const removidos = anterior.clientes.map((c) => c.logo).filter((l) => l.startsWith('/media/') && !usados.has(l));
    await Promise.all(removidos.map((l) => kv.delete(`logo:${l.slice('/media/'.length)}`)));

    return json(novo);
};
