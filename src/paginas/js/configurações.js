    // inicializa lucide icons quando disponível
    window.addEventListener('load', ()=> {
      if(window.lucide) lucide.createIcons();
    });

    /* ================= CONFIG ================= */
    // Navegação do menu (simples, carrega outras páginas)
    document.querySelectorAll('.menu-item').forEach(button => {
    button.addEventListener('click', () => {
        const page = button.dataset.page;
        window.location.href = `../paginas/${page}.html`;
    });
    });

    // THEME (persistência)
    const savedTheme = localStorage.getItem('theme');
    function applyTheme(theme){
      if(theme === 'dark'){
        document.documentElement.classList.add('dark');
        themeToggle.setAttribute('aria-pressed','true');
        themeLabel.textContent = 'Claro';
      } else {
        document.documentElement.classList.remove('dark');
        themeToggle.setAttribute('aria-pressed','false');
        themeLabel.textContent = 'Escuro';
      }
      localStorage.setItem('theme', theme);
    }
    // elementos
    const themeToggle = document.getElementById('themeToggle');
    const themeLabel = document.getElementById('themeLabel');
    if(savedTheme) applyTheme(savedTheme);
    else applyTheme(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    themeToggle.addEventListener('click', ()=>{
      const isDark = document.documentElement.classList.contains('dark');
      applyTheme(isDark ? 'light' : 'dark');
    });

    // MOBILE menu toggle
    document.getElementById('mobileMenuBtn').addEventListener('click', ()=>{
      const sb = document.querySelector('.sidebar');
      if(getComputedStyle(sb).display === 'none' || sb.style.display === 'none') {
        sb.style.display = 'flex';
      } else {
        sb.style.display = 'none';
      }
    });

    // MENU: navegação para arquivos (ver função pageHref)
    document.querySelectorAll('.menu-item').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const page = btn.dataset.page;
        const href = pageHref(page);
        // se for a própria página "config", evita recarregar
        if(location.pathname.endsWith('/config.html') || location.pathname.endsWith('config.html')){
          if(page === 'config' || page === '' ) return;
        }
        window.location.href = href;
      });
    });

    // LOGOUT
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', ()=>{
      localStorage.removeItem('token');
      localStorage.removeItem('name');
      // redireciona ao dashboard/index
      window.location.href = pageHref('index');
    });

    // preenche nome do usuário se houver
    const profileName = document.getElementById('profileName');
    const tokenShort = document.getElementById('tokenShort');
    const storedName = localStorage.getItem('name');
    const storedToken = localStorage.getItem('token');
    if(storedName) profileName.textContent = storedName;
    if(storedToken) tokenShort.textContent = storedToken.slice(0,12) + '…';

    /* ========== Funcionalidade de Configurações ========== */
    const modalPermissoes = document.getElementById('modalPermissoes');
    const formCadastro = document.getElementById('formCadastro');
    const formSenha = document.getElementById('formSenha');
    const formPermissoes = document.getElementById('formPermissoes');

    // Funções do modal
    function editarPermissoes() {
      modalPermissoes.classList.add('show');
    }

    function fecharModal() {
      modalPermissoes.classList.remove('show');
    }

    function adicionarUsuario() {
      alert('Funcionalidade de adicionar usuário será implementada em breve!');
    }

    function atualizarLista() {
      alert('Lista de usuários atualizada!');
    }

    function removerUsuario(button) {
      if(confirm('Tem certeza que deseja remover este usuário?')) {
        const row = button.closest('tr');
        row.remove();
        atualizarEstatisticas();
      }
    }

    // Eventos dos formulários
    formCadastro.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Cadastro atualizado com sucesso!');
    });

    formSenha.addEventListener('submit', (e) => {
      e.preventDefault();
      const novaSenha = formSenha.querySelector('input[placeholder="Nova senha (exatamente 8 caracteres)"]').value;
      const confirmarSenha = formSenha.querySelector('input[placeholder="Confirmar senha"]').value;
      
      if (novaSenha.length !== 8) {
        alert('A nova senha deve ter exatamente 8 caracteres!');
        return;
      }
      
      if (novaSenha !== confirmarSenha) {
        alert('As senhas não coincidem!');
        return;
      }
      
      alert('Senha alterada com sucesso!');
      formSenha.reset();
    });

    formPermissoes.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Permissões salvas com sucesso!');
      fecharModal();
    });

    // Fechar modal ao clicar fora
    modalPermissoes.addEventListener('click', (e) => {
      if (e.target === modalPermissoes) {
        fecharModal();
      }
    });

    // Fechar modal com ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalPermissoes.classList.contains('show')) {
        fecharModal();
      }
    });

    // Função para atualizar estatísticas
    function atualizarEstatisticas() {
      const users = document.querySelectorAll('#userTable tr');
      const adminCount = Array.from(users).filter(row => 
        row.querySelector('.badge.admin')
      ).length;
      const commonCount = users.length - adminCount;
      
      document.getElementById('totalUsers').textContent = users.length;
      document.getElementById('adminUsers').textContent = adminCount;
      document.getElementById('commonUsers').textContent = commonCount;
    }

    // Inicializar estatísticas
    atualizarEstatisticas();

