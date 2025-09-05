let filtroCargoSelecionado = null; // Armazena o cargo selecionado no filtro
let filtroEstadoSelecionado = null; // Armazena o estado selecionado no filtro
let filtroDispSelecionado = null; // Armazena a disponibilidade selecionada no filtro

const tabela = document.getElementById("tabela-candidatos"); // Obtém a referência da tabela no HTML
let candidatos = []; // Inicializa o array de candidatos


function formatarDataBR(dataISO) {
  if (!dataISO) return '—';
  const data = new Date(dataISO);
  if (isNaN(data)) return dataISO; // Se não for data válida, retorna como veio
  return data.toLocaleDateString('pt-BR');
}

// Função principal para carregar os candidatos do servidor
function carregarCandidatos() {
  fetch('/candidatos') // Faz uma requisição GET para o endpoint '/candidatos'
    .then(res => res.json()) // Converte a resposta para JSON
    .then(data => {
      candidatos = data; // Armazena os candidatos recebidos
      tabela.innerHTML = ''; // Limpa a tabela

      // Preenche a tabela com os candidatos
      candidatos.forEach((candidato) => {
        const linha = document.createElement("tr"); // Cria uma nova linha
        linha.innerHTML = `
          <td>${candidato.nome}</td>
          <td>${candidato.cargo_desejado}</td>
          <td class="align-middle text-center">
            <button class="btn btn-sm btn-warning" onclick="mostrarRelatorio(${candidato.id})">
              <i class="bi bi-file-earmark-text-fill me-1"></i>Ver Relatório
            </button>
          </td>
          <td class="align-middle text-center">
            <button class="btn btn-sm btn-danger" onclick="excluirCandidato(${candidato.id})">
              <i class="bi bi-trash-fill me-1"></i>Excluir
            </button>
          </td>`;
        tabela.appendChild(linha); // Adiciona a linha à tabela
      });

      // Atualiza a contagem total de candidatos
      document.getElementById('total-candidatos').innerText = candidatos.length;

      // Objetos para contar os dados para os gráficos
      const cargos = {};
      const disponibilidades = {};
      const estados = {};

      // Agrupa os dados para cada tipo de gráfico
      candidatos.forEach(c => {
        const cargo = c.cargo_desejado || 'Não informado';
        cargos[cargo] = (cargos[cargo] || 0) + 1;

        const disp = c.disponibilidade || 'Não informado';
        disponibilidades[disp] = (disponibilidades[disp] || 0) + 1;

        const estado = c.estado || 'Não informado';
        estados[estado] = (estados[estado] || 0) + 1;
      });

      // Remove gráfico anterior antes de criar um novo
      function destruirGrafico(id) {
        if (window[id]) {
          window[id].destroy();
        }
      }

      // Gráfico de pizza por Cargo
      destruirGrafico('graficoCargoChart');
      const ctxCargo = document.getElementById('graficoCargo');
      window.graficoCargoChart = new Chart(ctxCargo, {
        type: 'pie',
        data: {
          labels: Object.keys(cargos),
          datasets: [{
            label: 'Candidatos por Cargo',
            data: Object.values(cargos),
            backgroundColor: ['#f44336', '#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4']
          }]
        }
      });

      // Gráfico de barras por Disponibilidade
      destruirGrafico('graficoDisponibilidadeChart');
      const ctxDisp = document.getElementById('graficoDisponibilidade');
      window.graficoDisponibilidadeChart = new Chart(ctxDisp, {
        type: 'bar',
        data: {
          labels: Object.keys(disponibilidades),
          datasets: [{
            label: 'Disponibilidade',
            data: Object.values(disponibilidades),
            backgroundColor: ['#4caf50', '#ff9800', '#03a9f4', '#e91e63']
          }]
        },
        options: {
          responsive: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: { precision: 0 }
            }
          }
        }
      });

      // Gráfico de barras horizontais por Estado
      destruirGrafico('graficoEstadoChart');
      const ctxEstado = document.getElementById('graficoEstado');
      window.graficoEstadoChart = new Chart(ctxEstado, {
        type: 'bar',
        data: {
          labels: Object.keys(estados),
          datasets: [{
            label: 'Candidatos por Estado',
            data: Object.values(estados),
            backgroundColor: '#2196f3'
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          scales: {
            x: { beginAtZero: true }
          }
        }
      });

      preencherMenus(); // Preenche os filtros
    })
    .catch(err => console.error('Erro ao carregar candidatos:', err)); // Trata erros
}

// Preenche todos os menus de filtro
function preencherMenus() {
  preencherMenu('cargo_desejado', 'menuCargo', 'dropdownCargo');
  preencherMenu('disponibilidade', 'menuDisp', 'dropdownDisp');
  preencherMenu('estado', 'menuEstado', 'dropdownEstado');
}

