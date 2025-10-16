// Sistema de Gestão de Tarefas
class TaskManager {
    constructor() {
        this.tasks = [];
        this.taskIdCounter = 1;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadInitialTasks();
        this.bindDragAndDrop();

    }

    bindEvents() {
        // Modal events
        const modal = document.getElementById('modal-nova-tarefa');
        const btnNovaTarefa = document.querySelector('.btn-nova-tarefa');
        const closeBtn = document.querySelector('.close');
        const btnCancelar = document.querySelector('.btn-cancelar');
        const form = document.getElementById('form-nova-tarefa');

        // Abrir modal
        btnNovaTarefa.addEventListener('click', () => {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });

        // Fechar modal
        const closeModal = () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            form.reset();
        };

        closeBtn.addEventListener('click', closeModal);
        btnCancelar.addEventListener('click', closeModal);

        // Fechar modal clicando fora
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Submit do formulário
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createTask();
            closeModal();
        });

        // Bind existing task actions
        this.bindTaskActions();
    }

    bindTaskActions() {
        // Bind edit buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const taskCard = e.target.closest('.task-card');
                this.editTask(taskCard);
            });
        });

        // Bind delete buttons
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const taskCard = e.target.closest('.task-card');
                this.deleteTask(taskCard);
            });
        });
    }

createTask() {
    const taskData = {
        id: this.taskIdCounter++,
        type: 'Tarefa', // ou coletar do form se houver
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-description').value,
        priority: document.getElementById('task-priority').value,
        date: document.getElementById('task-date').value,
        status: document.getElementById('task-status').value
    };

    this.tasks.push(taskData);
    this.renderTask(taskData);
    this.updateTaskCounts();

    // Fechar modal
    document.getElementById('modal-nova-tarefa').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('form-nova-tarefa').reset();
}

