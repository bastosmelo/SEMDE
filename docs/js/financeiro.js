// inicializa lucide icons quando disponível
window.addEventListener('load', () => {
  if (window.lucide) lucide.createIcons();
});

/* ================= CONFIG ================= */
// Navegação do menu (simples, carrega outras páginas)
document.querySelectorAll('.menu-item').forEach(button => {
  button.addEventListener('click', () => {
    const page = button.dataset.page;
    window.location.href = `../docs/${page}.html`;
  });
});

// THEME (persistência)
const savedTheme = localStorage.getItem('theme');
function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    themeToggle.setAttribute('aria-pressed', 'true');
    themeLabel.textContent = 'Claro';
  } else {
    document.documentElement.classList.remove('dark');
    themeToggle.setAttribute('aria-pressed', 'false');
    themeLabel.textContent = 'Escuro';
  }
  localStorage.setItem('theme', theme);
}
// elementos
const themeToggle = document.getElementById('themeToggle');
const themeLabel = document.getElementById('themeLabel');
if (savedTheme) applyTheme(savedTheme);
else applyTheme(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

themeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.classList.contains('dark');
  applyTheme(isDark ? 'light' : 'dark');
});

// MOBILE menu toggle
document.getElementById('mobileMenuBtn').addEventListener('click', () => {
  const sb = document.querySelector('.sidebar');
  if (getComputedStyle(sb).display === 'none' || sb.style.display === 'none') {
    sb.style.display = 'flex';
  } else {
    sb.style.display = 'none';
  }
});

// MENU: navegação para arquivos (ver função pageHref)
document.querySelectorAll('.menu-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const page = btn.dataset.page;
    const href = pageHref(page);
    // se for a própria página "financeiro", evita recarregar
    if (location.pathname.endsWith('/financeiro.html') || location.pathname.endsWith('financeiro.html')) {
      if (page === 'financeiro' || page === '') return;
    }
    window.location.href = href;
  });
});

// LOGOUT
const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.addEventListener('click', () => {
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
if (storedName) profileName.textContent = storedName;
if (storedToken) tokenShort.textContent = storedToken.slice(0, 12) + '…';

/* ========== Funcionalidade Financeira ========== */
const financeForm = document.getElementById('financeForm');
const financeTable = document.getElementById('financeTable').getElementsByTagName('tbody')[0];
const exportBtn = document.getElementById('exportBtn');

// Array para armazenar os registros
let registros = JSON.parse(localStorage.getItem('registrosFinanceiros')) || [];

// Função para formatar valor em Real
function formatarReal(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

// Função para formatar data
function formatarData(dataString) {
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR');
}

// Função para calcular total
function calcularTotal(registro) {
  return registro.locacao + registro.juridica + registro.assessoria +
    registro.combustivel + registro.debito + registro.credito + registro.outros;
}

// Função para atualizar a tabela
function atualizarTabela() {
  financeTable.innerHTML = '';

  registros.forEach((registro, index) => {
    const total = calcularTotal(registro);
    const row = financeTable.insertRow();

    row.innerHTML = `
          <td>${formatarData(registro.data)}</td>
          <td>${formatarReal(registro.locacao)}</td>
          <td>${formatarReal(registro.juridica)}</td>
          <td>${formatarReal(registro.assessoria)}</td>
          <td>${formatarReal(registro.combustivel)}</td>
          <td>${formatarReal(registro.debito)}</td>
          <td>${formatarReal(registro.credito)}</td>
          <td>${formatarReal(registro.outros)}</td>
          <td><strong>${formatarReal(total)}</strong></td>
        `;
  });

  // Adicionar linha de total geral
  if (registros.length > 0) {
    const totalGeral = registros.reduce((acc, registro) => acc + calcularTotal(registro), 0);
    const totalRow = financeTable.insertRow();
    totalRow.className = 'total-row';
    totalRow.innerHTML = `
          <td><strong>TOTAL GERAL</strong></td>
          <td>${formatarReal(registros.reduce((acc, r) => acc + r.locacao, 0))}</td>
          <td>${formatarReal(registros.reduce((acc, r) => acc + r.juridica, 0))}</td>
          <td>${formatarReal(registros.reduce((acc, r) => acc + r.assessoria, 0))}</td>
          <td>${formatarReal(registros.reduce((acc, r) => acc + r.combustivel, 0))}</td>
          <td>${formatarReal(registros.reduce((acc, r) => acc + r.debito, 0))}</td>
          <td>${formatarReal(registros.reduce((acc, r) => acc + r.credito, 0))}</td>
          <td>${formatarReal(registros.reduce((acc, r) => acc + r.outros, 0))}</td>
          <td><strong>${formatarReal(totalGeral)}</strong></td>
        `;
  }

  atualizarEstatisticas();
}

// Função para atualizar estatísticas
function atualizarEstatisticas() {
  document.getElementById('totalRegistros').textContent = registros.length;

  const despesasTotais = registros.reduce((acc, registro) => acc + calcularTotal(registro), 0);
  document.getElementById('despesasTotais').textContent = formatarReal(despesasTotais);

  const maiorDespesa = registros.length > 0 ?
    Math.max(...registros.map(registro => calcularTotal(registro))) : 0;
  document.getElementById('maiorDespesa').textContent = formatarReal(maiorDespesa);

  const mediaMensal = registros.length > 0 ? despesasTotais / registros.length : 0;
  document.getElementById('mediaMensal').textContent = formatarReal(mediaMensal);
}

// Evento de submit do formulário
financeForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const novoRegistro = {
    data: document.getElementById('data').value,
    locacao: parseFloat(document.getElementById('locacao').value) || 0,
    juridica: parseFloat(document.getElementById('juridica').value) || 0,
    assessoria: parseFloat(document.getElementById('assessoria').value) || 0,
    combustivel: parseFloat(document.getElementById('combustivel').value) || 0,
    debito: parseFloat(document.getElementById('debito').value) || 0,
    credito: parseFloat(document.getElementById('credito').value) || 0,
    outros: parseFloat(document.getElementById('outros').value) || 0
  };

  registros.push(novoRegistro);
  localStorage.setItem('registrosFinanceiros', JSON.stringify(registros));

  atualizarTabela();
  financeForm.reset();

  // Mostrar mensagem de sucesso
  alert('Registro financeiro salvo com sucesso!');
});

// Evento do botão exportar
exportBtn.addEventListener('click', () => {
  if (registros.length === 0) {
    alert('Não há registros para exportar.');
    return;
  }

  // Simular exportação (em um caso real, isso seria uma chamada de API)
  alert('Funcionalidade de exportação para Excel será implementada em breve!');
});

// Inicializar a tabela
atualizarTabela();
