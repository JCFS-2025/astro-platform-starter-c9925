// Configurações gerais do site — edite aqui os dados de contato da Axia Soluções.

export const site = {
    nome: 'Axia Soluções',
    slogan: 'Atendimento, segurança e identidade digital para a sua empresa',
    descricao:
        'Axia Soluções: Axia Chat para atendimento multicanal no WhatsApp, Axia DNS para proteger a internet da empresa e Axia ID, certificado digital ICP-Brasil emitido por videoconferência.',
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
