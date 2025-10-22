// inicializa lucide icons quando disponível
window.addEventListener('load', () => {
    if (window.lucide) lucide.createIcons();
    carregarMunicipiosSergipe();
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
        // se for a própria página "cadastro", evita recarregar
        if (location.pathname.endsWith('/cadastro.html') || location.pathname.endsWith('cadastro.html')) {
            if (page === 'cadastro' || page === '') return;
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

/* ========== DADOS DE SERGIPE ========== */

// Municípios de Sergipe
const municipiosSergipe = [
    "Aracaju", "Amparo de São Francisco", "Aquidabã", "Arauá", "Areia Branca",
    "Barra dos Coqueiros", "Boquim", "Brejo Grande", "Campo do Brito", "Canhoba",
    "Canindé de São Francisco", "Capela", "Carira", "Carmópolis", "Cedro de São João",
    "Cristinápolis", "Cumbe", "Divina Pastora", "Estância", "Feira Nova",
    "Frei Paulo", "Gararu", "General Maynard", "Gracho Cardoso", "Ilha das Flores",
    "Indiaroba", "Itabaiana", "Itabaianinha", "Itabi", "Itaporanga d'Ajuda",
    "Japaratuba", "Japoatã", "Lagarto", "Laranjeiras", "Macambira",
    "Malhada dos Bois", "Malhador", "Maruim", "Moita Bonita", "Monte Alegre de Sergipe",
    "Muribeca", "Neópolis", "Nossa Senhora Aparecida", "Nossa Senhora da Glória",
    "Nossa Senhora das Dores", "Nossa Senhora de Lourdes", "Nossa Senhora do Socorro",
    "Pacatuba", "Pedra Mole", "Pedrinhas", "Pinhão", "Pirambu",
    "Poço Redondo", "Poço Verde", "Porto da Folha", "Propriá", "Riachão do Dantas",
    "Riachuelo", "Ribeirópolis", "Rosário do Catete", "Salgado", "Santa Luzia do Itanhy",
    "Santa Rosa de Lima", "Santana do São Francisco", "Santo Amaro das Brotas",
    "São Cristóvão", "São Domingos", "São Francisco", "São Miguel do Aleixo",
    "Simão Dias", "Siriri", "Telha", "Tobias Barreto", "Tomar do Geru",
    "Umbaúba"
];

// Bairros por município (exemplos)
const bairrosPorMunicipio = {
    "Aracaju": [
        "Centro", "Atalaia", "Coroa do Meio", "São José", "Grageru", "Jardins",
        "Inácio Barbosa", "Luzia", "13 de Julho", "Salgado Filho", "Getúlio Vargas",
        "Siqueira Campos", "Suíssa", "Jardim Centenário", "Farolândia", "Ponto Novo"
    ],
    "São Cristóvão": [
        "Centro", "Rosa Elze", "São José", "Santo Antônio", "Marcela", "João Bebe Água"
    ],
    "Lagarto": [
        "Centro", "Alto da Boa Vista", "São José", "Novo Horizonte", "Santo Antônio"
    ],
    "Itabaiana": [
        "Centro", "Queimadas", "Marianga", "São Cristóvão", "Santo Antônio"
    ],
    "Estância": [
        "Centro", "Piaçaveira", "Porto", "Centro Industrial", "Novo Horizonte"
    ],
    "Nossa Senhora do Socorro": [
        "Centro", "Marcelo Deda", "Conj. João Alves", "Conj. Marcos Freire", "Santo Antônio"
    ],
    "Laranjeiras": [
        "Centro", "Alto da Boa Vista", "Comendador Travassos", "Pedra Branca"
    ],
    "Tobias Barreto": [
        "Centro", "Boa Vista", "São José", "Novo Horizonte"
    ],
    "Simão Dias": [
        "Centro", "Alto da Glória", "São José", "Boa Vista"
    ],
    "Propriá": [
        "Centro", "Santa Cruz", "São João", "Novo Horizonte"
    ]
};

// Para municípios sem bairros específicos, usar bairros genéricos
const bairrosGenericos = [
    "Centro", "Zona Rural", "Bairro Novo", "Vila Operária", "Jardim das Flores",
    "São José", "Santo Antônio", "Santa Cruz", "Boa Vista", "Novo Horizonte"
];

/* ========== FUNÇÕES DE FORMATAÇÃO E CARREGAMENTO ========== */

// Função para formatar telefone no formato (XX) XXXXX-XXXX
function formatarTelefone(input) {
    // Remove tudo que não é número
    let value = input.value.replace(/\D/g, '');

    // Formata o telefone
    if (value.length <= 10) {
        value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
        value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }

    input.value = value;
}

// Função para carregar municípios de Sergipe
function carregarMunicipiosSergipe() {
    const selectMunicipio = document.getElementById('municipio');

    // Limpa opções existentes (exceto a primeira)
    while (selectMunicipio.children.length > 1) {
        selectMunicipio.removeChild(selectMunicipio.lastChild);
    }

    // Adiciona todos os municípios de Sergipe
    municipiosSergipe.forEach(municipio => {
        const option = document.createElement('option');
        option.value = municipio;
        option.textContent = municipio;
        selectMunicipio.appendChild(option);
    });
}

// Função para atualizar bairros baseado no município selecionado
function atualizarBairros() {
    const municipioSelecionado = document.getElementById('municipio').value;
    const selectBairro = document.getElementById('bairro');

    // Limpa opções existentes
    selectBairro.innerHTML = '<option value="">Selecione o bairro</option>';

    if (municipioSelecionado) {
        let bairros = bairrosPorMunicipio[municipioSelecionado];

        // Se não houver bairros específicos para o município, usar bairros genéricos
        if (!bairros) {
            bairros = bairrosGenericos;
        }

        // Adiciona os bairros ao select
        bairros.forEach(bairro => {
            const option = document.createElement('option');
            option.value = bairro;
            option.textContent = bairro;
            selectBairro.appendChild(option);
        });
    }
}

/* ========== Funcionalidade de Cadastro ========== */

// Simulação de permissões (em uma aplicação real, isso viria do backend)
const userPermissions = {
    canViewMap: true,
    canViewList: true,
    canExport: true
};

// Dados de exemplo para o mapa e tabela
let contatos = JSON.parse(localStorage.getItem('contatos')) || [
    {
        id: 1,
        nome: "João Silva",
        email: "joao.silva@email.com",
        telefone: "(79) 99999-9999",
        cidade: "Aracaju",
        bairro: "Centro",
        status: "ativo",
        dataCadastro: "15/07/2024",
        lat: -10.9111,
        lng: -37.0717
    },
    {
        id: 2,
        nome: "Maria Santos",
        email: "maria.santos@email.com",
        telefone: "(79) 98888-8888",
        cidade: "São Cristóvão",
        bairro: "Centro",
        status: "ativo",
        dataCadastro: "14/07/2024",
        lat: -11.0144,
        lng: -37.2064
    },
    {
        id: 3,
        nome: "Pedro Oliveira",
        email: "pedro.oliveira@email.com",
        telefone: "(79) 97777-7777",
        cidade: "Lagarto",
        bairro: "São José",
        status: "inativo",
        dataCadastro: "10/07/2024",
        lat: -10.9167,
        lng: -37.6500
    }
];

// Verificar permissões e mostrar/ocultar seções
function checkPermissions() {
    if (!userPermissions.canViewMap) {
        document.getElementById('heatMapSection').style.display = 'none';
    }
    if (!userPermissions.canViewList) {
        document.getElementById('contactsTableSection').style.display = 'none';
    }
    if (!userPermissions.canExport) {
        document.querySelector('button[onclick="exportContacts()"]').style.display = 'none';
    }
}

// Funções do Mapa
let mapaAtual = 'pontos';

function mostrarPontosIndividuais() {
    mapaAtual = 'pontos';
    atualizarBotoesMapa('btnPontos');
    atualizarVisualizacaoMapa();
}

function mostrarContadoresBairro() {
    mapaAtual = 'bairros';
    atualizarBotoesMapa('btnBairros');
    atualizarVisualizacaoMapa();
}

function mostrarMapaCalor() {
    mapaAtual = 'calor';
    atualizarBotoesMapa('btnCalor');
    atualizarVisualizacaoMapa();
}

function atualizarBotoesMapa(botaoAtivo) {
    document.getElementById('btnPontos').className = 'btn btn-outline';
    document.getElementById('btnBairros').className = 'btn btn-outline';
    document.getElementById('btnCalor').className = 'btn btn-outline';
    document.getElementById(botaoAtivo).className = 'btn btn-primary';
}

function atualizarVisualizacaoMapa() {
    let mensagem = '';
    switch (mapaAtual) {
        case 'pontos':
            mensagem = 'Visualizando Pontos Individuais no Google Maps';
            break;
        case 'bairros':
            mensagem = 'Visualizando Contadores por Bairro no Google Maps';
            break;
        case 'calor':
            mensagem = 'Visualizando Mapa de Calor no Google Maps';
            break;
    }

    console.log(mensagem);
}

// Funções do Formulário de Cadastro
function abrirNovoCadastro() {
    document.getElementById('novoCadastroSection').style.display = 'block';
    document.getElementById('novoCadastroSection').scrollIntoView({ behavior: 'smooth' });
}

function fecharNovoCadastro() {
    document.getElementById('novoCadastroSection').style.display = 'none';
    document.getElementById('formNovoCadastro').reset();

    // Restaurar comportamento padrão do formulário
    const form = document.getElementById('formNovoCadastro');
    form.onsubmit = function (e) {
        e.preventDefault();
        salvarNovoContato();
    };
    form.querySelector('button[type="submit"]').textContent = 'Salvar Cadastro';
}

function editarContato(id) {
    const contato = contatos.find(c => c.id === id);
    if (contato) {
        // Preencher o formulário com os dados do contato
        document.getElementById('nomeCompleto').value = contato.nome;
        document.getElementById('idade').value = contato.idade || '';
        document.getElementById('sexo').value = contato.sexo || '';
        document.getElementById('email').value = contato.email;
        document.getElementById('celular').value = contato.telefone;
        document.getElementById('municipio').value = contato.cidade;

        // Atualizar bairros para o município selecionado
        atualizarBairros();
        setTimeout(() => {
            document.getElementById('bairro').value = contato.bairro;
        }, 100);

        document.getElementById('escolaridade').value = contato.escolaridade || '';
        document.getElementById('assessor').value = contato.assessor || '';
        document.getElementById('assunto').value = contato.assunto || '';
        document.getElementById('observacao').value = contato.observacao || '';

        // Abrir o formulário
        abrirNovoCadastro();

        // Alterar o comportamento do formulário para edição
        const form = document.getElementById('formNovoCadastro');
        form.onsubmit = function (e) {
            e.preventDefault();
            salvarEdicaoContato(id);
        };

        // Alterar o texto do botão
        form.querySelector('button[type="submit"]').textContent = 'Atualizar Cadastro';
    }
}

function salvarEdicaoContato(id) {
    const contatoIndex = contatos.findIndex(c => c.id === id);
    if (contatoIndex !== -1) {
        contatos[contatoIndex] = {
            ...contatos[contatoIndex],
            nome: document.getElementById('nomeCompleto').value,
            idade: document.getElementById('idade').value,
            sexo: document.getElementById('sexo').value,
            email: document.getElementById('email').value,
            telefone: document.getElementById('celular').value,
            cidade: document.getElementById('municipio').value,
            bairro: document.getElementById('bairro').value,
            escolaridade: document.getElementById('escolaridade').value,
            assessor: document.getElementById('assessor').value,
            assunto: document.getElementById('assunto').value,
            observacao: document.getElementById('observacao').value
        };

        salvarContatos();
        carregarTabelaContatos();
        fecharNovoCadastro();
        alert('Contato atualizado com sucesso!');
    }
}

function excluirContato(id) {
    if (confirm('Tem certeza que deseja excluir este contato?')) {
        contatos = contatos.filter(c => c.id !== id);
        salvarContatos();
        carregarTabelaContatos();
        alert('Contato excluído com sucesso!');
    }
}

function salvarNovoContato() {
    const novoContato = {
        id: Date.now(),
        nome: document.getElementById('nomeCompleto').value,
        idade: document.getElementById('idade').value,
        sexo: document.getElementById('sexo').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('celular').value,
        cidade: document.getElementById('municipio').value,
        bairro: document.getElementById('bairro').value,
        escolaridade: document.getElementById('escolaridade').value,
        assessor: document.getElementById('assessor').value,
        assunto: document.getElementById('assunto').value,
        observacao: document.getElementById('observacao').value,
        status: 'ativo',
        dataCadastro: new Date().toLocaleDateString('pt-BR'),
        lat: -10.9263 + (Math.random() - 0.5) * 0.1,
        lng: -37.0785 + (Math.random() - 0.5) * 0.1
    };

    contatos.push(novoContato);
    salvarContatos();
    carregarTabelaContatos();
    fecharNovoCadastro();
    alert('Contato cadastrado com sucesso!');
}

function salvarContatos() {
    localStorage.setItem('contatos', JSON.stringify(contatos));
}

function carregarTabelaContatos() {
    const tbody = document.getElementById('contactsTableBody');
    tbody.innerHTML = '';

    contatos.forEach(contato => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${contato.nome}</td>
          <td>${contato.email}</td>
          <td>${contato.telefone}</td>
          <td>${contato.cidade}</td>
          <td>${contato.bairro}</td>
          <td><span class="badge ${contato.status}">${contato.status === 'ativo' ? 'Ativo' : 'Inativo'}</span></td>
          <td>${contato.dataCadastro}</td>
          <td>
            <div class="actions">
              <button class="btn-icon" onclick="editarContato(${contato.id})"><i data-lucide="edit-2"></i></button>
              <button class="btn-icon" onclick="excluirContato(${contato.id})"><i data-lucide="trash-2"></i></button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
    });

    // Atualizar ícones Lucide
    if (window.lucide) {
        lucide.createIcons();
    }

    atualizarEstatisticas();
}

function exportContacts() {
    if (!userPermissions.canExport) {
        alert('Você não tem permissão para exportar contatos.');
        return;
    }

    // Simular exportação
    const csvContent = "data:text/csv;charset=utf-8,"
        + "Nome,E-mail,Telefone,Cidade,Bairro,Status,Data Cadastro\n"
        + contatos.map(contato =>
            `"${contato.nome}","${contato.email}","${contato.telefone}","${contato.cidade}","${contato.bairro}","${contato.status}","${contato.dataCadastro}"`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "contatos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Evento do formulário de cadastro
document.getElementById('formNovoCadastro').addEventListener('submit', function (e) {
    e.preventDefault();
    salvarNovoContato();
});

// Atualizar estatísticas
function atualizarEstatisticas() {
    const activeContacts = contatos.filter(c => c.status === 'ativo').length;
    const cidadesUnicas = [...new Set(contatos.map(c => c.cidade))].length;
    const hoje = new Date().toLocaleDateString('pt-BR');
    const novosHoje = contatos.filter(c => c.dataCadastro === hoje).length;

    document.getElementById('totalContacts').textContent = contatos.length;
    document.getElementById('activeContacts').textContent = activeContacts;
    document.getElementById('newToday').textContent = novosHoje;
    document.getElementById('totalCities').textContent = cidadesUnicas;
}

// Inicializar
checkPermissions();
carregarTabelaContatos();
mostrarPontosIndividuais(); // Inicializar com pontos individuais

// Simular carregamento de dados
setTimeout(() => {
    console.log('Dados de contatos carregados');
}, 1000);