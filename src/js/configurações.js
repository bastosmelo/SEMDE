document.getElementById("formCadastro").addEventListener("submit", function(e) {
  e.preventDefault();
  alert("Cadastro atualizado com sucesso!");
});

document.getElementById("formSenha").addEventListener("submit", function(e) {
  e.preventDefault();
  alert("Senha alterada com sucesso!");
});

function adicionarUsuario() {
  alert("Função de adicionar usuário chamada!");
}

function atualizarLista() {
  alert("Lista de usuários atualizada!");
}

function removerUsuario(btn) {
  if(confirm("Deseja remover este usuário?")) {
    btn.closest("tr").remove();
  }
}

function editarPermissoes() {
  document.getElementById("modalPermissoes").style.display = "flex";
}

function fecharModal() {
  document.getElementById("modalPermissoes").style.display = "none";
}

document.getElementById("formPermissoes").addEventListener("submit", function(e) {
  e.preventDefault();
  alert("Permissões atualizadas com sucesso!");
  fecharModal();
});