// Preenche um menu específico
function preencherMenu(campo, menuId, botaoId) {
  const valores = [...new Set(candidatos.map(c => c[campo] || 'Não informado'))];
  const menu = document.getElementById(menuId);
  const botao = document.getElementById(botaoId);

  menu.innerHTML = '';

  valores.forEach(valor => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.className = 'dropdown-item';
    link.href = '#';
    link.textContent = valor;

    // Quando o item do filtro for clicado
    link.addEventListener('click', () => {
      if (campo === 'cargo_desejado') {
        filtroCargoSelecionado = valor;
      } else if (campo === 'estado') {
        filtroEstadoSelecionado = valor;
      } else if (campo === 'disponibilidade') {
        filtroDispSelecionado = valor;
      }
      aplicarFiltros(); // Aplica os filtros com base na seleção
      botao.textContent = valor; // Atualiza o botão do dropdown com o valor selecionado
    });

    item.appendChild(link);
    menu.appendChild(item);
  });
}

// Atualiza a tabela com os candidatos filtrados
function atualizarTabela(lista) {
  tabela.innerHTML = '';
  lista.forEach(candidato => {
    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${candidato.nome}</td>
      <td>${candidato.cargo_desejado}</td>
      <td class="align-middle text-center">
        <button class="btn btn-sm btn-warning" onclick="mostrarRelatorio(${candidato.id})">
          <i class="bi bi-file-earmark-text-fill me-1"></i>Ver Relatório
        </button>
      </td>
      <td class="align-middle text-center">
        <button class="btn btn-sm btn-danger" onclick="excluirCandidato(${candidato.id})">
          <i class="bi bi-trash-fill me-1"></i>Excluir
        </button>
      </td>`;
    tabela.appendChild(linha);
  });
  document.getElementById('total-candidatos').innerText = lista.length; // Atualiza o contador
}

// Mostra o relatório do candidato clicado
function mostrarRelatorio(id) {
  const c = candidatos.find(cand => cand.id === id);
  if (!c) return;

  const notaPort = Number(c.nota_portugues) || 0;
const notaLog = Number(c.nota_logica) || 0;
const notaIng = Number(c.nota_ingles) || 0;


  const html = `
    <p><strong>Informações pessoais:</strong></p>
    <p><strong>Nome:</strong> ${c.nome}</p>
    <p><strong>Data de Nascimento:</strong> ${formatarDataBR(c.data_nasci)}</p>
    <p><strong>Gênero:</strong> ${c.genero}</p>
    <p><strong>Email:</strong> ${c.email}</p>
    <p><strong>Telefone:</strong> ${c.telefone}</p>
    <p><strong>CPF:</strong> ${c.cpf}</p>
    <p><strong>Endereço:</strong> ${c.logradouro}, ${c.numero}, ${c.bairro} - ${c.municipio}/${c.estado}</p>
    <p><strong>Complemento:</strong> ${c.complemento || '—'}</p>
    <hr>
    <p><strong>Informações profissionais:</strong></p>
    <p><strong>Curso:</strong> ${c.curso}</p>
    <p><strong>Situação:</strong> ${c.situacao_curso}</p>
    <p><strong>Data de Conclusão:</strong> ${formatarDataBR(c.data_conclusao)}</p>
    <p><strong>Cargo Desejado:</strong> ${c.cargo_desejado}</p>
    <p><strong>Pretensão Salarial:</strong> R$ ${c.pretensao_salarial}</p>
    <p><strong>Disponibilidade:</strong> ${c.disponibilidade}</p>
    <p><strong>Soft Skills:</strong> ${c.soft_skills || '—'}</p>
    <p><strong>Hard Skills:</strong> ${c.hard_skills || '—'}</p>
    <p><strong>Sobre:</strong> ${c.sobre_voce || '—'}</p>
    <hr>
    <p><strong>Documentos:</strong></p>
    <ul>
      ${c.curriculo ? `<li><a href="/uploads/${c.curriculo}" target="_blank">Currículo</a></li>` : ''}
      ${c.rg ? `<li><a href="/uploads/${c.rg}" target="_blank">RG</a></li>` : ''}
      ${c.comprovante_endereco ? `<li><a href="/uploads/${c.comprovante_endereco}" target="_blank">Comprovante de Endereço</a></li>` : ''}
    </ul>
    <hr>
    <div class="mt-3">
  <h6 class="fw-bold text-secondary">
    <i class="bi bi-clipboard-data me-1"></i> Desempenho nos Testes
  </h6>
  <div style="display: flex; gap: 30px; align-items: center;">
    <div>
      <p><strong>Português:</strong> ${c.nota_portugues || '—'}</p>
      <p><strong>Lógica:</strong> ${c.nota_logica || '—'}</p>
      <p><strong>Inglês:</strong> ${c.nota_ingles || '—'}</p>
    </div>
    <canvas id="graficoDesempenho" width="200" height="200"></canvas>
  </div>
</div>


  `;

  document.getElementById('conteudoRelatorio').innerHTML = html;

  const modal = new bootstrap.Modal(document.getElementById('modalRelatorio'));
  modal.show(); // Abre o modal com as informações
  // Destroi gráfico anterior (se já existir)
if (window.graficoDesempenhoCandidato) {
  window.graficoDesempenhoCandidato.destroy();
}

// Cria novo gráfico de pizza com notas do candidato
const ctx = document.getElementById('graficoDesempenho').getContext('2d');
window.graficoDesempenhoCandidato = new Chart(ctx, {
  type: 'pie',
  data: {
    labels: ['Português', 'Lógica', 'Inglês'],
    datasets: [{
      label: 'Notas',
      data: [notaPort, notaLog, notaIng],
      backgroundColor: ['#c32f2fff', '#66bb6a', '#3535e0ff']
    }]
  },
  options: {
    responsive: false,
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw} ponto(s)`;
          }
        }
      }
    }
  }
});

}