bindDragAndDrop() {
    const tasks = document.querySelectorAll('.task-card');
    const columns = document.querySelectorAll('.tasks-container');

    tasks.forEach(task => {
        task.setAttribute('draggable', true);

        task.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', task.dataset.taskId);
        });
    });

    columns.forEach(column => {
        column.addEventListener('dragover', (e) => e.preventDefault());

        column.addEventListener('drop', (e) => {
            e.preventDefault();
            const taskId = e.dataTransfer.getData('text/plain');
            const taskCard = document.querySelector(`.task-card[data-task-id='${taskId}']`);
            column.appendChild(taskCard);

            // Atualizar status no array
            const columnStatus = column.parentElement.querySelector('.column-header').classList[1];
            const task = this.tasks.find(t => t.id == taskId);
            if (task) task.status = columnStatus;

            this.updateTaskCounts();
        });
    });
}

    renderTask(task) {
        const taskHTML = this.createTaskHTML(task);
        const targetColumn = document.querySelector(`.kanban-column .column-header.${task.status}`).parentElement;
        const tasksContainer = targetColumn.querySelector('.tasks-container');
        
        tasksContainer.insertAdjacentHTML('beforeend', taskHTML);
        
        // Bind events for the new task
        const newTaskCard = tasksContainer.lastElementChild;
        this.bindTaskCardEvents(newTaskCard);
    }

    createTaskHTML(task) {
        const priorityClass = task.priority === 'alta' ? 'alta' : task.priority === 'media' ? 'media' : 'baixa';
        const priorityText = task.priority === 'alta' ? 'Alta' : task.priority === 'media' ? 'Média' : 'Baixa';
        const formattedDate = this.formatDate(task.date);

        return `
            <div class="task-card" data-task-id="${task.id}">
                <div class="task-type">${task.type}</div>
                <h3 class="task-title">${task.title}</h3>
                <p class="task-description">${task.description}</p>
                <div class="task-footer">
                    <span class="task-badge ${priorityClass}">${priorityText}</span>
                    <span class="task-date">${formattedDate}</span>
                    <div class="task-actions">
                        <button class="btn-edit">✏️</button>
                        <button class="btn-delete">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    }

    bindTaskCardEvents(taskCard) {
        const editBtn = taskCard.querySelector('.btn-edit');
        const deleteBtn = taskCard.querySelector('.btn-delete');

        editBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.editTask(taskCard);
        });

        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.deleteTask(taskCard);
        });
    }

    editTask(taskCard) {
        const taskId = parseInt(taskCard.dataset.taskId);
        const task = this.tasks.find(t => t.id === taskId);
        
        if (task) {
            // Simular edição (em uma aplicação real, abriria um modal de edição)
            const newStatus = prompt('Alterar status para (a-fazer, em-andamento, concluido):', task.status);
            
            if (newStatus && ['a-fazer', 'em-andamento', 'concluido'].includes(newStatus)) {
                const oldStatus = task.status;
                task.status = newStatus;
                
                // Move task to new column if status changed
                if (oldStatus !== newStatus) {
                    taskCard.remove();
                    this.renderTask(task);
                    this.updateTaskCounts();
                }
                
                this.showNotification('info', 'Status Atualizado', `Status da tarefa "${task.title}" foi alterado para "${this.getStatusText(newStatus)}"`);
            }
        }
    }

    deleteTask(taskCard) {
        const taskId = parseInt(taskCard.dataset.taskId);
        const task = this.tasks.find(t => t.id === taskId);
        
        if (task && confirm(`Tem certeza que deseja excluir a tarefa "${task.title}"?`)) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            taskCard.remove();
            this.updateTaskCounts();
            
            this.showNotification('warning', 'Tarefa Excluída', `A tarefa "${task.title}" foi excluída com sucesso.`);
        }
    }

    updateTaskCounts() {
        const columns = {
            'a-fazer': document.querySelector('.column-header.a-fazer .task-count'),
            'em-andamento': document.querySelector('.column-header.em-andamento .task-count'),
            'concluido': document.querySelector('.column-header.concluido .task-count')
        };

        Object.keys(columns).forEach(status => {
            const count = document.querySelectorAll(`.column-header.${status}`).length > 0 
                ? document.querySelector(`.column-header.${status}`).parentElement.querySelectorAll('.task-card').length 
                : 0;
            if (columns[status]) {
                columns[status].textContent = count;
            }
        });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    }

    getStatusText(status) {
        const statusMap = {
            'a-fazer': 'A fazer',
            'em-andamento': 'Em andamento',
            'concluido': 'Concluído'
        };
        return statusMap[status] || status;
    }

    loadInitialTasks() {
        // Carregar tarefas existentes do DOM para o array
        document.querySelectorAll('.task-card').forEach(taskCard => {
            const task = {
                id: this.taskIdCounter++,
                type: taskCard.querySelector('.task-type').textContent,
                title: taskCard.querySelector('.task-title').textContent,
                description: taskCard.querySelector('.task-description').textContent,
                priority: taskCard.querySelector('.task-badge').textContent.toLowerCase(),
                date: taskCard.querySelector('.task-date').textContent,
                status: this.getStatusFromColumn(taskCard)
            };
            
            taskCard.dataset.taskId = task.id;
            this.tasks.push(task);
        });

        this.bindTaskActions();
    }

    getStatusFromColumn(taskCard) {
        const column = taskCard.closest('.kanban-column');
        if (column.querySelector('.a-fazer')) return 'a-fazer';
        if (column.querySelector('.em-andamento')) return 'em-andamento';
        if (column.querySelector('.concluido')) return 'concluido';
        return 'a-fazer';
    }

    // Sistema de Notificações
    showNotification(type, title, message) {
        const container = document.getElementById('notification-container');
        const notificationId = 'notification-' + Date.now();
        
        const icons = {
            success: '✅',
            info: 'ℹ️',
            warning: '⚠️',
            error: '❌'
        };

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.id = notificationId;
        
        notification.innerHTML = `
            <div class="notification-icon">${icons[type]}</div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">&times;</button>
            <div class="notification-progress"></div>
        `;

        container.appendChild(notification);

        // Bind close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.removeNotification(notificationId);
        });

        // Auto remove after 4 seconds
        setTimeout(() => {
            this.removeNotification(notificationId);
        }, 4000);
    }

    removeNotification(notificationId) {
        const notification = document.getElementById(notificationId);
        if (notification) {
            notification.style.animation = 'notificationSlideOut 0.3s ease-in forwards';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }
}

// Adicionar animação de saída para notificações
const style = document.createElement('style');
style.textContent = `
    @keyframes notificationSlideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Inicializar o sistema quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});