// Configurações editáveis pelo painel /admin.
// Ficam salvas no Cloudflare KV (binding AXIA_KV). Sem o KV configurado, o site usa os valores padrão abaixo.

export interface Cliente {
    id: string;
    nome: string;
    segmento: string;
    logo: string; // URL do logotipo (/media/... enviado pelo painel ou /clientes/... na pasta public). Vazio = mostra o nome.
}

export interface Settings {
    whatsapp: string;
    whatsappMensagem: string;
    telefoneExibicao: string;
    email: string;
    cidade: string;
    horario: string;
    cnpj: string;
    instagram: string;
    facebook: string;
    linkedin: string;
    youtube: string;
    balaoAtivo: boolean;
    balaoTitulo: string;
    balaoTexto: string;
    balaoAtraso: number;
    heroSegundos: number;
    clientesTitulo: string;
    clientes: Cliente[];
    seoTitulo: string;
    seoDescricao: string;
}

export const SETTINGS_KEY = 'settings';
export const MAX_CLIENTES = 40;

export const defaults: Settings = {
    whatsapp: '5500000000000',
    whatsappMensagem: 'Olá! Vim pelo site da Axia Soluções e gostaria de mais informações.',
    telefoneExibicao: '(00) 00000-0000',
    email: 'contato@axiasolucoes.com.br',
    cidade: 'Brasil',
    horario: 'Segunda a sexta, das 8h às 18h',
    cnpj: '',
    instagram: '',
    facebook: '',
    linkedin: '',
    youtube: '',
    balaoAtivo: true,
    balaoTitulo: 'Olá! 👋',
    balaoTexto: 'Precisa de atendimento, DNS ou certificado digital? Fale com a Axia pelo WhatsApp.',
    balaoAtraso: 4,
    heroSegundos: 7,
    clientesTitulo: 'Empresas que atendem melhor com o Axia Chat',
    clientes: [
        { id: 'c1', nome: 'Clínicas e consultórios', segmento: 'Saúde', logo: '' },
        { id: 'c2', nome: 'Imobiliárias', segmento: 'Imóveis', logo: '' },
        { id: 'c3', nome: 'Escritórios de contabilidade', segmento: 'Serviços', logo: '' },
        { id: 'c4', nome: 'Lojas e e-commerce', segmento: 'Varejo', logo: '' },
        { id: 'c5', nome: 'Provedores de internet', segmento: 'Telecom', logo: '' },
        { id: 'c6', nome: 'Escolas e cursos', segmento: 'Educação', logo: '' },
        { id: 'c7', nome: 'Concessionárias', segmento: 'Automotivo', logo: '' },
        { id: 'c8', nome: 'Escritórios de advocacia', segmento: 'Jurídico', logo: '' },
        { id: 'c9', nome: 'Restaurantes e delivery', segmento: 'Alimentação', logo: '' },
        { id: 'c10', nome: 'Academias', segmento: 'Bem-estar', logo: '' }
    ],
    seoTitulo: 'Axia Soluções | Axia Chat, Axia DNS e Axia ID',
    seoDescricao:
        'Axia Soluções: Axia Chat para atendimento multicanal no WhatsApp, Axia DNS para proteger a internet da empresa e Axia ID, certificado digital ICP-Brasil emitido por videoconferência.'
};

export async function getSettings(kv: KVNamespace | undefined): Promise<Settings> {
    if (!kv) return defaults;
    try {
        const salvo = await kv.get<Partial<Settings>>(SETTINGS_KEY, { type: 'json', cacheTtl: 60 });
        return salvo ? sanitize({ ...defaults, ...salvo }) : defaults;
    } catch {
        return defaults;
    }
}

const texto = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const numero = (v: unknown, min: number, max: number, padrao: number) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : padrao;
};
const url = (v: unknown) => {
    const s = texto(v, 300);
    if (!s) return '';
    try {
        const u = new URL(s.startsWith('http') ? s : `https://${s}`);
        return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : '';
    } catch {
        return '';
    }
};
const logo = (v: unknown) => {
    const s = texto(v, 300);
    return /^\/(media|clientes)\/[\w.\-]+$/.test(s) ? s : '';
};

/** Valida e normaliza o que vem do painel (ou do KV) para nunca quebrar o site. */
export function sanitize(input: Record<string, unknown>): Settings {
    const s = { ...defaults, ...input };
    const clientes = Array.isArray(s.clientes) ? s.clientes : [];
    return {
        whatsapp: texto(s.whatsapp, 20).replace(/\D/g, ''),
        whatsappMensagem: texto(s.whatsappMensagem, 300),
        telefoneExibicao: texto(s.telefoneExibicao, 40),
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto(s.email, 120)) ? texto(s.email, 120) : '',
        cidade: texto(s.cidade, 120),
        horario: texto(s.horario, 120),
        cnpj: texto(s.cnpj, 30),
        instagram: url(s.instagram),
        facebook: url(s.facebook),
        linkedin: url(s.linkedin),
        youtube: url(s.youtube),
        balaoAtivo: s.balaoAtivo === true || s.balaoAtivo === 'true',
        balaoTitulo: texto(s.balaoTitulo, 60),
        balaoTexto: texto(s.balaoTexto, 200),
        balaoAtraso: numero(s.balaoAtraso, 0, 60, defaults.balaoAtraso),
        heroSegundos: numero(s.heroSegundos, 3, 30, defaults.heroSegundos),
        clientesTitulo: texto(s.clientesTitulo, 100),
        clientes: clientes
            .slice(0, MAX_CLIENTES)
            .map((c: any, i: number) => ({
                id: texto(c?.id, 40).replace(/[^\w-]/g, '') || `c${i + 1}`,
                nome: texto(c?.nome, 80),
                segmento: texto(c?.segmento, 60),
                logo: logo(c?.logo)
            }))
            .filter((c) => c.nome || c.logo),
        seoTitulo: texto(s.seoTitulo, 90) || defaults.seoTitulo,
        seoDescricao: texto(s.seoDescricao, 300) || defaults.seoDescricao
    };
}

/** Link do WhatsApp com mensagem pronta. Sem número cadastrado, leva ao formulário de contato. */
export function linkWhatsApp(settings: Settings, mensagem: string = settings.whatsappMensagem) {
    if (!settings.whatsapp) return '/#contato';
    return `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}
