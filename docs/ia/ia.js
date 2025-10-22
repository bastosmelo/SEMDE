// ===== FUNÇÃO PARA LER DADOS DAS TAREFAS =====
function getTaskData() {
    const data = {
        total: 0,
        todo: 0,
        doing: 0,
        done: 0,
        tasks: []
    };

    // Lê os contadores principais
    data.total = parseInt(document.getElementById('totalTasks')?.textContent || 0);
    data.todo = parseInt(document.getElementById('todoTasks')?.textContent || 0);
    data.doing = parseInt(document.getElementById('doingTasks')?.textContent || 0);
    data.done = parseInt(document.getElementById('doneTasks')?.textContent || 0);

    // Coleta todas as tarefas individuais
    const taskCards = document.querySelectorAll('.task-card');
    
    taskCards.forEach((card, index) => {
        const title = card.querySelector('.task-title')?.textContent || 'Sem título';
        const description = card.querySelector('.task-description')?.textContent || '';
        const type = card.querySelector('.task-type')?.textContent || 'Geral';
        const priority = card.querySelector('.task-badge')?.textContent || 'Média';
        const date = card.querySelector('.task-date')?.textContent || '';
        
        // Determina a coluna (status)
        const column = card.closest('.kanban-column');
        let status = 'desconhecido';
        if (column) {
            const header = column.querySelector('.column-header h2')?.textContent;
            if (header?.includes('fazer')) status = 'a fazer';
            else if (header?.includes('andamento')) status = 'em andamento';
            else if (header?.includes('Concluído')) status = 'concluído';
        }

        data.tasks.push({
            id: index + 1,
            title,
            description,
            type,
            priority: priority.toLowerCase(),
            date,
            status
        });
    });

    return data;
}

