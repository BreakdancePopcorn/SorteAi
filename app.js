const LIMITE_QUANTIDADE = 100;

const elem = id => document.getElementById(id);


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
aplicarLimite();

function sortear() {
    

    const quantidade = parseInt(elem('quantidade').value);
    const de = parseInt(elem('de').value);
    const ate = parseInt(elem('ate').value);
    const naoRepetir = elem('optNaoRepetir').checked;

    if (de >= ate || !de || !ate || !quantidade) {
        alert('Campo "Do número" deve ser inferior ao campo "Até o número" ou existem campos vazios. Verifique!');
        limpar();
        return;
    }

    if (!elem('optSemLimite').checked && quantidade > LIMITE_QUANTIDADE) {
        alert(`A quantidade máxima é ${LIMITE_QUANTIDADE} números. Ative "Desbloquear limite" para sortear mais.`);
        return;
    }

    if (naoRepetir && quantidade > (ate - de + 1)) {
        alert(`O intervalo de ${de} a ${ate} só tem ${ate - de + 1} números. Diminua a quantidade ou desative "Não repetir número".`);
        return;
    }

        const gerar = () => {
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

        if (elem('optOrdenar').checked) {
            sorteados.sort((a, b) => a - b);
        }

        mostrarResultado(sorteados);  
        statusBotao();             
    };

    gerar();                      
}





function aleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function mostrarResultado(sorteados) {
    mostrarTexto(`Números sorteados: ${sorteados.join(', ')}`);
}

function mostrarTexto(texto) {
    elem('resultado').innerHTML = `<label class="texto__paragrafo">${texto}</label>`;
}

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
    mostrarTexto('Números sorteados: nenhum até agora');
    elem('quantidade').value = 1;
    elem('quantidadeSlider').value = 1;
    pintarSlider();
    elem('de').value = 1;
    elem('ate').value = '';
}





