// Sessão do painel: cookie assinado com HMAC-SHA256 (Web Crypto, sem dependências).

export const COOKIE = 'axia_admin';
const DURACAO_SEGUNDOS = 12 * 60 * 60;

const enc = new TextEncoder();

async function chave(segredo: string) {
    return crypto.subtle.importKey('raw', enc.encode(segredo), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

async function assinar(valor: string, segredo: string) {
    return hex(await crypto.subtle.sign('HMAC', await chave(segredo), enc.encode(valor)));
}

/** Compara textos em tempo constante (via HMAC de ambos). */
export async function iguais(a: string, b: string, segredo: string) {
    const [ha, hb] = await Promise.all([assinar(a, segredo), assinar(b, segredo)]);
    let diff = ha.length ^ hb.length;
    for (let i = 0; i < Math.min(ha.length, hb.length); i++) diff |= ha.charCodeAt(i) ^ hb.charCodeAt(i);
    return diff === 0;
}

export function segredoDe(env: Env) {
    return env.SESSION_SECRET || env.ADMIN_PASSWORD || '';
}

export async function criarSessao(segredo: string) {
    const exp = Math.floor(Date.now() / 1000) + DURACAO_SEGUNDOS;
    const valor = `${exp}.${await assinar(String(exp), segredo)}`;
    return { valor, maxAge: DURACAO_SEGUNDOS };
}

export async function sessaoValida(token: string | undefined, segredo: string) {
    if (!token || !segredo) return false;
    const [exp, assinatura] = token.split('.');
    if (!exp || !assinatura || Number(exp) < Date.now() / 1000) return false;
    return iguais(assinatura, await assinar(exp, segredo), segredo);
}