(function () {
  // ===== CONFIGURAÇÃO =====
  const SERVER_URL = "http://localhost:3000/chat"; // seu servidor IA real
  const FETCH_TIMEOUT = 8000;

  // ===== ELEMENTOS =====
  const chat = document.getElementById("iaChat");
  const input = document.getElementById("iaInput");
  const sendBtn = document.getElementById("iaSend");
  const optionsEl = document.getElementById("iaOptions");
  const mascote = document.getElementById("iaMascote");
  const iaWidget = document.querySelector(".ia-widget");
  let chatOpen = false;
  let pending = false;

  // ===== INTENTS =====
  const intents = [
    {
      keys: ["oi", "olá", "bom dia", "boa tarde", "boa noite"],
      reply: "",
      options: [],
      name: "Saudação",
      dynamicReply: true
    },
    {
      keys: ["dashboard", "painel de controle", "total de tarefas", "resumo das tarefas", "mapa de ações", "distribuição por sexo", "total de cadastros", "mediaidade", "bairros atendidos"],
      reply: "Você pode ver todas essas informações na seção Dashboard.",
      options: [{ text: "Ir para Dashboard", link: "./dashboard.html" }],
      name: "Dashboard"
    },
    {
      keys: ["ações", "mapa de calor", "registros de ações", "registros por cidades", "pontos de cidades", "nova ação", "criar ação"],
      reply: "Todas essas funções estão na seção Ações.",
      options: [{ text: "Ir para Ações", link: "./acoes.html" }],
      name: "Ações"
    },
    {
      keys: ["gestão de tarefas", "kanban", "tarefas", "criar tarefa", "tarefas pendentes", "alterar estado de tarefa", "tarefas faltando"],
      reply: "Você pode gerenciar suas tarefas na seção Gestão de Tarefas.",
      options: [{ text: "Ir para Gestão de Tarefas", link: "./tarefas.html" }],
      name: "Gestão de Tarefas"
    },
    {
      keys: ["cadastro", "cadastrar pessoa", "novas pessoas", "contatos cadastrados", "contatos"],
      reply: "Tudo sobre cadastro de pessoas está na seção Cadastro.",
      options: [{ text: "Ir para Cadastro", link: "./cadastro.html" }],
      name: "Cadastro"
    },
    {
      keys: ["financeiro", "histórico financeiro", "criar registro financeiro", "exportar registros", "exportar para excel", "registro"],
      reply: "Você pode gerenciar o financeiro nesta seção.",
      options: [{ text: "Ir para Financeiro", link: "./financeiro.html" }],
      name: "Financeiro"
    },
    {
      keys: ["eleição", "última eleição", "total de votos", "votos por bairros", "média de votos por bairros"],
      reply: "As informações sobre eleições estão na seção Eleição.",
      options: [{ text: "Ir para Eleição", link: "./eleicao.html" }],
      name: "Eleição"
    },
    {
      keys: ["configuração", "alterar senha", "mudar nome", "tipo de perfil", "mudar e-mail", "permissões", "lista de usuários", "mudar usuários", "senha"],
      reply: "Você pode alterar configurações nesta seção.",
      options: [{ text: "Ir para Configuração", link: "./configuracao.html" }],
      name: "Configuração"
    },
    {
      keys: ["oq voce pode fazer", "o que você pode fazer", "funções", "ajuda"],
      reply: "Posso te ajudar a navegar pelas seções do site e responder perguntas sobre Dashboard, Ações, Tarefas, Cadastro, Financeiro, Eleição e Configuração.",
      options: [],
      name: "Funções"
    },
    {
        keys: ["total de tarefas", "quantas tarefas no total", "quantas tarefas tenho"],
        reply: "",
        options: [],
        name: "TotalTarefas",
        dynamicReply: true
    },
    {
        keys: ["tarefas a fazer", "quantas tarefas a fazer", "tarefas pendentes"],
        reply: "",
        options: [],
        name: "TarefasAFazer", 
        dynamicReply: true
    },
    {
        keys: ["tarefas em andamento", "quantas tarefas em andamento", "tarefas fazendo"],
        reply: "",
        options: [],
        name: "TarefasEmAndamento",
        dynamicReply: true
    },
    {
        keys: ["tarefas concluídas", "quantas tarefas concluídas", "tarefas finalizadas"],
        reply: "",
        options: [],
        name: "TarefasConcluidas",
        dynamicReply: true
    },
    {
        keys: ["dados das tarefas", "listar tarefas", "todas as tarefas", "quais são as tarefas"],
        reply: "",
        options: [],
        name: "ListarTarefas",
        dynamicReply: true
    },
    {
        keys: ["resumo das tarefas", "status das tarefas", "como estão as tarefas"],
        reply: "",
        options: [],
        name: "ResumoTarefas",
        dynamicReply: true
    }
  ];

  // ===== FUNÇÕES AUXILIARES =====
  function addUserMessage(text) {
    const el = document.createElement("div");
    el.className = "ia-msg ia-msg-user";
    el.textContent = text;
    chat.appendChild(el);
    scrollToBottom();
  }

  function addBotMessage(text) {
    const el = document.createElement("div");
    el.className = "ia-msg ia-msg-bot";
    chat.appendChild(el);
    scrollToBottom();

    // ===== Digitação letra por letra =====
    let i = 0;

    // Mascote começa a falar
    mascote.classList.remove("normal", "chat");
    mascote.classList.add("talking");

    const interval = setInterval(() => {
      el.textContent += text[i];
      i++;
      scrollToBottom();

      if (i >= text.length) {
        clearInterval(interval);

        // Mascote volta para estado parado com chat aberto ou normal
        if (chatOpen) {
          mascote.classList.remove("talking");
          mascote.classList.add("chat");
        } else {
          mascote.classList.remove("talking");
          mascote.classList.add("normal");
        }
      }
    }, 40);
  }

  function scrollToBottom() {
    chat.scrollTop = chat.scrollHeight + 200;
  }

  function showOptions(options) {
    optionsEl.innerHTML = "";
    if (!options || !options.length) {
      optionsEl.style.display = "none";
      return;
    }
    options.forEach(opt => {
      const btn = document.createElement("button");
      btn.textContent = opt.text || "Abrir";
      btn.addEventListener("click", () => {
        if (opt.link) window.location.href = opt.link;
        else if (opt.onClick && typeof opt.onClick === "function") opt.onClick();
      });
      optionsEl.appendChild(btn);
    });
    optionsEl.style.display = "flex";
  }

// Função melhorada para matching de palavras-chave
function matchIntent(text) {
    const t = (text || "").toLowerCase().trim();
    
    // Verifica palavras específicas sobre tarefas primeiro
    const taskKeywords = ['tarefa', 'tarefas', 'task', 'tasks'];
    const hasTaskKeyword = taskKeywords.some(keyword => t.includes(keyword));
    
    if (hasTaskKeyword) {
        if (t.includes('total') || t.includes('quantas') && (t.includes('todas') || t.includes('no total'))) {
            return intents.find(i => i.name === "TotalTarefas");
        }
        if (t.includes('fazer') || t.includes('pendente')) {
            return intents.find(i => i.name === "TarefasAFazer");
        }
        if (t.includes('andamento') || t.includes('fazendo')) {
            return intents.find(i => i.name === "TarefasEmAndamento");
        }
        if (t.includes('concluída') || t.includes('finalizada') || t.includes('pronta')) {
            return intents.find(i => i.name === "TarefasConcluidas");
        }
        if (t.includes('lista') || t.includes('quais') || t.includes('dados')) {
            return intents.find(i => i.name === "ListarTarefas");
        }
        if (t.includes('resumo') || t.includes('status') || t.includes('como estão')) {
            return intents.find(i => i.name === "ResumoTarefas");
        }
    }
    
    // Matching normal para outros intents
    for (const intent of intents) {
        for (const key of intent.keys) {
            if (t.includes(key.toLowerCase())) return intent;
        }
    }
    return null;
}
function fallbackResponder(text) {
    const intent = matchIntent(text);
    
    if (intent && intent.dynamicReply) {
        const taskData = getTaskData();
        
        switch(intent.name) {
            case "Saudação":
                const hour = new Date().getHours();
                if (hour < 12)
                    return { 
                        reply: "Bom dia! 😊 Estou aqui para te ajudar. Você pode me perguntar sobre Dashboard, Ações, Tarefas, Cadastro, Financeiro, Eleição ou Configuração.",
                        options: []
                    };
                else if (hour < 18)
                    return { 
                        reply: "Boa tarde! 😊 Estou aqui para te ajudar. Você pode me perguntar sobre Dashboard, Ações, Tarefas, Cadastro, Financeiro, Eleição ou Configuração.",
                        options: []
                    };
                else
                    return { 
                        reply: "Boa noite! 😊 Estou aqui para te ajudar. Você pode me perguntar sobre Dashboard, Ações, Tarefas, Cadastro, Financeiro, Eleição ou Configuração.",
                        options: []
                    };

            case "TotalTarefas":
                return {
                    reply: `Você tem ${taskData.total} tarefas no total. 📊`,
                    options: []
                };

            case "TarefasAFazer":
                return {
                    reply: `Você tem ${taskData.todo} tarefas para fazer. 📝`,
                    options: []
                };

            case "TarefasEmAndamento":
                return {
                    reply: `Você tem ${taskData.doing} tarefas em andamento. 🔄`,
                    options: []
                };

            case "TarefasConcluidas":
                return {
                    reply: `Você tem ${taskData.done} tarefas concluídas. ✅`,
                    options: []
                };

            case "ResumoTarefas":
                return {
                    reply: `📊 **Resumo das suas tarefas:**\n\n• Total: ${taskData.total} tarefas\n• A fazer: ${taskData.todo}\n• Em andamento: ${taskData.doing}\n• Concluídas: ${taskData.done}`,
                    options: []
                };

            case "ListarTarefas":
                if (taskData.tasks.length === 0) {
                    return {
                        reply: "Não encontrei nenhuma tarefa no momento. 📭",
                        options: []
                    };
                }
                
                let taskList = "📋 **Suas tarefas:**\n\n";
                taskData.tasks.forEach(task => {
                    const emoji = {
                        'a fazer': '📝',
                        'em andamento': '🔄', 
                        'concluído': '✅'
                    }[task.status] || '📌';
                    
                    taskList += `${emoji} **${task.title}**\n`;
                    taskList += `   📌 Tipo: ${task.type}\n`;
                    taskList += `   ⚡ Prioridade: ${task.priority}\n`;
                    taskList += `   📅 Data: ${task.date}\n`;
                    taskList += `   🎯 Status: ${task.status}\n\n`;
                });
                
                return {
                    reply: taskList,
                    options: []
                };
        }
        
        // Se for outro dynamicReply, usa a reply padrão do intent
        return { reply: intent.reply, options: intent.options };
    }
    
    if (intent) {
        return { reply: intent.reply, options: intent.options };
    }

    return {
        reply: "Desculpe, não entendi direito. Pode explicar de outro jeito? 😊",
        options: []
    };
}

  async function callServer(message) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
      const res = await fetch(SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
        signal: controller.signal
      });
      clearTimeout(id);

      if (!res.ok) throw new Error("Resposta do servidor não OK: " + res.status);

      const data = await res.json();
      if (typeof data === "string") return { reply: data, options: [] };
      return { reply: data.reply || data.text || "Sem resposta :(", options: data.options || [] };
    } catch (err) {
      clearTimeout(id);
      console.warn("Falha ao chamar servidor IA:", err.message || err);
      throw err;
    }
  }

  async function sendMessage(text) {
    if (!text || pending) return;
    pending = true;
    optionsEl.style.display = "none";

    addUserMessage(text);
    input.value = "";
    input.disabled = true;
    sendBtn.disabled = true;

    try {
      const serverResp = await callServer(text);
      addBotMessage(serverResp.reply);
      showOptions(serverResp.options || []);
    } catch (err) {
      const local = fallbackResponder(text);
      addBotMessage(local.reply);
      showOptions(local.options);
    } finally {
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
      pending = false;
    }
  }

  sendBtn.addEventListener("click", () => sendMessage(input.value.trim()));
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") sendMessage(input.value.trim()); });

  function addSystemNote(text) {
    const el = document.createElement("div");
    el.style.fontSize = "12px";
    el.style.opacity = "0.7";
    el.style.marginTop = "6px";
    el.textContent = text;
    chat.appendChild(el);
    scrollToBottom();
  }

  input.addEventListener("input", () => {
    const t = input.value.toLowerCase();
    if (!t) return showOptions([]);

    const matches = intents
      .filter(intent =>
        intent.keys.some(k => k.toLowerCase().includes(t) || t.includes(k.toLowerCase()))
      )
      .filter(intent => !intent.dynamicReply)
      .map(i => ({
        text: i.name ? `Ir para ${i.name}` : "Ver detalhes",
        link: i.options[0]?.link
      }));

    showOptions(matches.slice(0, 5));
  });

  addSystemNote("Lembrete: bote um nome para ele tá? esqueça nn viu");

  // Saudação inicial (sem mascote falando)
  function addInitialMessage(text) {
    const el = document.createElement("div");
    el.className = "ia-msg ia-msg-bot";
    el.textContent = text;
    chat.appendChild(el);
    scrollToBottom();
  }

  const hour = new Date().getHours();
  if (hour < 12)
    addInitialMessage("Bom dia! 😊 Sou seu assistente. Posso tirar dúvidas e mostrar links do site.");
  else if (hour < 18)
    addInitialMessage("Boa tarde! 😊 Sou seu assistente. Posso tirar dúvidas e mostrar links do site.");
  else
    addInitialMessage("Boa noite! 😊 Sou seu assistente. Posso tirar dúvidas e mostrar links do site.");

  // ===== MASCOTE =====
  // ===== Funções de mascote =====
  function setMascoteState(state) {
    mascote.classList.remove("normal", "chat", "talking", "enlarge", "closeAnimation");
    const img = mascote.querySelector("img");

    switch (state) {
      case "normal":
        mascote.classList.add("normal");
        img.src = "../docs/ia/parado.png";
        break;
      case "chat":
        mascote.classList.add("chat");
        img.src = "../docs/ia/normal.gif";
        break;
      case "talking":
        mascote.classList.add("talking");
        img.src = "../docs/ia/fala.gif";
        break;
      case "enlarge":
        mascote.classList.add("enlarge");
        img.src = "../docs/ia/aumenta.gif";
        break;
      case "closeAnimation":
        mascote.classList.add("closeAnimation");
        img.src = "../docs/ia/fecha.gif"; // GIF tirando os óculos
        break;
    }
  }

  // ===== Função para mascote falar letra por letra =====
  function playTalking(text, callback) {
    setMascoteState("talking");
    let i = 0;
    const el = chat.lastElementChild; // assume que já foi criado o elemento bot
    el.textContent = "";

    const interval = setInterval(() => {
      el.textContent += text[i];
      scrollToBottom();
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        callback && callback();
      }
    }, 40);
  }

  // ===== Evento click mascote =====
  mascote.addEventListener("click", () => {
    chatOpen = !chatOpen;
    const img = mascote.querySelector("img");

    if (chatOpen) {
      iaWidget.classList.add("open");
      setMascoteState("enlarge");

      // reinicia GIF de aumentar
      img.src = `../docs/ia/aumenta.gif?${Date.now()}`;
      setTimeout(() => setMascoteState("chat"), 360); // duração do GIF
    } else {
      iaWidget.classList.remove("open");

      // animação de fechar
      setMascoteState("closeAnimation");
      img.src = `../docs/ia/fecha.gif?${Date.now()}`;

      // depois de terminar o GIF, volta para normal
      setTimeout(() => setMascoteState("normal"), 360); // ajuste conforme duração do seu GIF
    }
  });

  // ===== Uso no envio de mensagem =====
  function addBotMessage(text) {
    const el = document.createElement("div");
    el.className = "ia-msg ia-msg-bot";
    chat.appendChild(el);
    scrollToBottom();

    playTalking(text, () => {
      if (chatOpen) setMascoteState("chat");
      else setMascoteState("normal");
    });
  }

})();
