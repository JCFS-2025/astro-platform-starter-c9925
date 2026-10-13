// Configurações gerais do site — edite aqui os dados de contato da Axia Soluções.

export const site = {
    nome: 'Axia Soluções',
    slogan: 'Atendimento, segurança e identidade digital para a sua empresa',
    descricao:
        'A Axia Soluções oferece plataforma de atendimento multicanal (Infochat), filtro DNS para segurança da internet (Lumiun DNS) e certificado digital ICP-Brasil (ID Federal) para empresas e profissionais.',
    // Número do WhatsApp no formato internacional, somente dígitos (55 + DDD + número).
    // TODO: substituir pelo número real da Axia Soluções.
    whatsapp: '5500000000000',
    whatsappMensagem: 'Olá! Vim pelo site da Axia Soluções e gostaria de mais informações.',
    // TODO: substituir pelos dados reais.
    email: 'contato@axiasolucoes.com.br',
    telefoneExibicao: '(00) 00000-0000',
    cidade: 'Brasil',
    instagram: '',
    linkedin: ''
};

export function linkWhatsApp(mensagem: string = site.whatsappMensagem) {
    return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}
