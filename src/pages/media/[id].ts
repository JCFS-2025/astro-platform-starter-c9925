import type { APIRoute } from 'astro';

export const prerender = false;

// Serve os logotipos enviados pelo painel. Cada envio tem um nome único, então pode ficar em cache para sempre.
export const GET: APIRoute = async ({ params, locals }) => {
    const id = params.id ?? '';
    const kv = locals.runtime.env.AXIA_KV;
    if (!kv || !/^[\w-]+\.(png|jpg|webp)$/.test(id)) return new Response('Não encontrado', { status: 404 });

    const { value, metadata } = await kv.getWithMetadata<{ tipo: string }>(`logo:${id}`, { type: 'arrayBuffer', cacheTtl: 3600 });
    if (!value) return new Response('Não encontrado', { status: 404 });

    return new Response(value, {
        headers: {
            'Content-Type': metadata?.tipo ?? 'image/png',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'X-Content-Type-Options': 'nosniff'
        }
    });
};
