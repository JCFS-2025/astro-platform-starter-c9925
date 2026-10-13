// Clientes exibidos no carrossel da seção Infochat.
//
// Para usar logotipos reais: coloque o arquivo em /public/clientes/ (PNG ou SVG,
// de preferência com fundo transparente) e informe o caminho em `logo`,
// por exemplo: { nome: 'Empresa X', logo: '/clientes/empresa-x.png' }.
// Sem `logo`, o nome é exibido em formato de selo.
//
// TODO: substituir pelos clientes reais que utilizam o Infochat.

export interface Cliente {
    nome: string;
    segmento?: string;
    logo?: string;
}

export const clientes: Cliente[] = [
    { nome: 'Clínicas e consultórios', segmento: 'Saúde' },
    { nome: 'Imobiliárias', segmento: 'Imóveis' },
    { nome: 'Escritórios de contabilidade', segmento: 'Serviços' },
    { nome: 'Lojas e e-commerce', segmento: 'Varejo' },
    { nome: 'Provedores de internet', segmento: 'Telecom' },
    { nome: 'Escolas e cursos', segmento: 'Educação' },
    { nome: 'Concessionárias', segmento: 'Automotivo' },
    { nome: 'Escritórios de advocacia', segmento: 'Jurídico' },
    { nome: 'Restaurantes e delivery', segmento: 'Alimentação' },
    { nome: 'Academias', segmento: 'Bem-estar' }
];
