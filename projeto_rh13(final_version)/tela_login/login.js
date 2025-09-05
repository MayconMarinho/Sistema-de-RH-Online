document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  fetch('/login-admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  })
  .then(res => res.json())
  .then(data => {
    if (data.sucesso) {
      // Exibe o modal de sucesso
      const modalSucesso = new bootstrap.Modal(document.getElementById('modalSucesso'));
      modalSucesso.show();

      // Redireciona após 2,5 segundos
      setTimeout(() => {
        window.location.href = "/admin/admin.html";
      }, 2500);
    } else {
      // Exibe o modal de erro
      const modalErro = new bootstrap.Modal(document.getElementById('modalErro'));
      modalErro.show();
    }
  })
  .catch(error => {
    console.error("Erro na requisição:", error);
    // Exibe modal de erro com texto genérico
    document.querySelector('#modalErro .modal-body').textContent = "Erro ao tentar logar. Tente novamente mais tarde.";
    const modalErro = new bootstrap.Modal(document.getElementById('modalErro'));
    modalErro.show();
  });
});
