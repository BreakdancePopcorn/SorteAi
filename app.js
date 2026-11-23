const LIMITE_QUANTIDADE = 100;

let modo = 'numeros';   // 'numeros' ou 'nomes'

const elem = id => document.getElementById(id);

/* ---------- Slider de quantidade ---------- */
function pintarSlider() {
    const slider = elem('quantidadeSlider');
    const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.setProperty('--pct', pct + '%');
}

function aplicarLimite() {
    const campo = elem('quantidade');
    const slider = elem('quantidadeSlider');

    if (elem('optSemLimite').checked) {
        campo.removeAttribute('max');
    } else {
        campo.max = LIMITE_QUANTIDADE;
        if (parseInt(campo.value) > LIMITE_QUANTIDADE) campo.value = LIMITE_QUANTIDADE;
    }
    slider.value = Math.min(parseInt(campo.value) || 1, LIMITE_QUANTIDADE);
    pintarSlider();
}

elem('quantidadeSlider').addEventListener('input', () => {
    elem('quantidade').value = elem('quantidadeSlider').value;
    pintarSlider();
});

elem('quantidade').addEventListener('input', () => {
    const campo = elem('quantidade');
    if (!elem('optSemLimite').checked && parseInt(campo.value) > LIMITE_QUANTIDADE) {
        campo.value = LIMITE_QUANTIDADE;
    }
    elem('quantidadeSlider').value = Math.min(parseInt(campo.value) || 1, LIMITE_QUANTIDADE);
    pintarSlider();
});

elem('optSemLimite').addEventListener('change', aplicarLimite);

/* ---------- Modo: números / nomes ---------- */
function definirModo(novoModo) {
    modo = novoModo;

    document.querySelectorAll('.modo__btn').forEach(botao => {
        const ativo = botao.dataset.modo === modo;
        botao.classList.toggle('modo__btn--ativo', ativo);
        botao.setAttribute('aria-pressed', String(ativo));
    });

    elem('campos-numeros').hidden = modo !== 'numeros';
    elem('campo-nomes').hidden = modo !== 'nomes';

    mostrarTexto(textoVazio());
}

document.querySelectorAll('.modo__btn').forEach(botao => {
    botao.addEventListener('click', () => definirModo(botao.dataset.modo));
});

/* ---------- Lista de nomes ---------- */
function lerNomes() {
    return elem('nomes').value
        .split('\n')
        .map(nome => nome.trim())
        .filter(nome => nome !== '');
}

function atualizarContador() {
    const total = lerNomes().length;
    elem('contador-nomes').textContent = total === 1 ? '1 nome' : `${total} nomes`;
}

elem('nomes').addEventListener('input', atualizarContador);

/* ---------- Sorteio ---------- */
function sortear() {
    const quantidade = parseInt(elem('quantidade').value);
    const naoRepetir = elem('optNaoRepetir').checked;

    if (!quantidade || quantidade < 1) {
        alert('Informe a quantidade a ser sorteada (mínimo 1).');
        return;
    }

    if (!elem('optSemLimite').checked && quantidade > LIMITE_QUANTIDADE) {
        alert(`A quantidade máxima é ${LIMITE_QUANTIDADE}. Ative "Desbloquear limite" para sortear mais.`);
        return;
    }

    const sorteados = modo === 'nomes'
        ? sortearNomes(quantidade, naoRepetir)
        : sortearNumeros(quantidade, naoRepetir);

    if (!sorteados) return;   // houve erro; a mensagem já foi mostrada

    if (elem('optOrdenar').checked) {
        if (modo === 'nomes') {
            sorteados.sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
        } else {
            sorteados.sort((a, b) => a - b);
        }
    }

    mostrarResultado(sorteados);
    statusBotao();
}

function sortearNumeros(quantidade, naoRepetir) {
    const de = parseInt(elem('de').value);
    const ate = parseInt(elem('ate').value);

    if (isNaN(de) || isNaN(ate)) {
        alert('Preencha os campos "Do número" e "Até o número".');
        return null;
    }

    if (de >= ate) {
        alert(`O número inicial (${de}) precisa ser menor que o final (${ate}).`);
        return null;
    }

    if (naoRepetir && quantidade > (ate - de + 1)) {
        alert(`De ${de} a ${ate} só existem ${ate - de + 1} números. Diminua a quantidade ou desative "Não repetir".`);
        return null;
    }

    const sorteados = [];
    const usados = new Set();

    for (let i = 0; i < quantidade; i++) {
        let numero = aleatorio(de, ate);

        if (naoRepetir) {
            while (usados.has(numero)) {
                numero = aleatorio(de, ate);
            }
            usados.add(numero);
        }

        sorteados.push(numero);
    }

    return sorteados;
}

function sortearNomes(quantidade, naoRepetir) {
    const nomes = lerNomes();

    if (nomes.length === 0) {
        alert('Digite pelo menos um nome (um por linha).');
        return null;
    }

    if (naoRepetir && quantidade > nomes.length) {
        alert(`Você digitou ${nomes.length} nome(s). Diminua a quantidade ou desative "Não repetir".`);
        return null;
    }

    if (naoRepetir) {
        // Embaralha só as primeiras posições (Fisher-Yates parcial)
        const copia = [...nomes];
        for (let i = 0; i < quantidade; i++) {
            const j = i + Math.floor(Math.random() * (copia.length - i));
            [copia[i], copia[j]] = [copia[j], copia[i]];
        }
        return copia.slice(0, quantidade);
    }

    // Com repetição: cada sorteio escolhe qualquer nome da lista
    const sorteados = [];
    for (let i = 0; i < quantidade; i++) {
        sorteados.push(nomes[Math.floor(Math.random() * nomes.length)]);
    }
    return sorteados;
}

// Intervalo inclusivo: o "Até o número" também pode ser sorteado
function aleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ---------- Exibição ---------- */
function escaparHtml(texto) {
    return String(texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function textoVazio() {
    return `${modo === 'nomes' ? 'Nomes' : 'Números'} sorteados: nenhum até agora`;
}

function mostrarResultado(sorteados) {
    const titulo = modo === 'nomes' ? 'Nomes' : 'Números';
    mostrarTexto(`${titulo} sorteados: ${sorteados.map(escaparHtml).join(', ')}`);
}

function mostrarTexto(texto) {
    elem('resultado').innerHTML = `<label class="texto__paragrafo">${texto}</label>`;
}

/* ---------- Reiniciar ---------- */
function reiniciar() {
    limpar();

    const voltar = elem('btn-reiniciar');
    if (voltar.classList.contains('container__botao')) {
        voltar.classList.remove('container__botao');
        voltar.classList.add('container__botao-desabilitado');
    }
}

function statusBotao() {
    const voltar = elem('btn-reiniciar');
    if (voltar.classList.contains('container__botao-desabilitado')) {
        voltar.classList.remove('container__botao-desabilitado');
        voltar.classList.add('container__botao');
    }
}

function limpar() {
    mostrarTexto(textoVazio());
    elem('quantidade').value = 1;
    elem('quantidadeSlider').value = 1;
    pintarSlider();
    elem('de').value = 1;
    elem('ate').value = '';
    elem('nomes').value = '';
    atualizarContador();
}

/* ---------- Início ---------- */
aplicarLimite();
atualizarContador();
