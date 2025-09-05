// Valida campos da Etapa 1
function validarEtapa1() {
  let valido = true;
  const form = document.getElementById("candidatos");
  const campos = form.querySelectorAll("#etapa1 input, #etapa1 select");

  campos.forEach(campo => {
    const spanErro = campo.nextElementSibling;
    if (spanErro && spanErro.classList.contains("erro")) {
      spanErro.remove(); // limpa mensagens antigas
    }

    if (campo.name === "nome") {
      if (
        campo.value.trim() === "" ||
        campo.value.length > 40 ||
        /\d/.test(campo.value) ||
        campo.value.includes("  ")
      ) {
        mostrarErro(campo, "Nome inválido.");
        valido = false;
      }
    }

    if (campo.name === "nascimento" && campo.value === "") {
      mostrarErro(campo, "Preencha a data de nascimento.");
      valido = false;
    }

    if (campo.name === "genero" && campo.value === "") {
      mostrarErro(campo, "Selecione o gênero.");
      valido = false;
    }

    if (campo.name === "email") {
      const valor = campo.value.trim();
      const arrobaIndex = valor.indexOf("@");
      const temAlgoDepoisDoArroba = arrobaIndex > 0 && arrobaIndex < valor.length - 1;
    
      if (
        valor === "" ||
        valor.length > 40 ||
        !temAlgoDepoisDoArroba
      ) {
        mostrarErro(campo, "E-mail inválido.");
        valido = false;
      }
    }

    if (campo.name === "telefone") {
      const telNumeros = campo.value.replace(/\D/g, "");
      if (telNumeros.length < 8 || telNumeros.length > 11) {
        mostrarErro(campo, "Telefone deve ter entre 8 e 11 dígitos.");
        valido = false;
      }
    }

    if (campo.name === "cpf") {
      const cpfNumeros = campo.value.replace(/\D/g, "");
      if (cpfNumeros.length !== 11) {
        mostrarErro(campo, "CPF deve conter exatamente 11 dígitos.");
        valido = false;
      }
    }

    if (campo.name === "numero") {
      if (campo.value.trim() === "") {
        mostrarErro(campo, "Preencha o número.");
        valido = false;
      } else if (!/^\d+$/.test(campo.value)) {
        mostrarErro(campo, "O número deve conter apenas dígitos.");
        valido = false;
      }
    }

    if (campo.name === "logradouro" && campo.value.trim() === "") {
      mostrarErro(campo, "Preencha o logradouro.");
      valido = false;
    }

    if (campo.name === "bairro" && campo.value.trim() === "") {
      mostrarErro(campo, "Preencha o bairro.");
      valido = false;
    }

    if (campo.name === "municipio" && campo.value.trim() === "") {
      mostrarErro(campo, "Preencha o município.");
      valido = false;
    }

    if (campo.name === "estado" && campo.value === "") {
      mostrarErro(campo, "Selecione o estado.");
      valido = false;
    }
  });

  return valido;
}

// Valida campos da Etapa 2 ao enviar

function validarEtapa2(e) {
  let valido = true;
  const form = document.getElementById("candidatos");
  const campos = form.querySelectorAll("#etapa2 input, #etapa2 select, #etapa2 textarea");

  campos.forEach(campo => {
    const spanErro = campo.nextElementSibling;
    if (spanErro && spanErro.classList.contains("erro")) {
      spanErro.remove();
    }

    if (["formacao", "situacao_formacao", "cargo", "disponibilidade"].includes(campo.name)) {
      if (campo.value === "") {
        mostrarErro(campo, "Selecione uma opção.");
        valido = false;
      }
    }

    if (campo.name === "conclusao" && campo.value.trim() === "") {
      mostrarErro(campo, "Informe a data de conclusão.");
      valido = false;
    }

    if (campo.name === "salario" && campo.value.trim() === "") {
      mostrarErro(campo, "Informe sua pretensão salarial.");
      valido = false;
    }
  });

  const arquivosObrigatorios = [
    { nome: "curriculo", label: "Currículo" },
    { nome: "rg_anexo", label: "RG" },
    { nome: "comprovante", label: "Comprovante de Endereço" }
  ];

  arquivosObrigatorios.forEach(arquivo => {
    const input = form.querySelector(`input[name="${arquivo.nome}"]`);
    const erroSpan = input?.parentElement.querySelector(".erro");
    if (erroSpan) erroSpan.remove();

    if (!input || input.files.length === 0) {
      mostrarErro(input, `Anexe o arquivo de ${arquivo.label}.`);
      valido = false;
    }
  });

  // Bloqueia o envio padrão para controlar manualmente
  e.preventDefault();

  if (valido) {
    // Envia o formulário usando fetch
    const formData = new FormData(form);

    fetch(form.action, {
      method: form.method,
      body: formData
    })
      .then(response => {
        if (response.ok) {
          // Redireciona após envio com sucesso
          window.location.href = "index.html"; // <- Altere o nome do arquivo se quiser outra página
        } else {
          window.location.href = "fail.html";
        }
      })
      .catch(() => {
        alert("Erro ao enviar o formulário. Verifique sua conexão.");
      });
  }
}




// Função para exibir mensagens de erro
function mostrarErro(campo, mensagem) {
  const erro = document.createElement("span");
  erro.classList.add("erro");
  erro.innerText = mensagem;
  campo.parentNode.insertBefore(erro, campo.nextSibling);
}

// Avança para a próxima etapa se a Etapa 1 for válida
function proximaEtapa() {
  if (!validarEtapa1()) return;

  document.getElementById("etapa1").classList.remove("active");
  document.getElementById("etapa2").classList.add("active");
  document.getElementById("etapaTexto").innerText = "Etapa 2 de 2";
  document.getElementById("progresso1").classList.add("preenchido");
  document.getElementById("progresso2").classList.add("preenchido");
}

//Voltar
function voltarEtapa() {

  document.getElementById("etapa2").classList.remove("active");
  document.getElementById("etapa1").classList.add("active");
  document.getElementById("etapaTexto").innerText = "Etapa 1 de 2";
  document.getElementById("progresso1").classList.add("preenchido");
  document.getElementById("progresso2").classList.remove("preenchido");
}

// Ao carregar a página
window.onload = function () {
  document.getElementById("etapa1").classList.add("active");
  document.getElementById("progresso1").classList.add("preenchido");

  document.getElementById("candidatos").addEventListener("submit", validarEtapa2);
};
