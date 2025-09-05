function getGrupoFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('grupo');
}

const grupo = getGrupoFromURL();
const questoesGrupo = questoes[grupo] || [];
const quiz = sortearQuestoes(questoesGrupo, 10);

let indice = 0;
let acertos = 0;
let respostasUsuario = [];

function exibirQuestao() {
    if (!quiz.length) {
        document.getElementById('questoes').innerHTML = "Nenhuma questão encontrada para esse grupo.";
        document.getElementById('respostas').innerHTML = "";
        document.querySelector('.btn-voltar').style.display = 'none';
        document.querySelector('.btn-proximo').style.display = 'none';
        document.querySelector('.btn-finalizar').style.display = 'block';
        return;
    }
    const q = quiz[indice];
    document.getElementById('questoes').innerHTML = q.texto;
    document.getElementById('respostas').innerHTML = `
        <form>
            ${q.respostas.map((alt) => `
                <label class="radio-letra">
                    <input type="radio" name="resposta" value="${alt.letra}" ${respostasUsuario[indice]===alt.letra?'checked':''}>
                    <span class="alternativa">${alt.letra}</span>
                    <span class="nome-alternativa">${alt.nome}</span>
                </label>
            `).join('')}
        </form>
    `;
    document.querySelector('.btn-voltar').style.display = (indice === 0) ? 'none' : 'inline-block';
    document.querySelector('.btn-proximo').style.display = (indice === quiz.length - 1) ? 'none' : 'inline-block';
    document.querySelector('.btn-finalizar').style.display = (indice === quiz.length - 1) ? 'inline-block' : 'none';
    const numAtual = document.querySelector('.num-quest span');
    if (numAtual) numAtual.textContent = `Questão ${indice + 1} de ${quiz.length}`;
    document.querySelectorAll('input[name="resposta"]').forEach(input => {
      input.onclick = (ev) => {
        respostasUsuario[indice] = input.value;
      }
    });
}

function proximaQuestao() {
    if (indice < quiz.length - 1) {
        indice++;
        exibirQuestao();
    }
}

function voltarQuestao() {
    if (indice > 0) {
        indice--;
        exibirQuestao();
    }
}

function finalizarQuiz() {
  acertos = 0;
  for (let i = 0; i < quiz.length; i++) {
    if (respostasUsuario[i] === quiz[i].gabarito) acertos++;
  }

  const cpf = localStorage.getItem('cpfUsuario'); // Recupera o CPF do usuário
  const grupo = getGrupoFromURL(); // port, logica ou ingles

  // Envia os dados para o backend
  fetch('/salvar-nota', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cpf, grupo, nota: acertos })
  })
  .then(res => res.json())
  .then(data => {
    if (data.sucesso) {
      mostrarPopupResultado(); // Só mostra após salvar
    } else {
      alert('Erro ao salvar a nota no banco.');
    }
  })
  .catch(err => {
    console.error('Erro ao enviar nota:', err);
    alert('Erro ao salvar a nota.');
  });
}


function mostrarPopupResultado() {
    let media = Math.round(acertos / quiz.length * 100);
    let msg = '';
    let emoji = '';
    if (media === 100) { msg = "Impressionante!"; emoji = "🎉🥇"; }
    else if (media >= 80) { msg = "Excelente!"; emoji = "👏🤩"; }
    else if (media >= 60) { msg = "Muito bom!"; emoji = "👍😊"; }
    else if (media >= 40) { msg = "Pode melhorar!"; emoji = "🤔"; }
    else { msg = "Treine mais um pouco!"; emoji = "📚"; }
    const popup = document.createElement('div');
    popup.className = "popup-final";
    popup.innerHTML = `
      <div class="popup-inner">
        <span style="font-size:2.4rem">${emoji}</span>
        <h2>${msg}</h2>
        <p>Você acertou <b>${acertos}</b> de <b>${quiz.length}</b> questões (${media}%)</p>
        <button id="btn-sair">Voltar ao Início</button>
      </div>
    `;
     document.body.appendChild(popup);
    document.body.style.overflow = "hidden";
    document.getElementById('btn-sair').onclick = () => { 
      window.location.href = "http://localhost:3000/portfolio/portfolio.html";};
  }

document.addEventListener('DOMContentLoaded', function () {
    exibirQuestao();
    document.querySelector('.btn-proximo').onclick = proximaQuestao;
    document.querySelector('.btn-voltar').onclick = voltarQuestao;
    document.querySelector('.btn-finalizar').onclick = finalizarQuiz;
});

// Função para sortear questões únicas aleatórias
function sortearQuestoes(arr, total = 10) {
  const copy = [...arr], sorteadas = [];
  while (sorteadas.length < total && copy.length) {
    const idx = Math.floor(Math.random() * copy.length);
    sorteadas.push(copy.splice(idx, 1)[0]);
  }
  return sorteadas;
}
