import type { APIRoute } from 'astro';

export const prerender = false;

const TIPOS: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };
const MAX_BYTES = 1024 * 1024;

// Recebe um logotipo (já redimensionado no navegador) e devolve a URL pública.
export const POST: APIRoute = async ({ request, locals }) => {
    const kv = locals.runtime.env.AXIA_KV;
    if (!kv) return Response.json({ erro: 'O armazenamento AXIA_KV não está configurado no Cloudflare.' }, { status: 500 });

    const tipo = request.headers.get('content-type')?.split(';')[0] ?? '';
    const ext = TIPOS[tipo];
    if (!ext) return Response.json({ erro: 'Envie uma imagem PNG, JPG ou WebP.' }, { status: 415 });

    const dados = await request.arrayBuffer();
    if (dados.byteLength === 0 || dados.byteLength > MAX_BYTES) {
        return Response.json({ erro: 'A imagem precisa ter até 1 MB.' }, { status: 413 });
    }

    const id = `${crypto.randomUUID()}.${ext}`;
    await kv.put(`logo:${id}`, dados, { metadata: { tipo } });
    return Response.json({ url: `/media/${id}` });
};
