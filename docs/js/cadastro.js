// Sistema de gerenciamento de contatos - VERSÃO SIMPLIFICADA
class ContactsManager {
    constructor() {
        this.contatos = this.loadInitialData();
        this.map = null;
        this.currentMarkers = [];
        this.heatLayer = null;
        this.currentView = 'pontos';
        this.nextId = this.contatos.length > 0 ? Math.max(...this.contatos.map(c => c.id)) + 1 : 1;

        console.log('ContactsManager inicializado');
        this.init();
    }

    loadInitialData() {
        const stored = localStorage.getItem('contatos');
        if (stored) {
            return JSON.parse(stored);
        }

        return [
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
            }
        ];
    }

    init() {
        console.log('Iniciando ContactsManager...');
        this.initMap();
        this.initEventListeners();
        this.carregarMunicipiosSergipe();
        this.carregarTabelaContatos();
        this.atualizarEstatisticas();
        this.refreshMap();
    }

    initMap() {
        console.log('Inicializando mapa...');
        try {
            // Centro do mapa em Sergipe
            this.map = L.map('map').setView([-10.9111, -37.0717], 10);

            // Adiciona tile layer (mapa base)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.map);

            // Inicializa com pontos individuais
            document.getElementById('btnPontos').classList.add('active');
            console.log('Mapa inicializado com sucesso');
        } catch (error) {
            console.error('Erro ao inicializar mapa:', error);
        }
    }

    initEventListeners() {
        console.log('Configurando event listeners...');

        // Botões do mapa
        document.getElementById('btnPontos').addEventListener('click', () => {
            console.log('Clicou em Pontos Individuais');
            this.setView('pontos');
        });

        document.getElementById('btnBairros').addEventListener('click', () => {
            console.log('Clicou em Contadores por Bairro');
            this.setView('bairros');
        });

        document.getElementById('btnCalor').addEventListener('click', () => {
            console.log('Clicou em Mapa de Calor');
            this.setView('calor');
        });

        // Formulário de cadastro
        document.getElementById('formNovoCadastro').addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Formulário submetido');
            this.handleFormSubmit(e);
        });

        // Formatação de telefone
        const celularInput = document.getElementById('celular');
        if (celularInput) {
            celularInput.addEventListener('input', (e) => this.formatarTelefone(e.target));
        }

        console.log('Event listeners configurados');
    }

    setView(view) {
        console.log('Mudando view para:', view);
        if (this.currentView !== view) {
            this.currentView = view;
            this.updateButtonStates(view);
            this.refreshMap();
        }
    }

    updateButtonStates(activeView) {
        console.log('Atualizando botões para:', activeView);
        const buttons = {
            'pontos': document.getElementById('btnPontos'),
            'bairros': document.getElementById('btnBairros'),
            'calor': document.getElementById('btnCalor')
        };

        // Remove todas as classes ativas
        Object.values(buttons).forEach(btn => {
            if (btn) {
                btn.classList.remove('active', 'btn-danger');
                btn.classList.add('btn-outline');
            }
        });

        // Ativa o botão correto
        const activeBtn = buttons[activeView];
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.classList.remove('btn-outline');
            if (activeView === 'calor') {
                activeBtn.classList.add('btn-danger');
            }
        }
    }

    clearMap() {
        // Remove marcadores
        this.currentMarkers.forEach(marker => {
            if (this.map && marker) {
                this.map.removeLayer(marker);
            }
        });
        this.currentMarkers = [];

        // Remove heat layer
        if (this.heatLayer && this.map) {
            this.map.removeLayer(this.heatLayer);
            this.heatLayer = null;
        }
    }

    showIndividualPoints() {
        console.log('Mostrando pontos individuais');
        this.clearMap();

        this.contatos.forEach(contato => {
            const marker = L.marker([contato.lat, contato.lng])
                .bindPopup(this.createPopupContent(contato))
                .addTo(this.map);

            this.currentMarkers.push(marker);
        });

        this.fitMapToBounds();
        this.showLegend('Pontos de Contato', 'var(--primary-1)');
    }

    showNeighborhoodCounters() {
        console.log('Mostrando contadores por bairro');
        this.clearMap();

        // Agrupa contatos por bairro
        const neighborhoodCounts = {};
        this.contatos.forEach(contato => {
            if (!neighborhoodCounts[contato.bairro]) {
                neighborhoodCounts[contato.bairro] = 0;
            }
            neighborhoodCounts[contato.bairro]++;
        });

        // Adiciona marcadores de contagem por bairro
        Object.keys(neighborhoodCounts).forEach(bairro => {
            const count = neighborhoodCounts[bairro];
            const contato = this.contatos.find(c => c.bairro === bairro);

            if (contato) {
                const marker = L.marker([contato.lat, contato.lng], {
                    icon: L.divIcon({
                        className: 'neighborhood-cluster',
                        html: `<div>${count}</div>`,
                        iconSize: [30, 30]
                    })
                })
                    .bindPopup(`
                    <div>
                        <strong>${bairro}</strong><br>
                        <small>Total de contatos: ${count}</small>
                    </div>
                `)
                    .addTo(this.map);

                this.currentMarkers.push(marker);
            }
        });

        this.fitMapToBounds();
        this.showLegend('Contadores por Bairro', 'var(--primary-2)');
    }

    showHeatMap() {
        console.log('Mostrando mapa de calor');
        this.clearMap();

        // Configuração do heatmap
        const heatData = this.contatos.map(contato => [contato.lat, contato.lng, 1]);

        this.heatLayer = L.heatLayer(heatData, {
            radius: 50,
            blur: 30,
            maxZoom: 15,
            minOpacity: 0.6,
            gradient: {
                0.0: 'blue',
                0.2: 'cyan',
                0.4: 'lime',
                0.6: 'yellow',
                0.8: 'orange',
                1.0: 'red'
            }
        }).addTo(this.map);

        // Ajusta a visualização
        if (this.contatos.length > 0) {
            const points = this.contatos.map(contato => [contato.lat, contato.lng]);
            const group = new L.featureGroup(points.map(point => L.marker(point)));
            this.map.fitBounds(group.getBounds().pad(0.5));

            if (this.map.getZoom() > 12) {
                this.map.setZoom(12);
            }
        }

        this.showHeatLegend();
    }

    fitMapToBounds() {
        if (this.currentMarkers.length > 0 && this.map) {
            const group = new L.featureGroup(this.currentMarkers);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    showLegend(title, color) {
        const legend = document.getElementById('mapLegend');
        const legendContent = document.getElementById('legendContent');
        if (legend && legendContent) {
            legendContent.innerHTML = `
                <div class="legend-item">
                    <div class="legend-color" style="background: ${color}"></div>
                    <span>${title}</span>
                </div>
            `;
            legend.classList.remove('hidden');
        }
    }

    showHeatLegend() {
        const legend = document.getElementById('mapLegend');
        const legendContent = document.getElementById('legendContent');
        if (legend && legendContent) {
            legendContent.innerHTML = `
                <div style="margin-bottom: 5px;"><strong>Intensidade</strong></div>
                <div class="legend-heatmap"></div>
                <div style="display: flex; justify-content: space-between; font-size: 10px; margin-top: 3px;">
                    <span>Baixa</span>
                    <span>Alta</span>
                </div>
                <div style="font-size: 9px; color: var(--muted-2); margin-top: 5px;">
                    ${this.contatos.length} contatos no total
                </div>
            `;
            legend.classList.remove('hidden');
        }
    }

    refreshMap() {
        console.log('Atualizando mapa com view:', this.currentView);
        switch (this.currentView) {
            case 'pontos':
                this.showIndividualPoints();
                break;
            case 'bairros':
                this.showNeighborhoodCounters();
                break;
            case 'calor':
                this.showHeatMap();
                break;
        }
    }

    createPopupContent(contato) {
        return `
            <div>
                <strong>${contato.nome}</strong><br>
                <small>${contato.cidade} - ${contato.bairro}</small><br>
                <small>${contato.telefone}</small><br>
                <small>Status: ${contato.status === 'ativo' ? '✅ Ativo' : '❌ Inativo'}</small>
            </div>
        `;
    }

    // Dados de Sergipe
    carregarMunicipiosSergipe() {
        console.log('Carregando municípios...');
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
            "Simão Dias", "Siriri", "Telha", "Tobias Barreto", "Tomar do Geru", "Umbaúba"
        ];

        const selectMunicipio = document.getElementById('municipio');
        if (!selectMunicipio) {
            console.error('Elemento municipio não encontrado');
            return;
        }

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

        // Event listener para atualizar bairros
        selectMunicipio.addEventListener('change', (e) => {
            this.atualizarBairros(e.target.value);
        });

        console.log('Municípios carregados');
    }

    atualizarBairros(municipio) {
        console.log('Atualizando bairros para:', municipio);

        // Se municipio for um evento (quando chamado pelo onchange), pega o value
        if (municipio && municipio.target) {
            municipio = municipio.target.value;
        }

        const bairrosPorMunicipio = {
            "Aracaju": ["Centro", "Atalaia", "Coroa do Meio", "São José", "Grageru", "Jardins", "Inácio Barbosa", "Luzia", "13 de Julho"],
            "São Cristóvão": ["Centro", "Rosa Elze", "São José", "Santo Antônio"],
            "Lagarto": ["Centro", "Alto da Boa Vista", "São José", "Novo Horizonte"],
            "Itabaiana": ["Centro", "Queimadas", "Marianga", "São Cristóvão"],
            "Estância": ["Centro", "Piaçaveira", "Porto", "Centro Industrial"],
            "Nossa Senhora do Socorro": ["Centro", "Marcelo Deda", "Conj. João Alves"],
            "Laranjeiras": ["Centro", "Alto da Boa Vista", "Comendador Travassos"],
            "Tobias Barreto": ["Centro", "Boa Vista", "São José"],
            "Simão Dias": ["Centro", "Alto da Glória", "São José"],
            "Propriá": ["Centro", "Santa Cruz", "São João"]
        };

        const bairrosGenericos = ["Centro", "Zona Rural", "Bairro Novo", "Vila Operária", "São José", "Santo Antônio"];

        const selectBairro = document.getElementById('bairro');
        if (!selectBairro) {
            console.error('Elemento bairro não encontrado');
            return;
        }

        // Limpa opções existentes
        selectBairro.innerHTML = '<option value="">Selecione o bairro</option>';

        if (municipio) {
            let bairros = bairrosPorMunicipio[municipio] || bairrosGenericos;

            // Adiciona os bairros ao select
            bairros.forEach(bairro => {
                const option = document.createElement('option');
                option.value = bairro;
                option.textContent = bairro;
                selectBairro.appendChild(option);
            });
        }
    }

    formatarTelefone(input) {
        let value = input.value.replace(/\D/g, '');

        if (value.length <= 10) {
            value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else {
            value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        }

        input.value = value;
    }

    generateCoordinates(cidade, bairro) {
        const cityCoordinates = {
            'Aracaju': { lat: -10.9111, lng: -37.0717 },
            'São Cristóvão': { lat: -11.0144, lng: -37.2064 },
            'Lagarto': { lat: -10.9167, lng: -37.6500 },
            'Itabaiana': { lat: -10.6850, lng: -37.4250 },
            'Estância': { lat: -11.2619, lng: -37.4381 },
            'Nossa Senhora do Socorro': { lat: -10.8550, lng: -37.1250 },
            'Laranjeiras': { lat: -10.8069, lng: -37.1697 },
            'Tobias Barreto': { lat: -11.1833, lng: -37.9997 },
            'Simão Dias': { lat: -10.7386, lng: -37.8094 },
            'Propriá': { lat: -10.2111, lng: -36.8403 }
        };

        if (cityCoordinates[cidade]) {
            const base = cityCoordinates[cidade];
            return {
                lat: base.lat + (Math.random() * 0.03 - 0.015),
                lng: base.lng + (Math.random() * 0.03 - 0.015)
            };
        }

        return {
            lat: -10.9 + (Math.random() * 0.5 - 0.25),
            lng: -37.0 + (Math.random() * 0.5 - 0.25)
        };
    }

    handleFormSubmit(e) {
        e.preventDefault();
        console.log('Processando formulário...');

        const form = e.target;

        // Pega os valores diretamente dos elementos
        const nome = document.getElementById('nomeCompleto').value.trim();
        const telefone = document.getElementById('celular').value.trim();
        const cidade = document.getElementById('municipio').value;
        const bairro = document.getElementById('bairro').value;

        console.log('Valores do formulário:', {
            nome, telefone, cidade, bairro
        });

        // Validação detalhada
        if (!nome || nome === '') {
            alert('Por favor, preencha o nome completo');
            document.getElementById('nomeCompleto').focus();
            return;
        }

        if (!telefone || telefone === '' || telefone === '(79) ') {
            alert('Por favor, preencha o número de celular');
            document.getElementById('celular').focus();
            return;
        }

        if (!cidade || cidade === '') {
            alert('Por favor, selecione um município');
            document.getElementById('municipio').focus();
            return;
        }

        if (!bairro || bairro === '') {
            alert('Por favor, selecione um bairro');
            document.getElementById('bairro').focus();
            return;
        }

        // Pega os outros campos (não obrigatórios)
        const idade = document.getElementById('idade').value.trim();
        const sexo = document.getElementById('sexo').value;
        const email = document.getElementById('email').value.trim();
        const escolaridade = document.getElementById('escolaridade').value;
        const assessor = document.getElementById('assessor').value.trim();
        const assunto = document.getElementById('assunto').value;
        const observacao = document.getElementById('observacao').value.trim();

        // Gera coordenadas
        const coords = this.generateCoordinates(cidade, bairro);

        // Cria novo contato
        const novoContato = {
            id: this.nextId++,
            nome: nome,
            idade: idade,
            sexo: sexo,
            email: email,
            telefone: telefone,
            cidade: cidade,
            bairro: bairro,
            escolaridade: escolaridade,
            assessor: assessor,
            assunto: assunto,
            observacao: observacao,
            status: 'ativo',
            dataCadastro: new Date().toLocaleDateString('pt-BR'),
            lat: coords.lat,
            lng: coords.lng
        };

        console.log('Novo contato criado:', novoContato);

        // Adiciona aos dados
        this.contatos.unshift(novoContato);
        this.salvarContatos();

        // Atualiza a interface
        this.carregarTabelaContatos();
        this.atualizarEstatisticas();
        this.refreshMap();
        this.fecharNovoCadastro();

        alert('Contato cadastrado com sucesso!');
    }

    salvarContatos() {
        localStorage.setItem('contatos', JSON.stringify(this.contatos));
        console.log('Contatos salvos no localStorage');
    }

carregarTabelaContatos() {
    console.log('Carregando tabela de contatos...');
    const tbody = document.getElementById('contactsTableBody');
    if (!tbody) {
        console.error('Elemento contactsTableBody não encontrado');
        return;
    }

    tbody.innerHTML = '';

    this.contatos.forEach(contato => {
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
                    <button class="btn-icon btn-edit tooltip" onclick="contactsManager.editarContato(${contato.id})" data-tooltip="Editar">
                        <i data-lucide="edit-2"></i>
                    </button>
                    <button class="btn-icon btn-delete tooltip" onclick="contactsManager.excluirContato(${contato.id})" data-tooltip="Apagar">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Atualiza ícones do Lucide
    if (window.lucide) {
        lucide.createIcons();
    }

    console.log('Tabela de contatos carregada');
}

excluirContato(id) {
    console.log('Excluindo contato:', id);
    const contato = this.contatos.find(c => c.id === id);
    
    if (contato && confirm(`Tem certeza que deseja excluir o contato "${contato.nome}"?`)) {
        this.contatos = this.contatos.filter(c => c.id !== id);
        this.salvarContatos();
        this.carregarTabelaContatos();
        this.atualizarEstatisticas();
        this.refreshMap();
        alert('Contato excluído com sucesso!');
    }
}

    editarContato(id) {
        console.log('Editando contato:', id);
        const contato = this.contatos.find(c => c.id === id);
        if (!contato) return;

        // Preenche o formulário
        document.getElementById('nomeCompleto').value = contato.nome;
        document.getElementById('idade').value = contato.idade || '';
        document.getElementById('sexo').value = contato.sexo || '';
        document.getElementById('email').value = contato.email;
        document.getElementById('celular').value = contato.telefone;
        document.getElementById('municipio').value = contato.cidade;

        // Atualiza bairros
        this.atualizarBairros(contato.cidade);
        setTimeout(() => {
            document.getElementById('bairro').value = contato.bairro;
        }, 100);

        document.getElementById('escolaridade').value = contato.escolaridade || '';
        document.getElementById('assessor').value = contato.assessor || '';
        document.getElementById('assunto').value = contato.assunto || '';
        document.getElementById('observacao').value = contato.observacao || '';

        // Abre o formulário
        this.abrirNovoCadastro();

        // Remove event listener antigo e adiciona novo para edição
        const form = document.getElementById('formNovoCadastro');
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        newForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.salvarEdicaoContato(id);
        });

        newForm.querySelector('button[type="submit"]').textContent = 'Atualizar Cadastro';
    }

    salvarEdicaoContato(id) {
        console.log('Salvando edição do contato:', id);

        // Pega os valores diretamente dos elementos
        const nome = document.getElementById('nomeCompleto').value.trim();
        const telefone = document.getElementById('celular').value.trim();
        const cidade = document.getElementById('municipio').value;
        const bairro = document.getElementById('bairro').value;

        console.log('Valores do formulário (edição):', {
            nome, telefone, cidade, bairro
        });

        // Validação (mesma do cadastro)
        if (!nome || nome === '') {
            alert('Por favor, preencha o nome completo');
            document.getElementById('nomeCompleto').focus();
            return;
        }

        if (!telefone || telefone === '' || telefone === '(79) ') {
            alert('Por favor, preencha o número de celular');
            document.getElementById('celular').focus();
            return;
        }

        if (!cidade || cidade === '') {
            alert('Por favor, selecione um município');
            document.getElementById('municipio').focus();
            return;
        }

        if (!bairro || bairro === '') {
            alert('Por favor, selecione um bairro');
            document.getElementById('bairro').focus();
            return;
        }

        const contatoIndex = this.contatos.findIndex(c => c.id === id);
        if (contatoIndex !== -1) {
            this.contatos[contatoIndex] = {
                ...this.contatos[contatoIndex],
                nome: nome,
                idade: document.getElementById('idade').value.trim(),
                sexo: document.getElementById('sexo').value,
                email: document.getElementById('email').value.trim(),
                telefone: telefone,
                cidade: cidade,
                bairro: bairro,
                escolaridade: document.getElementById('escolaridade').value,
                assessor: document.getElementById('assessor').value.trim(),
                assunto: document.getElementById('assunto').value,
                observacao: document.getElementById('observacao').value.trim()
            };

            this.salvarContatos();
            this.carregarTabelaContatos();
            this.atualizarEstatisticas();
            this.refreshMap();
            this.fecharNovoCadastro();
            alert('Contato atualizado com sucesso!');
        }
    }

    atualizarEstatisticas() {
        console.log('Atualizando estatísticas...');
        const activeContacts = this.contatos.filter(c => c.status === 'ativo').length;
        const cidadesUnicas = [...new Set(this.contatos.map(c => c.cidade))].length;
        const hoje = new Date().toLocaleDateString('pt-BR');
        const novosHoje = this.contatos.filter(c => c.dataCadastro === hoje).length;

        // Atualiza os elementos se existirem
        const totalElem = document.getElementById('totalContacts');
        const activeElem = document.getElementById('activeContacts');
        const newElem = document.getElementById('newToday');
        const citiesElem = document.getElementById('totalCities');

        if (totalElem) totalElem.textContent = this.contatos.length;
        if (activeElem) activeElem.textContent = activeContacts;
        if (newElem) newElem.textContent = novosHoje;
        if (citiesElem) citiesElem.textContent = cidadesUnicas;
    }

    abrirNovoCadastro() {
        console.log('Abrindo formulário de cadastro');
        const section = document.getElementById('novoCadastroSection');
        if (section) {
            section.style.display = 'block';
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }

    fecharNovoCadastro() {
        console.log('Fechando formulário de cadastro');
        const section = document.getElementById('novoCadastroSection');
        const form = document.getElementById('formNovoCadastro');

        if (section) section.style.display = 'none';
        if (form) form.reset();
    }

    exportContacts() {
        console.log('Exportando contatos...');
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Nome,E-mail,Telefone,Cidade,Bairro,Status,Data Cadastro\n"
            + this.contatos.map(contato =>
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
}

// ================= CONFIG GLOBAL SIMPLIFICADA =================
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM carregado - Inicializando aplicação...');

    // Inicializa ícones do Lucide
    if (window.lucide) {
        lucide.createIcons();
        console.log('Ícones Lucide inicializados');
    }

    // Inicializa o gerenciador de contatos
    try {
        window.contactsManager = new ContactsManager();
        console.log('ContactsManager criado com sucesso');
    } catch (error) {
        console.error('Erro ao criar ContactsManager:', error);
    }

    // ================= CONFIGURAÇÕES BÁSICAS =================

    // Navegação do menu
    document.querySelectorAll('.menu-item').forEach(button => {
        button.addEventListener('click', function () {
            const page = this.getAttribute('data-page');
            console.log('Navegando para:', page);
            if (page && page !== 'cadastro') {
                window.location.href = `${page}.html`;
            }
        });
    });

    // Tema
    const themeToggle = document.getElementById('themeToggle');
    const themeLabel = document.getElementById('themeLabel');

    if (themeToggle && themeLabel) {
        const savedTheme = localStorage.getItem('theme') || 'light';

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

        applyTheme(savedTheme);

        themeToggle.addEventListener('click', function () {
            const isDark = document.documentElement.classList.contains('dark');
            applyTheme(isDark ? 'light' : 'dark');
        });
    }

    // Menu mobile
    const mobileBtn = document.getElementById("mobileMenuBtn");
    const sidebar = document.querySelector(".sidebar");

    if (mobileBtn && sidebar) {
        const overlay = document.createElement("div");
        overlay.classList.add("menu-overlay");
        document.body.appendChild(overlay);

        function toggleSidebar() {
            const isMobile = window.matchMedia("(max-width: 560px)").matches;

            if (isMobile) {
                const isOpen = sidebar.classList.toggle("open");
                mobileBtn.classList.toggle("active", isOpen);
                overlay.classList.toggle("show", isOpen);
                mobileBtn.setAttribute("aria-expanded", isOpen);
            } else {
                if (sidebar.style.display === "none" || getComputedStyle(sidebar).display === "none") {
                    sidebar.style.display = "flex";
                } else {
                    sidebar.style.display = "none";
                }
            }
        }

        mobileBtn.addEventListener("click", toggleSidebar);
        overlay.addEventListener("click", function () {
            sidebar.classList.remove("open");
            mobileBtn.classList.remove("active");
            overlay.classList.remove("show");
            mobileBtn.setAttribute("aria-expanded", "false");
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            localStorage.removeItem('token');
            localStorage.removeItem('name');
            window.location.href = 'index.html';
        });
    }

    // Perfil
    const profileName = document.getElementById('profileName');
    const tokenShort = document.getElementById('tokenShort');
    const storedName = localStorage.getItem('name');
    const storedToken = localStorage.getItem('token');

    if (storedName && profileName) profileName.textContent = storedName;
    if (storedToken && tokenShort) tokenShort.textContent = storedToken.slice(0, 12) + '…';

    // Funções globais para os botões
    window.abrirNovoCadastro = function () {
        if (window.contactsManager) {
            window.contactsManager.abrirNovoCadastro();
        }
    };

    window.fecharNovoCadastro = function () {
        if (window.contactsManager) {
            window.contactsManager.fecharNovoCadastro();
        }
    };

    window.exportContacts = function () {
        if (window.contactsManager) {
            window.contactsManager.exportContacts();
        }
    };

    console.log('Aplicação inicializada com sucesso!');
});

// Verifica se há erros de carregamento
window.addEventListener('error', function (e) {
    console.error('Erro global:', e.error);
});