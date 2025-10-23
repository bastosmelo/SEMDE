// inicializa lucide icons quando disponível
window.addEventListener('load', () => {
    if (window.lucide) lucide.createIcons();
});

/* ================= CONFIG ================= */
// Navegação do menu (simples, carrega outras páginas)
document.querySelectorAll('.menu-item').forEach(button => {
    button.addEventListener('click', () => {
        const page = button.dataset.page;
        window.location.href = `${page}.html`;
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

// MOBILE menu toggle - CORRIGIDO com o mesmo estilo da página Login - Dashboard
const mobileBtn = document.getElementById("mobileMenuBtn");
const sidebar = document.querySelector(".sidebar");

// Cria overlay (usado só no mobile)
const overlay = document.createElement("div");
overlay.classList.add("menu-overlay");
document.body.appendChild(overlay);

// Função para abrir/fechar menu
function toggleSidebar() {
  const isMobile = window.matchMedia("(max-width: 560px)").matches;

  if (isMobile) {
    // --- MOBILE ---
    const isOpen = sidebar.classList.toggle("open");
    mobileBtn.classList.toggle("active", isOpen);
    overlay.classList.toggle("show", isOpen);
    mobileBtn.setAttribute("aria-expanded", isOpen);
  } else {
    // --- DESKTOP ---
    if (sidebar.style.display === "none" || getComputedStyle(sidebar).display === "none") {
      sidebar.style.display = "flex";
    } else {
      sidebar.style.display = "none";
    }
  }
}

// Clique no botão hamburguer (mobile)
mobileBtn.addEventListener("click", toggleSidebar);

// Clique fora fecha no mobile
overlay.addEventListener("click", () => {
  sidebar.classList.remove("open");
  mobileBtn.classList.remove("active");
  overlay.classList.remove("show");
  mobileBtn.setAttribute("aria-expanded", "false");
});


// MENU: navegação para arquivos (ver função pageHref)
document.querySelectorAll('.menu-item').forEach(btn => {
    btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        const href = pageHref(page);
        // se for a própria página "tarefas", evita recarregar
        if (location.pathname.endsWith('/tarefas.html') || location.pathname.endsWith('tarefas.html')) {
            if (page === 'tarefas' || page === '') return;
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
  window.location.href = 'index.html'; // caminho direto
});

// preenche nome do usuário se houver
const profileName = document.getElementById('profileName');
const tokenShort = document.getElementById('tokenShort');
const storedName = localStorage.getItem('name');
const storedToken = localStorage.getItem('token');
if (storedName) profileName.textContent = storedName;
if (storedToken) tokenShort.textContent = storedToken.slice(0, 12) + '…';

/* ========== Modal Nova Tarefa ========== */
const modal = document.getElementById('modalNovaTarefa');
const btnNovaTarefa = document.getElementById('btnNovaTarefa');
const closeModal = document.getElementById('closeModal');
const btnCancelar = document.getElementById('btnCancelar');
const formNovaTarefa = document.getElementById('formNovaTarefa');

function openModal() {
    modal.classList.add('show');
    modal.querySelector('input, textarea').focus();
}
function closeModalFn() {
    modal.classList.remove('show');
    formNovaTarefa.reset();
}

btnNovaTarefa.addEventListener('click', openModal);
closeModal.addEventListener('click', closeModalFn);
btnCancelar.addEventListener('click', closeModalFn);

// fechar clicando fora do conteúdo
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModalFn();
});

// adicionar nova tarefa
formNovaTarefa.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = formNovaTarefa['task-title'].value;
    const description = formNovaTarefa['task-description'].value;
    const date = formNovaTarefa['task-date'].value;
    const assignee = formNovaTarefa['task-assignee'].value;
    const priority = formNovaTarefa['task-priority'].value;
    const status = formNovaTarefa['task-status'].value;
    const tags = formNovaTarefa['task-tags'].value;

    // Formata a data para dd/mm
    const dateObj = new Date(date);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const formattedDate = `${day}/${month}`;

    // Determina a coluna correta
    const columnSelector = {
        'a-fazer': '.kanban-column:nth-child(1) .tasks-container',
        'em-andamento': '.kanban-column:nth-child(2) .tasks-container',
        'concluido': '.kanban-column:nth-child(3) .tasks-container'
    }[status];

    const column = document.querySelector(columnSelector);

    // Cria o card da tarefa
    const taskCard = document.createElement('div');
    taskCard.className = 'task-card';
    taskCard.innerHTML = `
                <div class="task-type">${tags.split(',')[0] || 'Tarefa'}</div>
                <h3 class="task-title">${title}</h3>
                <p class="task-description">${description}</p>
                <div class="task-footer">
                    <span class="task-badge ${priority}">${priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
                    <span class="task-date">${formattedDate}</span>
                    <div class="task-actions">
                        <button class="btn-icon" data-action="edit"><i data-lucide="edit-2"></i></button>
                        <button class="btn-icon" data-action="delete"><i data-lucide="trash-2"></i></button>
                    </div>
                </div>
            `;

    // Adiciona a tarefa no início da coluna
    column.prepend(taskCard);

    // Atualiza contadores
    updateTaskCounters();

    // Re-cria ícones (lucide)
    if (window.lucide) lucide.createIcons();

    closeModalFn();
});

// Delegation: editar / excluir tarefas
document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const action = btn.dataset.action;
    const taskCard = btn.closest('.task-card');

    if (action === 'delete') {
        if (confirm('Excluir esta tarefa?')) {
            taskCard.remove();
            updateTaskCounters();
        }
    } else if (action === 'edit') {
        // Implementar edição de tarefa
        alert('Funcionalidade de edição será implementada em breve.');
    }
});

/* small UX: keyboard esc fecha modal */
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) closeModalFn();
});

/* ========== Função para atualizar contadores ========== */
function updateTaskCounters() {
    const todoTasks = document.querySelectorAll('.kanban-column:nth-child(1) .task-card').length;
    const doingTasks = document.querySelectorAll('.kanban-column:nth-child(2) .task-card').length;
    const doneTasks = document.querySelectorAll('.kanban-column:nth-child(3) .task-card').length;
    const totalTasks = todoTasks + doingTasks + doneTasks;

    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('todoTasks').textContent = todoTasks;
    document.getElementById('doingTasks').textContent = doingTasks;
    document.getElementById('doneTasks').textContent = doneTasks;

    // Atualiza contadores nos cabeçalhos das colunas
    document.querySelector('.kanban-column:nth-child(1) .task-count').textContent = todoTasks;
    document.querySelector('.kanban-column:nth-child(2) .task-count').textContent = doingTasks;
    document.querySelector('.kanban-column:nth-child(3) .task-count').textContent = doneTasks;
}

// Inicializa contadores
updateTaskCounters();
