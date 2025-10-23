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

        /* ========== Modal Editar Tarefa ========== */
        const modalEdit = document.getElementById('modalEditarTarefa');
        const closeEditModal = document.getElementById('closeEditModal');
        const btnCancelarEdit = document.getElementById('btnCancelarEdit');
        const formEditarTarefa = document.getElementById('formEditarTarefa');

        function openEditModal(taskCard) {
            // Preenche o formulário com os dados atuais da tarefa
            const taskId = taskCard.dataset.id;
            const taskTitle = taskCard.querySelector('.task-title').textContent;
            const taskDescription = taskCard.querySelector('.task-description').textContent;
            const taskDate = taskCard.querySelector('.task-date').textContent;
            const taskPriority = taskCard.querySelector('.task-badge').classList[1];
            const taskType = taskCard.querySelector('.task-type').textContent;
            const taskColumn = taskCard.closest('.kanban-column').dataset.status;

            // Converte a data do formato dd/mm para yyyy-mm-dd
            const [day, month] = taskDate.split('/');
            const formattedDate = `2024-${month}-${day}`; // Assumindo ano atual

            document.getElementById('edit-task-id').value = taskId;
            document.getElementById('edit-task-title').value = taskTitle;
            document.getElementById('edit-task-description').value = taskDescription;
            document.getElementById('edit-task-date').value = formattedDate;
            document.getElementById('edit-task-priority').value = taskPriority;
            document.getElementById('edit-task-status').value = taskColumn;
            document.getElementById('edit-task-tags').value = taskType;

            modalEdit.classList.add('show');
            modalEdit.querySelector('input, textarea').focus();
        }

        function closeEditModalFn() {
            modalEdit.classList.remove('show');
            formEditarTarefa.reset();
        }

        closeEditModal.addEventListener('click', closeEditModalFn);
        btnCancelarEdit.addEventListener('click', closeEditModalFn);

        // fechar clicando fora do conteúdo
        modalEdit.addEventListener('click', (e) => {
            if (e.target === modalEdit) closeEditModalFn();
        });

        // Salvar edição da tarefa
        formEditarTarefa.addEventListener('submit', (e) => {
            e.preventDefault();
            const taskId = document.getElementById('edit-task-id').value;
            const title = document.getElementById('edit-task-title').value;
            const description = document.getElementById('edit-task-description').value;
            const date = document.getElementById('edit-task-date').value;
            const priority = document.getElementById('edit-task-priority').value;
            const status = document.getElementById('edit-task-status').value;
            const tags = document.getElementById('edit-task-tags').value;

            // Encontra a tarefa pelo ID
            const taskCard = document.querySelector(`.task-card[data-id="${taskId}"]`);

            if (taskCard) {
                // Atualiza os dados da tarefa
                taskCard.querySelector('.task-title').textContent = title;
                taskCard.querySelector('.task-description').textContent = description;
                taskCard.querySelector('.task-type').textContent = tags;

                // Atualiza a data
                const dateObj = new Date(date);
                const day = String(dateObj.getDate()).padStart(2, '0');
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const formattedDate = `${day}/${month}`;
                taskCard.querySelector('.task-date').textContent = formattedDate;

                // Atualiza a prioridade
                const badge = taskCard.querySelector('.task-badge');
                badge.className = `task-badge ${priority}`;
                badge.textContent = priority.charAt(0).toUpperCase() + priority.slice(1);

                // Move a tarefa para a coluna correta se o status mudou
                const currentColumn = taskCard.closest('.kanban-column');
                const newColumn = document.querySelector(`.kanban-column[data-status="${status}"] .tasks-container`);

                if (currentColumn.dataset.status !== status) {
                    newColumn.prepend(taskCard);
                }

                // Atualiza contadores
                updateTaskCounters();
            }

            closeEditModalFn();
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

            // Gera um ID único para a tarefa
            const taskId = Date.now();

            // Cria o card da tarefa
            const taskCard = document.createElement('div');
            taskCard.className = 'task-card';
            taskCard.setAttribute('data-id', taskId);
            taskCard.setAttribute('draggable', 'true');
            taskCard.innerHTML = `
                <div class="task-type">${tags.split(',')[0] || 'Tarefa'}</div>
                <h3 class="task-title">${title}</h3>
                <p class="task-description">${description}</p>
                <div class="task-footer">
                    <span class="task-badge ${priority}">${priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
                    <span class="task-date">${formattedDate}</span>
                    <div class="task-actions">
                        <button class="btn-icon btn-edit tooltip" data-action="edit" data-tooltip="Editar">
                            <i data-lucide="edit-2"></i>
                        </button>
                        <button class="btn-icon btn-delete tooltip" data-action="delete" data-tooltip="Apagar">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
            `;

            // Adiciona a tarefa no início da coluna
            column.prepend(taskCard);

            // Adiciona eventos de drag and drop à nova tarefa
            addDragEvents(taskCard);

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
                openEditModal(taskCard);
            }
        });

        /* small UX: keyboard esc fecha modal */
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) closeModalFn();
            if (e.key === 'Escape' && modalEdit.classList.contains('show')) closeEditModalFn();
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

        /* ========== Drag and Drop ========== */
        let draggedTask = null;

        // Adiciona eventos de drag and drop a todas as tarefas existentes
        document.querySelectorAll('.task-card').forEach(task => {
            addDragEvents(task);
        });

        // Adiciona eventos de drag and drop a todas as colunas
        document.querySelectorAll('.kanban-column').forEach(column => {
            column.addEventListener('dragover', e => {
                e.preventDefault();
                column.classList.add('drag-over');
            });

            column.addEventListener('dragleave', () => {
                column.classList.remove('drag-over');
            });

            column.addEventListener('drop', e => {
                e.preventDefault();
                column.classList.remove('drag-over');

                if (draggedTask) {
                    const tasksContainer = column.querySelector('.tasks-container');
                    tasksContainer.appendChild(draggedTask);
                    updateTaskCounters();
                }
            });
        });

        function addDragEvents(task) {
            task.setAttribute('draggable', 'true');

            task.addEventListener('dragstart', () => {
                draggedTask = task;
                setTimeout(() => {
                    task.classList.add('dragging');
                }, 0);
            });

            task.addEventListener('dragend', () => {
                draggedTask = null;
                task.classList.remove('dragging');
                document.querySelectorAll('.kanban-column').forEach(col => {
                    col.classList.remove('drag-over');
                });
            });
        }