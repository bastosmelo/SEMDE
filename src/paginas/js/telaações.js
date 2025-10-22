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
      if(getComputedStyle(sb).display === 'none' || sb.style.display === 'none') sb.style.display = 'flex';
      else sb.style.display = 'none';
    });

    // MENU: navegação para arquivos (ver função pageHref)
    document.querySelectorAll('.menu-item').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const page = btn.dataset.page;
        const href = pageHref(page);
        // se for a própria página "acoes", evita recarregar
        if(location.pathname.endsWith('/acoes.html') || location.pathname.endsWith('acoes.html')){
          if(page === 'acoes' || page === '' ) return;
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

    /* ========== Modal Nova Ação ========== */
    const modal = document.getElementById('modalNovaAcao');
    const openNova = document.getElementById('openNovaAcao');
    const closeModal = document.getElementById('closeModal');
    const btnCancelar = document.getElementById('btnCancelar');
    const formNova = document.getElementById('formNovaAcao');
    const tbody = document.getElementById('acoesTbody');

    function openModal(){
      modal.classList.add('show');
      modal.querySelector('select, input, textarea').focus();
    }
    function closeModalFn(){
      modal.classList.remove('show');
      formNova.reset();
    }

    openNova.addEventListener('click', openModal);
    closeModal.addEventListener('click', closeModalFn);
    btnCancelar.addEventListener('click', closeModalFn);

    // fechar clicando fora do conteúdo
    modal.addEventListener('click', (e)=>{
      if(e.target === modal) closeModalFn();
    });

    // adicionar nova ação na tabela (cliente)
    formNova.addEventListener('submit', (e)=>{
      e.preventDefault();
      const cidade = formNova.cidade.value || '-';
      const bairro = formNova.bairro.value || '-';
      const tipo = formNova.tipoAcao.value || '-';
      const data = formNova.dataAcao.value;
      // formata data dd/mm/yyyy
      let dataFmt = '';
      if(data){
        const d = new Date(data);
        const dd = String(d.getDate()).padStart(2,'0');
        const mm = String(d.getMonth()+1).padStart(2,'0');
        const yy = d.getFullYear();
        dataFmt = `${dd}/${mm}/${yy}`;
      } else dataFmt = '-';

      // cria linha
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${cidade}</td>
        <td>${bairro}</td>
        <td>${tipo}</td>
        <td>${dataFmt}</td>
        <td class="actions-cell">
          <button class="btn-icon" data-action="edit"><i data-lucide="edit-2"></i></button>
          <button class="btn-icon" data-action="delete"><i data-lucide="trash-2"></i></button>
        </td>
      `;
      tbody.prepend(tr); // adiciona no topo
      // re-cria icons (lucide)
      if(window.lucide) lucide.createIcons();
      closeModalFn();
      
      // Atualiza contadores
      updateCounters();
    });

    // Delegation: editar / excluir na tabela
    tbody.addEventListener('click', (e)=>{
      const btn = e.target.closest('button');
      if(!btn) return;
      const action = btn.dataset.action;
      const row = btn.closest('tr');
      if(action === 'delete'){
        if(confirm('Excluir esta ação?')) {
          row.remove();
          updateCounters();
        }
      } else if(action === 'edit'){
        // preenche modal com valores da linha para edição
        const cols = row.querySelectorAll('td');
        const cidade = cols[0].textContent.trim();
        const bairro = cols[1].textContent.trim();
        const tipo = cols[2].textContent.trim();
        const dataText = cols[3].textContent.trim(); // dd/mm/yyyy

        // preencher form (converte data para yyyy-mm-dd)
        formNova.cidade.value = cidade;
        formNova.bairro.value = bairro;
        formNova.tipoAcao.value = tipo;
        if(dataText && dataText.includes('/')){
          const parts = dataText.split('/');
          formNova.dataAcao.value = `${parts[2]}-${parts[1]}-${parts[0]}`;
        } else formNova.dataAcao.value = '';

        openModal();

        // ao submeter, atualizamos a linha — interceptamos submit temporariamente
        const onSubmitEdit = (ev)=>{
          ev.preventDefault();
          const ncidade = formNova.cidade.value || '-';
          const nbairro = formNova.bairro.value || '-';
          const ntipo = formNova.tipoAcao.value || '-';
          const ndata = formNova.dataAcao.value;
          let dataFmt = ndata ? (()=>{const d=new Date(ndata);return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`})() : '-';
          cols[0].textContent = ncidade;
          cols[1].textContent = nbairro;
          cols[2].textContent = ntipo;
          cols[3].textContent = dataFmt;
          // cleanup
          formNova.removeEventListener('submit', onSubmitEdit);
          closeModalFn();
        };

        formNova.addEventListener('submit', onSubmitEdit);
      }
    });

    /* small UX: keyboard esc fecha modal */
    window.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape' && modal.classList.contains('show')) closeModalFn();
    });

    /* inicializa lucide icons dinâmicos (ex.: após adicionar linhas) */
    document.addEventListener('DOMContentLoaded', ()=> {
      if(window.lucide) lucide.createIcons();
    });

    /* ========== Função para atualizar contadores ========== */
    function updateCounters() {
      const rows = tbody.querySelectorAll('tr');
      const totalActions = rows.length;
      document.getElementById('totalActions').textContent = totalActions;
      
      // Contar cidades únicas
      const cities = new Set();
      rows.forEach(row => {
        const city = row.cells[0].textContent.trim();
        if (city && city !== '-') cities.add(city);
      });
      document.getElementById('activeCities').textContent = cities.size;
      
      // Contar bairros únicos
      const neighborhoods = new Set();
      rows.forEach(row => {
        const neighborhood = row.cells[1].textContent.trim();
        if (neighborhood && neighborhood !== '-') neighborhoods.add(neighborhood);
      });
      document.getElementById('coveredNeighborhoods').textContent = neighborhoods.size;
    }

    // Inicializa contadores
    updateCounters();

    /* ========== Extras: botões do mapa (só visual por enquanto) ========== */
    document.getElementById('btnPontos').addEventListener('click', ()=> alert('Filtro: Pontos Individuais (implemente conexão com backend para exibir marcadores)'));
    document.getElementById('btnBairros').addEventListener('click', ()=> alert('Filtro: Contadores por Bairro (implemente backend para agregação)'));
    document.getElementById('btnCalor').addEventListener('click', ()=> alert('Filtro: Mapa de Calor (integre heatmap library/serviço)'));
