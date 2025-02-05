function obtterdificuldade(nome){
    const urldificuldade = new URLSearchParams(window.location.search);
    return urldificuldade.get(nome);
}

const dificuldade = obtterdificuldade('dificuldade')
let computador;
let max;
let min;

if (dificuldade === 'facil'){
    computador = Math.floor(Math.random() * 101);
    min = 0;
    max = 100
}else if (dificuldade === 'medio' || dificuldade === 'dificil'){
    computador = Math.floor(Math.random() * 1001);
    min = 0;
    max = 1000;
}


document.querySelector("#Palpite").placeholder = ` de ${min} até ${max}`
document.querySelector("#Palpite").addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        adivinhacao();
    }});

function validarPalpite(valor, min, max) {
    if (dificuldade !== 'dificil' && (valor < min || valor > max)) {
        alert(`O valor deve estar entre ${min} e ${max}.`);
        document.getElementById('Palpite').value = ''
        document.getElementById('Palpite').focus()
        return false;
    }
    return true;
}

function adivinhacao(){
    
    let entrada = document.getElementById('Palpite').value
    let mensagem = document.querySelector('#resultado')
    mensagem.style.color = 'rgb(56,56,56)'
    
    if (entrada ===''){
        alert('Digite o palpite');

    }else{
        let numero = Number(entrada)

        if (!validarPalpite(numero, min, max)) {
            return;
        }

        if (numero === computador){
            mensagem.style.color = 'red'
            mensagem.style.textShadow = '1px 1px 0px rgba(0, 0, 0, 0.75)'
            mensagem.innerHTML = 'PARABÉNS! Você acertou.'
            min = 0
            max = 1000
        }else if (dificuldade !== 'dificil' && computador > numero){
            mensagem.innerHTML = 'Você errou! Meu número é <strong>maior</strong>.'
            if (min < numero){
                min = numero
            }
        } else if (dificuldade !== 'dificil' && computador < numero){
            mensagem.innerHTML = 'Você errou! Meu número é <strong>menor</strong>.'
            if (max > numero){
                max = numero
            }
        }

        document.querySelector("#Palpite").placeholder = ` de ${min} até ${max}`
        document.getElementById('Palpite').value = ''
        document.getElementById('Palpite').focus()
    }
}