// Função para excluir um candidato do banco de dados
let idCandidatoParaExcluir = null; // Variável para armazenar o ID temporariamente

function excluirCandidato(id) {
  idCandidatoParaExcluir = id;

  // Mostra o modal de confirmação
  const modalConfirmar = new bootstrap.Modal(document.getElementById('modalConfirmarExclusao'));
  modalConfirmar.show();
}

// Quando o botão "Excluir" do modal for clicado
document.getElementById('btnConfirmarExclusao').addEventListener('click', () => {
  if (!idCandidatoParaExcluir) return;

  // Fecha o modal de confirmação
  const modalConfirmar = bootstrap.Modal.getInstance(document.getElementById('modalConfirmarExclusao'));
  modalConfirmar.hide();

  // Envia a requisição DELETE
  fetch(`/candidatos/${idCandidatoParaExcluir}`, { method: 'DELETE' })
    .then(res => {
      const modalFeedback = new bootstrap.Modal(document.getElementById('modalFeedback'));
      const titulo = document.getElementById('modalFeedbackLabel');
      const corpo = document.getElementById('modalFeedbackBody');

      if (res.ok) {
        // Sucesso
        titulo.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Sucesso';
        titulo.className = 'modal-title text-success';
        corpo.innerText = 'Candidato excluído com sucesso.';
        modalFeedback.show();

        carregarCandidatos(); // Atualiza a tabela
      } else {
        // Erro
        titulo.innerHTML = '<i class="bi bi-x-circle-fill me-2"></i>Erro';
        titulo.className = 'modal-title text-danger';
        corpo.innerText = 'Erro ao excluir o candidato.';
        modalFeedback.show();
      }
    })
    .catch(err => {
      console.error('Erro ao excluir:', err);
      const modalFeedback = new bootstrap.Modal(document.getElementById('modalFeedback'));
      const titulo = document.getElementById('modalFeedbackLabel');
      const corpo = document.getElementById('modalFeedbackBody');

      titulo.innerHTML = '<i class="bi bi-x-circle-fill me-2"></i>Erro';
      titulo.className = 'modal-title text-danger';
      corpo.innerText = 'Erro inesperado ao excluir o candidato.';
      modalFeedback.show();
    });
});


// Aplica os filtros selecionados pelo usuário
function aplicarFiltros() {
  let filtrado = candidatos;

  if (filtroCargoSelecionado) {
    filtrado = filtrado.filter(c => (c.cargo_desejado || 'Não informado') === filtroCargoSelecionado);
  }
  if (filtroEstadoSelecionado) {
    filtrado = filtrado.filter(c => (c.estado || 'Não informado') === filtroEstadoSelecionado);
  }
  if (filtroDispSelecionado) {
    filtrado = filtrado.filter(c => (c.disponibilidade || 'Não informado') === filtroDispSelecionado);
  }

  atualizarTabela(filtrado); // Mostra os dados filtrados na tabela
}

// Reseta os filtros e mostra todos os candidatos
function resetarFiltros() {
  filtroCargoSelecionado = null;
  filtroEstadoSelecionado = null;
  filtroDispSelecionado = null;

  document.getElementById('dropdownCargo').textContent = 'Cargo';
  document.getElementById('dropdownEstado').textContent = 'Estado';
  document.getElementById('dropdownDisp').textContent = 'Disponibilidade';

  atualizarTabela(candidatos); // Restaura a tabela completa
}

// Ao carregar a página, chama a função de carregar candidatos
document.addEventListener('DOMContentLoaded', () => {
  carregarCandidatos();
});
