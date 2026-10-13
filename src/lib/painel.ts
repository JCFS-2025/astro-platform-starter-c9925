// Lógica do painel /admin (roda no navegador).
import type { Cliente, Settings } from './settings';

const MAX_LARGURA_LOGO = 480;
const MAX_ALTURA_LOGO = 200;

export function iniciarPainel() {
    const form = document.getElementById('painel') as HTMLFormElement;
    const status = document.getElementById('status')!;
    const salvar = document.getElementById('salvar') as HTMLButtonElement;
    const lista = document.getElementById('lista-clientes') as HTMLUListElement;
    const modelo = document.getElementById('modelo-cliente') as HTMLTemplateElement;
    const semClientes = document.getElementById('sem-clientes')!;
    const contador = document.getElementById('contador-clientes')!;
    const adicionar = document.getElementById('adicionar-cliente') as HTMLButtonElement;
    const testarWhatsapp = document.getElementById('testar-whatsapp') as HTMLAnchorElement;
    const maxClientes: number = (window as any).__MAX_CLIENTES ?? 40;
    const podeSalvar = !salvar.disabled;

    let dados: Settings = JSON.parse(document.getElementById('dados')!.textContent || '{}');
    let alterado = false;
    let enviandoLogos = 0;

    // ---------- Campos simples ----------
    const campos = () => [...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[name]')];

    function preencher() {
        for (const el of campos()) {
            const valor = (dados as any)[el.name];
            if (el instanceof HTMLInputElement && el.type === 'checkbox') el.checked = Boolean(valor);
            else el.value = valor ?? '';
        }
        renderClientes();
        atualizarPrevias();
    }

    function lerCampos() {
        for (const el of campos()) {
            const chave = el.name as keyof Settings;
            if (el instanceof HTMLInputElement && el.type === 'checkbox') (dados as any)[chave] = el.checked;
            else if (el instanceof HTMLInputElement && el.type === 'number') (dados as any)[chave] = Number(el.value);
            else (dados as any)[chave] = el.value;
        }
    }

    function atualizarPrevias() {
        lerCampos();
        document.querySelectorAll<HTMLElement>('[data-previa]').forEach((el) => {
            el.textContent = String((dados as any)[el.dataset.previa!] ?? '');
        });
        document.querySelectorAll<HTMLElement>('[data-contador]').forEach((el) => {
            const n = String((dados as any)[el.dataset.contador!] ?? '').length;
            el.textContent = `(${n} caracteres)`;
        });
        document.getElementById('previa-balao')!.classList.toggle('opacity-40', !dados.balaoAtivo);
        const numero = dados.whatsapp.replace(/\D/g, '');
        testarWhatsapp.href = numero ? `https://wa.me/${numero}?text=${encodeURIComponent(dados.whatsappMensagem)}` : '#';
        testarWhatsapp.classList.toggle('pointer-events-none', !numero);
        testarWhatsapp.classList.toggle('opacity-40', !numero);
    }

    function marcarAlterado() {
        alterado = true;
        mostrarStatus('Alterações não salvas', 'aviso');
    }

    function mostrarStatus(texto: string, tipo: 'ok' | 'aviso' | 'erro' | 'neutro' = 'neutro') {
        const cores = { ok: 'text-emerald-600', aviso: 'text-amber-600', erro: 'text-rose-600', neutro: 'text-slate-500' };
        status.className = `flex items-center gap-2 text-sm ${cores[tipo]}`;
        status.textContent = texto;
    }

    form.addEventListener('input', (e) => {
        const alvo = e.target as HTMLElement;
        if (alvo.closest('#lista-clientes')) return;
        atualizarPrevias();
        marcarAlterado();
    });

    // ---------- Clientes ----------
    function novoId() {
        return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    }

    function renderClientes() {
        lista.replaceChildren();
        dados.clientes.forEach((c, i) => lista.append(itemCliente(c, i)));
        semClientes.classList.toggle('hidden', dados.clientes.length > 0);
        contador.textContent = `${dados.clientes.length} de ${maxClientes}`;
        adicionar.disabled = dados.clientes.length >= maxClientes;
        adicionar.classList.toggle('opacity-40', adicionar.disabled);
    }

    function itemCliente(c: Cliente, i: number) {
        const li = modelo.content.firstElementChild!.cloneNode(true) as HTMLLIElement;
        const nome = li.querySelector<HTMLInputElement>('.cliente-nome')!;
        const segmento = li.querySelector<HTMLInputElement>('.cliente-segmento')!;
        const img = li.querySelector<HTMLImageElement>('.logo-img')!;
        const vazio = li.querySelector<SVGElement>('.logo-vazio')!;
        const arquivo = li.querySelector<HTMLInputElement>('.logo-arquivo')!;
        const remover = li.querySelector<HTMLButtonElement>('.logo-remover')!;
        const acao = li.querySelector<HTMLElement>('.logo-acao')!;

        nome.value = c.nome;
        segmento.value = c.segmento;
        if (c.logo) {
            img.src = c.logo;
            img.alt = c.nome;
            img.classList.remove('hidden');
            vazio.classList.add('hidden');
            remover.classList.remove('hidden');
            acao.textContent = 'Trocar';
        }

        nome.addEventListener('input', () => {
            c.nome = nome.value;
            marcarAlterado();
        });
        segmento.addEventListener('input', () => {
            c.segmento = segmento.value;
            marcarAlterado();
        });

        arquivo.addEventListener('change', async () => {
            const file = arquivo.files?.[0];
            if (!file) return;
            enviandoLogos++;
            acao.textContent = 'Enviando…';
            mostrarStatus('Enviando logotipo…');
            try {
                c.logo = await enviarLogo(file);
                marcarAlterado();
                renderClientes();
            } catch (e) {
                mostrarStatus((e as Error).message, 'erro');
                acao.textContent = c.logo ? 'Trocar' : 'Logo';
            } finally {
                enviandoLogos--;
            }
        });
        remover.addEventListener('click', () => {
            c.logo = '';
            marcarAlterado();
            renderClientes();
        });

        const cima = li.querySelector<HTMLButtonElement>('.mover-cima')!;
        const baixo = li.querySelector<HTMLButtonElement>('.mover-baixo')!;
        cima.disabled = i === 0;
        baixo.disabled = i === dados.clientes.length - 1;
        cima.addEventListener('click', () => mover(i, -1));
        baixo.addEventListener('click', () => mover(i, 1));
        li.querySelector('.excluir')!.addEventListener('click', () => {
            dados.clientes.splice(i, 1);
            marcarAlterado();
            renderClientes();
        });
        return li;
    }

    function mover(i: number, delta: number) {
        const j = i + delta;
        if (j < 0 || j >= dados.clientes.length) return;
        [dados.clientes[i], dados.clientes[j]] = [dados.clientes[j], dados.clientes[i]];
        marcarAlterado();
        renderClientes();
        lista.children[j]?.querySelector<HTMLButtonElement>(delta < 0 ? '.mover-cima' : '.mover-baixo')?.focus();
    }

    adicionar.addEventListener('click', () => {
        if (dados.clientes.length >= maxClientes) return;
        dados.clientes.push({ id: novoId(), nome: '', segmento: '', logo: '' });
        marcarAlterado();
        renderClientes();
        lista.lastElementChild?.querySelector<HTMLInputElement>('.cliente-nome')?.focus();
    });

    // Redimensiona no navegador e converte para WebP/PNG antes de enviar
    async function enviarLogo(file: File): Promise<string> {
        if (!file.type.startsWith('image/')) throw new Error('Escolha um arquivo de imagem.');
        const url = URL.createObjectURL(file);
        try {
            const imagem = await new Promise<HTMLImageElement>((ok, falha) => {
                const im = new Image();
                im.onload = () => ok(im);
                im.onerror = () => falha(new Error('Não foi possível abrir essa imagem.'));
                im.src = url;
            });
            const largura = imagem.naturalWidth || MAX_LARGURA_LOGO;
            const altura = imagem.naturalHeight || MAX_ALTURA_LOGO;
            const escala = Math.min(1, MAX_LARGURA_LOGO / largura, MAX_ALTURA_LOGO / altura);
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(largura * escala));
            canvas.height = Math.max(1, Math.round(altura * escala));
            canvas.getContext('2d')!.drawImage(imagem, 0, 0, canvas.width, canvas.height);
            const blob =
                (await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/webp', 0.92))) ??
                (await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/png')));
            if (!blob) throw new Error('Não foi possível processar essa imagem.');

            const resp = await fetch('/api/admin/upload', { method: 'POST', headers: { 'Content-Type': blob.type }, body: blob });
            const corpo = await resp.json().catch(() => ({}));
            if (resp.status === 401) throw new Error('Sua sessão expirou. Entre novamente.');
            if (!resp.ok) throw new Error(corpo.erro || 'Não foi possível enviar o logotipo.');
            return corpo.url;
        } finally {
            URL.revokeObjectURL(url);
        }
    }

    // ---------- Salvar ----------
    function validar(): string | null {
        const numero = dados.whatsapp.replace(/\D/g, '');
        if (numero && (numero.length < 12 || numero.length > 13)) return 'Confira o número do WhatsApp: use 55 + DDD + número (12 ou 13 dígitos).';
        if (dados.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) return 'Confira o e-mail digitado.';
        const semNome = dados.clientes.findIndex((c) => !c.nome.trim());
        if (semNome >= 0) return `Preencha o nome do cliente ${semNome + 1} (ele também é usado como texto alternativo do logotipo).`;
        return null;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!podeSalvar) return;
        if (enviandoLogos > 0) return mostrarStatus('Aguarde o envio do logotipo terminar.', 'aviso');
        lerCampos();
        const problema = validar();
        if (problema) return mostrarStatus(problema, 'erro');

        salvar.disabled = true;
        mostrarStatus('Salvando…');
        try {
            const resp = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            const corpo = await resp.json().catch(() => ({}));
            if (resp.status === 401) throw new Error('Sua sessão expirou. Recarregue a página e entre novamente.');
            if (!resp.ok) throw new Error(corpo.erro || 'Não foi possível salvar. Tente novamente.');
            dados = corpo;
            preencher();
            alterado = false;
            mostrarStatus('Salvo! O site é atualizado em até 1 minuto.', 'ok');
        } catch (err) {
            mostrarStatus((err as Error).message, 'erro');
        } finally {
            salvar.disabled = false;
        }
    });

    window.addEventListener('beforeunload', (e) => {
        if (alterado) e.preventDefault();
    });

    preencher();
}
