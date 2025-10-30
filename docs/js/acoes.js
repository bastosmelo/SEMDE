// Sistema de gerenciamento de ações
class ActionsManager {
    constructor() {
        // Configuração da API
        this.API_BASE = "http://127.0.0.1:8000";
        this.token = localStorage.getItem("token");
        
        // Botões de exportação (com IDs específicos)
        document.getElementById('exportPDF').addEventListener('click', () => this.exportToPDF());
        document.getElementById('exportExcel').addEventListener('click', () => this.exportToExcel());
        
        this.actions = [];
        this.map = null;
        this.currentMarkers = [];
        this.heatLayer = null;
        this.currentView = 'calor';
        this.nextId = 1;

        // Sistema de posições personalizadas
        this.customPositions = this.loadCustomPositions();

        // Dados de cidades e bairros
        this.cidadesBairros = {
            'Aracaju': [
                'Centro', '13 de Julho', 'Atalaia', 'Coroa do Meio', 'São José',
                'Grageru', 'Jardins', 'Inácio Barbosa', 'Luzia', 'Salgado Filho',
                'Siqueira Campos', 'Getúlio Vargas', 'Suíssa', 'Jardim Centenário',
                'Santa Maria', 'Soledade', 'Porto Dantas', 'Industrial'
            ],
            'São Paulo': [
                'Centro', 'Moema', 'Pinheiros', 'Vila Madalena', 'Itaim Bibi',
                'Jardins', 'Morumbi', 'Brooklin', 'Campo Belo', 'Consolação',
                'Bela Vista', 'Liberdade', 'Paraíso', 'Vila Mariana', 'Tatuapé',
                'Mooca', 'Ipiranga', 'Santo Amaro', 'Butantã', 'Perdizes'
            ],
            'Rio de Janeiro': [
                'Copacabana', 'Ipanema', 'Leblon', 'Barra da Tijuca', 'Botafogo',
                'Flamengo', 'Laranjeiras', 'Tijuca', 'Maracanã', 'Centro',
                'Santa Teresa', 'Lagoa', 'Urca', 'Recreio', 'Jardim Botânico',
                'Gávea', 'Catete', 'Cosme Velho', 'Humaitá', 'Jacarepaguá'
            ],
            'Salvador': [
                'Barra', 'Ondina', 'Rio Vermelho', 'Pituba', 'Itaigara',
                'Brotas', 'Graça', 'Vitória', 'Campo Grande', 'Comércio',
                'Pelourinho', 'Stella Maris', 'Piatã', 'Amaralina', 'Pernambués',
                'Cajazeiras', 'Liberdade', 'Cabula', 'Pau da Lima', 'São Caetano'
            ],
            'Belo Horizonte': [
                'Centro', 'Savassi', 'Lourdes', 'Funcionários', 'Sion',
                'Belo Horizonte', 'Cidade Jardim', 'Mangabeiras', 'Santa Efigênia',
                'Lagoinha', 'Santa Tereza', 'Floresta', 'Barro Preto', 'Nova Suíça',
                'Anchieta', 'Carmo', 'Coração Eucarístico', 'Gutierrez', 'Pampulha'
            ],
            'Fortaleza': [
                'Centro', 'Meireles', 'Aldeota', 'Praia de Iracema', 'Varjota',
                'Mucuripe', 'Cocó', 'Papicu', 'Dionísio Torres', 'Joaquim Távora',
                'Benfica', 'Fátima', 'Montese', 'Parquelândia', 'Vila Velha',
                'São Gerardo', 'Jardim América', 'Álvaro Weyne', 'Damas'
            ],
            'Brasília': [
                'Asa Sul', 'Asa Norte', 'Sudoeste', 'Noroeste', 'Lago Sul',
                'Lago Norte', 'Guará', 'Taguatinga', 'Cruzeiro', 'SIA',
                'Vila Planalto', 'Octogonal', 'Park Way', 'Jardim Botânico',
                'Candangolândia', 'Riacho Fundo', 'Águas Claras', 'Samambaia'
            ],
            'Recife': [
                'Boa Viagem', 'Boa Vista', 'Casa Forte', 'Espinheiro', 'Graças',
                'Ilha do Leite', 'Parnamirim', 'Pina', 'Poço da Panela', 'Santana',
                'Santo Amaro', 'Setúbal', 'Soledade', 'Torre', 'Várzea',
                'Zumbi do Pacheco', 'Cordeiro', 'Madalena', 'Torrões'
            ],
            'Porto Alegre': [
                'Centro Histórico', 'Moinhos de Vento', 'Bela Vista', 'Petrópolis',
                'Bom Fim', 'Cidade Baixa', 'Floresta', 'Independência', 'Jardim Botânico',
                'Partenon', 'Santana', 'Santa Cecília', 'Santa Maria Goretti', 'Tristeza',
                'Vila Assunção', 'Vila Conceição', 'Vila Ipiranga', 'Vila João Pessoa'
            ],
            'Curitiba': [
                'Centro', 'Batel', 'Bigorrilho', 'Cabral', 'Cristo Rei',
                'Água Verde', 'Jardim Social', 'Mercês', 'Portão', 'Santa Felicidade',
                'Vila Izabel', 'Bom Retiro', 'Cajuru', 'Campo Comprido', 'Fanny',
                'Novo Mundo', 'Orleans', 'Parolin', 'Prado Velho', 'Rebouças'
            ],
            'Manaus': [
                'Centro', 'Adrianópolis', 'Chapada', 'Crespo', 'Educandos',
                'Flores', 'Nossa Sra. das Graças', 'Parque 10 de Novembro', 'São Geraldo',
                'Aleixo', 'Coroado', 'Dom Pedro', 'Japiim', 'Morro da Liberdade',
                'Nova Esperança', 'Ponta Negra', 'Raiz', 'Santo Antônio', 'Tarumã'
            ],
            'Belém': [
                'Centro', 'Batista Campos', 'Campina', 'Cidade Velha', 'Cremação',
                'Marco', 'Nazaré', 'Reduto', 'São Brás', 'Umarizal',
                'Condor', 'Guamá', 'Jurunas', 'Pedreira', 'Sacramenta',
                'Souza', 'Telégrafo', 'Una', 'Val-de-Cães'
            ],
            'Goiânia': [
                'Centro', 'Setor Bueno', 'Setor Marista', 'Setor Oeste', 'Jardim Goiás',
                'Campinas', 'Setor Aeroporto', 'Setor Coimbra', 'Setor Faiçalville',
                'Setor Garavelo', 'Setor Jaó', 'Setor Jardim América', 'Setor Jundiaí',
                'Setor Lisboa', 'Setor Pedro Ludovico', 'Setor Sul', 'Setor Urias Magalhães'
            ],
            'Campinas': [
                'Centro', 'Cambuí', 'Taquaral', 'Bonfim', 'Guanabara',
                'Jardim Chapadão', 'Jardim Guanabara', 'Jardim São Paulo', 'Nova Campinas',
                'Parque Industrial', 'Ponte Preta', 'Proença', 'Swift', 'Vila Andrade Neves',
                'Vila Costa e Silva', 'Vila Lemos', 'Vila Marieta', 'Vila Teixeira'
            ],
            'São Luís': [
                'Centro', 'Areinha', 'Bequimão', 'Camboa', 'Centro Histórico',
                'Coréia', 'Fabril', 'Jardim Renascença', 'Jardim São Cristóvão',
                'Monte Castelo', 'Parque Amazonas', 'Parque Pindorama', 'Parque Sabiá',
                'Pedrinhas', 'Ponta D Areia', 'Ponta do Farol', 'Vila Bacanga'
            ],
            'Maceió': [
                'Centro', 'Jatiúca', 'Ponta Verde', 'Mangabeiras', 'Pajuçara',
                'Cruz das Almas', 'Gruta de Lourdes', 'Farol', 'Levada', 'Pinheiro',
                'Poço', 'Benedito Bentes', 'Garça Torta', 'Guaxuma', 'Ipioca',
                'Jacarecica', 'Jardim Petrópolis', 'Petrópolis'
            ],
            'Natal': [
                'Centro', 'Ponta Negra', 'Lagoa Nova', 'Capim Macio', 'Candelária',
                'Cidade Alta', 'Dix-Sept Rosado', 'Lagoa Seca', 'Mãe Luiza',
                'Neópolis', 'Nova Descoberta', 'Petrópolis', 'Rocas', 'Tirol',
                'Alecrim', 'Areia Preta', 'Barro Vermelho', 'Quintas'
            ],
            'João Pessoa': [
                'Centro', 'Bessa', 'Cabedelo', 'Manaíra', 'Tambau',
                'Altiplano', 'Bancários', 'Cabo Branco', 'Cristo Redentor',
                'Expedicionários', 'Jardim Cidade Universitária', 'Jardim São Paulo',
                'José Américo', 'Padre Zé', 'Planalto da Boa Esperança', 'Tambaú',
                'Treze de Maio', 'Varadouro'
            ],
            'Florianópolis': [
                'Centro', 'Agronômica', 'Carianos', 'Carianos', 'Córrego Grande',
                'Coqueiros', 'Estreito', 'Itacorubi', 'Jardim Atlântico',
                'Lagoa da Conceição', 'Pantanal', 'Rio Tavares', 'Saco Grande',
                'Saco dos Limões', 'Santa Mônica', 'Trindade', 'Vargem Grande'
            ],
            'Vitória': [
                'Centro', 'Jardim Camburi', 'Jardim da Penha', 'Maria Ortiz',
                'Mata da Praia', 'Praia do Canto', 'República', 'Santa Lúcia',
                'Santos Dumont', 'São Pedro', 'Vila Velha', 'Bento Ferreira',
                'Consolação', 'Enseada do Suá', 'Forte São João', 'Ilha do Frade',
                'Ilha do Príncipe', 'Jucutuquara'
            ]
        };
        
        this.init();
    }

    // ==================== MÉTODOS DA API ====================

    async makeApiCall(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.API_BASE}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Buscar ações do banco
    async loadActions() {
        try {
            const data = await this.makeApiCall('/acoes');
            this.actions = data.map(action => ({
                id: action.id,
                cidade: action.cidade,
                bairro: action.bairro,
                tipo: action.tipo,
                data: this.formatDate(action.data),
                lat: action.lat || this.generateCoordinates(action.cidade, action.bairro).lat,
                lng: action.lng || this.generateCoordinates(action.cidade, action.bairro).lng,
                descricao: action.descricao,
                responsavel: action.responsavel,
                contato: action.contato
            }));
            
            this.nextId = this.actions.length > 0 ? Math.max(...this.actions.map(a => a.id)) + 1 : 1;
            return this.actions;
        } catch (error) {
            console.warn('Erro ao carregar ações, usando dados demo:', error);
            // Fallback para dados demo
            this.actions = this.loadInitialData();
            return this.actions;
        }
    }

    // Salvar nova ação no banco
async saveAction(actionData) {
    try {
        console.log('📤 Enviando dados para API:', actionData);
        
        const response = await fetch(`${this.API_BASE}/acoes`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                titulo: actionData.tipo,
                descricao: actionData.descricao,
                tipo: actionData.tipo,
                data: this.parseDateToAPI(actionData.data),
                cidade: actionData.cidade,
                bairro: actionData.bairro,
                responsavel: actionData.responsavel,
                contato: actionData.contato
            })
        });

        console.log('📥 Resposta da API - Status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro HTTP:', response.status, errorText);
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ Ação salva com sucesso:', result);
        return result;

    } catch (error) {
        console.error('💥 Erro completo ao salvar ação:', error);
        throw error;
    }
}

    // Atualizar ação existente
    async updateActionAPI(actionId, actionData) {
        try {
            const response = await this.makeApiCall(`/acoes/${actionId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    titulo: actionData.tipo,
                    descricao: actionData.descricao,
                    tipo: actionData.tipo,
                    data: this.parseDateToAPI(actionData.data),
                    cidade: actionData.cidade,
                    bairro: actionData.bairro,
                    responsavel: actionData.responsavel,
                    contato: actionData.contato
                })
            });

            return response;
        } catch (error) {
            console.error('Erro ao atualizar ação:', error);
            throw error;
        }
    }

    // Excluir ação
    async deleteActionFromAPI(actionId) {
        try {
            const response = await this.makeApiCall(`/acoes/${actionId}`, {
                method: 'DELETE'
            });

            return response;
        } catch (error) {
            console.error('Erro ao excluir ação:', error);
            throw error;
        }
    }

    // Buscar estatísticas
    async loadStatistics() {
        try {
            const data = await this.makeApiCall('/estatisticas');
            return data;
        } catch (error) {
            console.warn('Erro ao carregar estatísticas:', error);
            return this.calculateLocalStatistics();
        }
    }

    // ==================== MÉTODOS AUXILIARES ====================

    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yy = date.getFullYear();
        return `${dd}/${mm}/${yy}`;
    }

    parseDateToAPI(dateString) {
        if (!dateString || dateString === '-') return null;
        
        if (dateString.includes('/')) {
            const parts = dateString.split('/');
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        
        return dateString;
    }

    calculateLocalStatistics() {
        const totalActions = this.actions.length;
        const cities = new Set(this.actions.map(action => action.cidade));
        const neighborhoods = new Set(this.actions.map(action => action.bairro));
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return {
            total_actions: totalActions,
            active_cities: cities.size,
            covered_neighborhoods: neighborhoods.size,
            monthly_actions: this.actions.filter(action => {
                const actionDate = new Date(this.parseDateToAPI(action.data));
                return actionDate.getMonth() === currentMonth && 
                       actionDate.getFullYear() === currentYear;
            }).length
        };
    }

    loadInitialData() {
        return [
            { id: 1, cidade: 'Lagarto', bairro: 'Centro', tipo: 'Reunião com lideranças', data: '22/07/2025', lat: -10.9263, lng: -37.0785 },
            { id: 2, cidade: 'Aracaju', bairro: 'Grageru', tipo: 'Evento', data: '22/07/2025', lat: -10.9189, lng: -37.0627 },
            { id: 3, cidade: 'Estância', bairro: 'Centro', tipo: 'Panfletagem', data: '20/07/2025', lat: -11.2619, lng: -37.4381 },
            { id: 4, cidade: 'Itabaiana', bairro: 'São Cristóvão', tipo: 'Visita Técnica', data: '18/07/2025', lat: -10.6850, lng: -37.4250 },
            { id: 5, cidade: 'Aracaju', bairro: '13 de Julho', tipo: 'Caminhada', data: '15/07/2025', lat: -10.9111, lng: -37.0522 },
            { id: 6, cidade: 'Lagarto', bairro: 'Jardins', tipo: 'Reunião com lideranças', data: '12/07/2025', lat: -10.9300, lng: -37.0850 },
            { id: 7, cidade: 'Aracaju', bairro: 'Luzia', tipo: 'Evento', data: '10/07/2025', lat: -10.9350, lng: -37.0750 },
            { id: 8, cidade: 'Estância', bairro: 'São José', tipo: 'Panfletagem', data: '08/07/2025', lat: -11.2550, lng: -37.4450 }
        ];
    }

    // ==================== MÉTODOS PRINCIPAIS ATUALIZADOS ====================

    async init() {
        await this.loadActions();
        this.initMap();
        this.initCityFilter();
        this.initEventListeners();
        this.renderTable();
        await this.updateCounters();
        this.refreshMap();
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;

        const cidade = form.cidade.value || '-';
        const bairro = form.bairro.value || '-';
        const tipo = form.tipoAcao.value || '-';
        const data = form.dataAcao.value;
        const descricao = form.descricao.value || '';
        const responsavel = form.responsavel.value || '';
        const contato = form.contato.value || '';

        // Validação
        if (!cidade || cidade === '' || cidade === 'Selecione uma cidade') {
            alert('Por favor, selecione uma cidade');
            return;
        }

        if (!bairro || bairro === '' || bairro.includes('Selecione')) {
            alert('Por favor, selecione um bairro');
            return;
        }

        // Gera coordenadas
        const coords = this.generateCoordinates(cidade, bairro);

        // Formata data
        let dataFmt = '';
        if (data) {
            const d = new Date(data);
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const yy = d.getFullYear();
            dataFmt = `${dd}/${mm}/${yy}`;
        } else {
            dataFmt = '-';
        }

        // Cria nova ação
        const newAction = {
            id: this.nextId++, // ID temporário
            cidade: cidade,
            bairro: bairro,
            tipo: tipo,
            data: dataFmt,
            lat: coords.lat,
            lng: coords.lng,
            descricao: descricao,
            responsavel: responsavel,
            contato: contato
        };

        try {
            // Salva no backend
            const savedAction = await this.saveAction(newAction);
            
            // Atualiza com ID real do banco
            newAction.id = savedAction.id;
            
            // Adiciona localmente
            this.actions.unshift(newAction);

            // Atualiza a interface
            this.renderTable();
            await this.updateCounters();
            this.refreshMap();
            this.closeModal();

            this.showNotification('Ação salva com sucesso!', 'success');
            
        } catch (error) {
            this.showNotification('Erro ao salvar ação. Tente novamente.', 'error');
        }
    }

    async updateAction(id, form) {
        const cidade = form.cidade.value || '-';
        const bairro = form.bairro.value || '-';
        const tipo = form.tipoAcao.value || '-';
        const data = form.dataAcao.value;
        const descricao = form.descricao.value || '';
        const responsavel = form.responsavel.value || '';
        const contato = form.contato.value || '';

        // Validação
        if (!cidade || !bairro) {
            alert('Por favor, preencha cidade e bairro');
            return;
        }

        // Formata data
        let dataFmt = '';
        if (data) {
            const d = new Date(data);
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const yy = d.getFullYear();
            dataFmt = `${dd}/${mm}/${yy}`;
        } else {
            dataFmt = '-';
        }

        try {
            // Atualiza no backend
            await this.updateActionAPI(id, {
                cidade: cidade,
                bairro: bairro,
                tipo: tipo,
                data: dataFmt,
                descricao: descricao,
                responsavel: responsavel,
                contato: contato
            });

            // Atualiza localmente
            const actionIndex = this.actions.findIndex(a => a.id === id);
            if (actionIndex !== -1) {
                this.actions[actionIndex] = {
                    ...this.actions[actionIndex],
                    cidade: cidade,
                    bairro: bairro,
                    tipo: tipo,
                    data: dataFmt,
                    descricao: descricao,
                    responsavel: responsavel,
                    contato: contato
                };

                // Atualiza a interface
                this.renderTable();
                this.refreshMap();
                this.closeModal();
                
                this.showNotification('Ação atualizada com sucesso!', 'success');
            }
        } catch (error) {
            this.showNotification('Erro ao atualizar ação. Tente novamente.', 'error');
        }
    }

    async deleteAction(id) {
        if (confirm('Excluir esta ação?')) {
            try {
                await this.deleteActionFromAPI(id);
                
                // Remove localmente
                this.actions = this.actions.filter(action => action.id !== id);
                this.renderTable();
                await this.updateCounters();
                this.refreshMap();
                
                this.showNotification('Ação excluída com sucesso!', 'success');
            } catch (error) {
                this.showNotification('Erro ao excluir ação. Tente novamente.', 'error');
            }
        }
    }

    async updateCounters() {
        try {
            const stats = await this.loadStatistics();
            
            document.getElementById('totalActions').textContent = stats.total_actions;
            document.getElementById('activeCities').textContent = stats.active_cities;
            document.getElementById('coveredNeighborhoods').textContent = stats.covered_neighborhoods;
            document.getElementById('monthActions').textContent = stats.monthly_actions;
        } catch (error) {
            // Fallback para cálculo local
            const stats = this.calculateLocalStatistics();
            document.getElementById('totalActions').textContent = stats.total_actions;
            document.getElementById('activeCities').textContent = stats.active_cities;
            document.getElementById('coveredNeighborhoods').textContent = stats.covered_neighborhoods;
            document.getElementById('monthActions').textContent = stats.monthly_actions;
        }
    }

    // ==================== MÉTODOS ORIGINAIS (MANTIDOS COMPLETOS) ====================

    // Sistema de posições personalizadas
    loadCustomPositions() {
        const saved = localStorage.getItem('customPositions');
        return saved ? JSON.parse(saved) : {};
    }

    saveCustomPositions() {
        localStorage.setItem('customPositions', JSON.stringify(this.customPositions));
    }

    getPositionKey(cidade, bairro) {
        return `${cidade}_${bairro}`.toLowerCase().replace(/\s+/g, '_');
    }

    getCustomPosition(cidade, bairro) {
        const key = this.getPositionKey(cidade, bairro);
        return this.customPositions[key];
    }

    setCustomPosition(cidade, bairro, lat, lng) {
        const key = this.getPositionKey(cidade, bairro);
        this.customPositions[key] = { lat, lng };
        this.saveCustomPositions();
    }

    // Sistema de filtro cidade/bairro
    initCityFilter() {
        const cidadeSelect = document.getElementById('cidade');
        const bairroSelect = document.getElementById('bairro');

        // Adiciona placeholder para cidade
        const cidadePlaceholder = document.createElement('option');
        cidadePlaceholder.value = '';
        cidadePlaceholder.textContent = 'Selecione uma cidade';
        cidadePlaceholder.disabled = true;
        cidadePlaceholder.selected = true;
        cidadeSelect.appendChild(cidadePlaceholder);

        // Preenche o select de cidades (ordenadas)
        Object.keys(this.cidadesBairros).sort().forEach(cidade => {
            const option = document.createElement('option');
            option.value = cidade;
            option.textContent = cidade;
            cidadeSelect.appendChild(option);
        });

        // Event listener para quando a cidade mudar
        cidadeSelect.addEventListener('change', (e) => {
            this.updateBairrosByCidade(e.target.value);
        });

        // Inicializa com mensagem de seleção
        this.showSelectCityMessage();
    }

    updateBairrosByCidade(cidade) {
        const bairroSelect = document.getElementById('bairro');

        // Reseta o bairro
        bairroSelect.innerHTML = '';

        if (!cidade) {
            this.showSelectCityMessage();
            return;
        }

        const bairros = this.cidadesBairros[cidade] || [];

        // Adiciona placeholder para bairro
        const bairroPlaceholder = document.createElement('option');
        bairroPlaceholder.value = '';
        bairroPlaceholder.textContent = 'Selecione um bairro';
        bairroPlaceholder.disabled = true;
        bairroPlaceholder.selected = true;
        bairroSelect.appendChild(bairroPlaceholder);

        // Adiciona os bairros da cidade selecionada (ordenados)
        bairros.sort().forEach(bairro => {
            const option = document.createElement('option');
            option.value = bairro;
            option.textContent = bairro;
            bairroSelect.appendChild(option);
        });

        // Habilita o select de bairro
        bairroSelect.disabled = false;

        // Se não há bairros, mostra mensagem
        if (bairros.length === 0) {
            this.showNoNeighborhoodsMessage();
        }
    }

    showSelectCityMessage() {
        const bairroSelect = document.getElementById('bairro');
        bairroSelect.innerHTML = '<option value="" disabled selected>← Selecione uma cidade primeiro</option>';
        bairroSelect.disabled = true;
    }

    showNoNeighborhoodsMessage() {
        const bairroSelect = document.getElementById('bairro');
        bairroSelect.innerHTML = '<option value="" disabled selected>🚫 Nenhum bairro cadastrado</option>';
        bairroSelect.disabled = true;
    }

    initMap() {
        // Centro do mapa em Sergipe
        this.map = L.map('map').setView([-10.9111, -37.0717], 10);

        // Adiciona tile layer (mapa base)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        // Inicializa com mapa de calor
        document.getElementById('btnCalor').classList.add('active');
    }

    initEventListeners() {
        // Botões do mapa
        document.getElementById('btnPontos').addEventListener('click', () => this.setView('pontos'));
        document.getElementById('btnBairros').addEventListener('click', () => this.setView('bairros'));
        document.getElementById('btnCalor').addEventListener('click', () => this.setView('calor'));

        // Modal
        const modal = document.getElementById('modalNovaAcao');
        const openNova = document.getElementById('openNovaAcao');
        const closeModal = document.getElementById('closeModal');
        const btnCancelar = document.getElementById('btnCancelar');
        const formNova = document.getElementById('formNovaAcao');

        openNova.addEventListener('click', () => this.openModal());
        closeModal.addEventListener('click', () => this.closeModal());
        btnCancelar.addEventListener('click', () => this.closeModal());

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        formNova.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Delegação de eventos para a tabela
        document.getElementById('acoesTbody').addEventListener('click', (e) => this.handleTableClick(e));

        // Tecla ESC fecha modal
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) this.closeModal();
        });
    }

    setView(view) {
        if (this.currentView !== view) {
            this.currentView = view;
            this.updateButtonStates(view);
            this.refreshMap();
        }
    }

    updateButtonStates(activeView) {
        const buttons = {
            'pontos': document.getElementById('btnPontos'),
            'bairros': document.getElementById('btnBairros'),
            'calor': document.getElementById('btnCalor')
        };

        Object.values(buttons).forEach(btn => {
            btn.classList.remove('active', 'btn-danger');
            btn.classList.add('btn-outline');
        });

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
        this.currentMarkers.forEach(marker => this.map.removeLayer(marker));
        this.currentMarkers = [];

        // Remove heat layer
        if (this.heatLayer) {
            this.map.removeLayer(this.heatLayer);
            this.heatLayer = null;
        }
    }

    showIndividualPoints() {
        this.clearMap();

        this.actions.forEach(action => {
            const marker = L.marker([action.lat, action.lng])
                .bindPopup(this.createPopupContent(action))
                .addTo(this.map);

            // Adiciona contexto de ação para o marcador
            marker.actionData = action;

            // Adiciona evento de clique direito
            marker.on('contextmenu', (e) => {
                this.showMarkerContextMenu(e, marker);
            });

            this.currentMarkers.push(marker);
        });

        this.fitMapToBounds();
        this.showLegend('Pontos de Ação', 'var(--primary-1)');
    }

    // Menu de contexto para mover pontos - aparece abaixo do ponto
    showMarkerContextMenu(e, marker) {
        // Remove menu anterior se existir
        this.removeContextMenu();

        // Cria o menu de contexto
        const contextMenu = L.DomUtil.create('div', 'leaflet-contextmenu');
        contextMenu.style.cssText = `
        position: absolute;
        background: white;
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 8px 0;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        min-width: 160px;
        font-family: 'Baloo 2', sans-serif;
        font-size: 14px;
    `;

        // Item "Mover ponto"
        const moveItem = L.DomUtil.create('div', 'contextmenu-item', contextMenu);
        moveItem.style.cssText = `
        padding: 8px 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background 0.2s;
    `;
        moveItem.innerHTML = `
        <i data-lucide="move" style="width: 16px; height: 16px;"></i>
        Mover ponto
    `;

        moveItem.addEventListener('click', () => {
            this.startMovingMarker(marker);
            this.removeContextMenu();
        });

        moveItem.addEventListener('mouseenter', () => {
            moveItem.style.background = 'var(--menu-hover-bg)';
        });

        moveItem.addEventListener('mouseleave', () => {
            moveItem.style.background = 'transparent';
        });

        // Posiciona o menu diretamente abaixo do ponto do marcador
        const markerPoint = this.map.latLngToContainerPoint(marker.getLatLng());
        const mapContainer = this.map.getContainer();

        // Calcula a posição relativa ao container do mapa
        contextMenu.style.left = (markerPoint.x - 80) + 'px'; // Centraliza horizontalmente
        contextMenu.style.top = (markerPoint.y + 15) + 'px'; // Coloca 15px abaixo do ponto

        // Adiciona ao container do mapa (não ao body)
        mapContainer.appendChild(contextMenu);

        // Guarda referência para remover depois
        this.currentContextMenu = contextMenu;

        // Fecha o menu ao clicar fora
        setTimeout(() => {
            const closeHandler = (clickE) => {
                if (!contextMenu.contains(clickE.target)) {
                    this.removeContextMenu();
                    document.removeEventListener('click', closeHandler);
                }
            };
            document.addEventListener('click', closeHandler);
        }, 100);

        // Atualiza ícones
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    removeContextMenu() {
        if (this.currentContextMenu && this.currentContextMenu.parentNode) {
            this.currentContextMenu.parentNode.removeChild(this.currentContextMenu);
            this.currentContextMenu = null;
        }
    }

    // Inicia o processo de mover marcador
    startMovingMarker(marker) {
        // Remove o marcador original temporariamente
        this.map.removeLayer(marker);

        // Cria um marcador temporário para arrastar
        const tempMarker = L.marker(marker.getLatLng(), {
            draggable: true,
            autoPan: true
        }).addTo(this.map);

        // Interface de instruções
        const instructions = L.control({ position: 'topright' });
        instructions.onAdd = () => {
            const div = L.DomUtil.create('div', 'moving-instructions');
            div.style.cssText = `
                background: white;
                padding: 12px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                border: 2px solid var(--primary-1);
                font-family: 'Baloo 2', sans-serif;
                font-size: 14px;
                max-width: 200px;
            `;
            div.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 8px; color: var(--primary-1);">
                    🎯 Movendo ponto
                </div>
                <div style="margin-bottom: 8px; font-size: 12px;">
                    Arraste o ponto para a nova posição
                </div>
                <div style="display: flex; gap: 8px;">
                    <button id="confirmMove" style="
                        background: var(--primary-1);
                        color: white;
                        border: none;
                        padding: 6px 12px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 12px;
                        flex: 1;
                    ">Confirmar</button>
                    <button id="cancelMove" style="
                        background: #6b7280;
                        color: white;
                        border: none;
                        padding: 6px 12px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 12px;
                        flex: 1;
                    ">Cancelar</button>
                </div>
            `;
            return div;
        };

        instructions.addTo(this.map);

        // Event listeners para os botões
        const confirmHandler = () => {
            const newLatLng = tempMarker.getLatLng();
            this.finishMovingMarker(marker, tempMarker, newLatLng, instructions);
        };

        const cancelHandler = () => {
            this.cancelMovingMarker(marker, tempMarker, instructions);
        };

        setTimeout(() => {
            document.getElementById('confirmMove').addEventListener('click', confirmHandler);
            document.getElementById('cancelMove').addEventListener('click', cancelHandler);
        }, 100);

        // Também permite confirmar com duplo clique
        tempMarker.on('dblclick', confirmHandler);
    }

    finishMovingMarker(originalMarker, tempMarker, newLatLng, instructionsControl) {
        const action = originalMarker.actionData;

        // Salva a posição personalizada para esta cidade/bairro
        this.setCustomPosition(action.cidade, action.bairro, newLatLng.lat, newLatLng.lng);

        // Atualiza a ação com as novas coordenadas
        action.lat = newLatLng.lat;
        action.lng = newLatLng.lng;

        // Remove controles temporários
        this.map.removeControl(instructionsControl);
        this.map.removeLayer(tempMarker);

        // Recria o marcador na nova posição
        const newMarker = L.marker([action.lat, action.lng])
            .bindPopup(this.createPopupContent(action))
            .addTo(this.map);

        newMarker.actionData = action;
        newMarker.on('contextmenu', (e) => {
            this.showMarkerContextMenu(e, newMarker);
        });

        // Substitui no array de marcadores
        const markerIndex = this.currentMarkers.findIndex(m => m === originalMarker);
        if (markerIndex !== -1) {
            this.currentMarkers[markerIndex] = newMarker;
        }

        // Mostra mensagem de confirmação
        this.showNotification(`Posição de ${action.bairro} atualizada!`, 'success');

        console.log(`Ponto movido para: ${newLatLng.lat}, ${newLatLng.lng}`);
    }

    cancelMovingMarker(originalMarker, tempMarker, instructionsControl) {
        // Remove controles temporários
        this.map.removeControl(instructionsControl);
        this.map.removeLayer(tempMarker);

        // Restaura o marcador original
        const action = originalMarker.actionData;
        const restoredMarker = L.marker([action.lat, action.lng])
            .bindPopup(this.createPopupContent(action))
            .addTo(this.map);

        restoredMarker.actionData = action;
        restoredMarker.on('contextmenu', (e) => {
            this.showMarkerContextMenu(e, restoredMarker);
        });

        // Substitui no array de marcadores
        const markerIndex = this.currentMarkers.findIndex(m => m === originalMarker);
        if (markerIndex !== -1) {
            this.currentMarkers[markerIndex] = restoredMarker;
        }
    }

    showNotification(message, type = 'info') {
        // Cria notificação temporária
        const notification = L.DomUtil.create('div', 'leaflet-notification');
        const bgColor = type === 'success' ? 'var(--primary-1)' : 'var(--muted-2)';

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: 'Baloo 2', sans-serif;
            font-size: 14px;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <i data-lucide="${type === 'success' ? 'check-circle' : 'info'}"></i>
                ${message}
            </div>
        `;

        document.body.appendChild(notification);

        // Atualiza ícones
        if (window.lucide) {
            lucide.createIcons();
        }

        // Remove após 3 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
    }

    showNeighborhoodCounters() {
        this.clearMap();

        // Agrupa ações por bairro
        const neighborhoodCounts = {};
        this.actions.forEach(action => {
            if (!neighborhoodCounts[action.bairro]) {
                neighborhoodCounts[action.bairro] = 0;
            }
            neighborhoodCounts[action.bairro]++;
        });

        // Adiciona marcadores de contagem por bairro
        Object.keys(neighborhoodCounts).forEach(bairro => {
            const count = neighborhoodCounts[bairro];
            const action = this.actions.find(a => a.bairro === bairro);

            if (action) {
                const marker = L.marker([action.lat, action.lng], {
                    icon: L.divIcon({
                        className: 'neighborhood-cluster',
                        html: `<div>${count}</div>`,
                        iconSize: [30, 30]
                    })
                })
                    .bindPopup(`
                    <div>
                        <strong>${bairro}</strong><br>
                        <small>Total de ações: ${count}</small>
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
        this.clearMap();

        // Configuração SUPER visível
        this.heatLayer = L.heatLayer(this.actions.map(action => [action.lat, action.lng, 1]), {
            radius: 50,    // Bem grande
            blur: 30,      // Bem suave
            maxZoom: 15,
            minOpacity: 0.6, // Muito visível
            gradient: {
                0.0: 'blue',
                0.2: 'cyan',
                0.4: 'lime',
                0.6: 'yellow',
                0.8: 'orange',
                1.0: 'red'
            }
        }).addTo(this.map);

        // Zoom mais aberto para ver o heatmap
        if (this.actions.length > 0) {
            const points = this.actions.map(action => [action.lat, action.lng]);
            const group = new L.featureGroup(points.map(point => L.marker(point)));
            this.map.fitBounds(group.getBounds().pad(0.5));

            // Zoom máximo para heatmap
            if (this.map.getZoom() > 12) {
                this.map.setZoom(12);
            }
        }

        this.showHeatLegend();
    }

    fitMapToBounds() {
        if (this.currentMarkers.length > 0) {
            const group = new L.featureGroup(this.currentMarkers);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    showLegend(title, color) {
        const legend = document.getElementById('mapLegend');
        const legendContent = document.getElementById('legendContent');
        legendContent.innerHTML = `
            <div class="legend-item">
                <div class="legend-color" style="background: ${color}"></div>
                <span>${title}</span>
            </div>
            <div style="font-size: 10px; color: var(--muted-2); margin-top: 5px;">
                💡 Clique com botão direito para mover pontos
            </div>
        `;
        legend.classList.remove('hidden');
    }

    showHeatLegend() {
        const legend = document.getElementById('mapLegend');
        const legendContent = document.getElementById('legendContent');
        legendContent.innerHTML = `
            <div style="margin-bottom: 5px;"><strong>Intensidade</strong></div>
            <div class="legend-heatmap"></div>
            <div style="display: flex; justify-content: space-between; font-size: 10px; margin-top: 3px;">
                <span>Baixa</span>
                <span>Alta</span>
            </div>
            <div style="font-size: 9px; color: var(--muted-2); margin-top: 5px;">
                ${this.actions.length} ações no total
            </div>
        `;
        legend.classList.remove('hidden');
    }

    refreshMap() {
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

    createPopupContent(action) {
        return `
            <div>
                <strong>${action.tipo}</strong><br>
                <small>${action.cidade} - ${action.bairro}</small><br>
                <small>${action.data}</small>
            </div>
        `;
    }

    generateCoordinates(cidade, bairro) {
        // Primeiro verifica se existe posição personalizada
        const customPos = this.getCustomPosition(cidade, bairro);
        if (customPos) {
            // Adiciona um pequeno deslocamento aleatório para não sobrepor pontos
            return {
                lat: customPos.lat + (Math.random() * 0.00005 - 0.000025), // ~2-5m de variação
                lng: customPos.lng + (Math.random() * 0.00005 - 0.000025)
            };
        }

        // Coordenadas aproximadas por cidade
        const cityCoordinates = {
            'Aracaju': { lat: -10.9111, lng: -37.0717 },
            'São Paulo': { lat: -23.5505, lng: -46.6333 },
            'Rio de Janeiro': { lat: -22.9068, lng: -43.1729 },
            'Salvador': { lat: -12.9714, lng: -38.5014 },
            'Belo Horizonte': { lat: -19.9167, lng: -43.9345 },
            'Fortaleza': { lat: -3.7319, lng: -38.5267 },
            'Brasília': { lat: -15.7797, lng: -47.9297 },
            'Recife': { lat: -8.0476, lng: -34.8770 },
            'Porto Alegre': { lat: -30.0346, lng: -51.2177 },
            'Curitiba': { lat: -25.4284, lng: -49.2733 },
            'Manaus': { lat: -3.1190, lng: -60.0217 },
            'Belém': { lat: -1.4554, lng: -48.4902 },
            'Goiânia': { lat: -16.6869, lng: -49.2648 },
            'Campinas': { lat: -22.9056, lng: -47.0608 },
            'São Luís': { lat: -2.5307, lng: -44.3068 },
            'Maceió': { lat: -9.6650, lng: -35.7353 },
            'Natal': { lat: -5.7793, lng: -35.2009 },
            'João Pessoa': { lat: -7.1195, lng: -34.8450 },
            'Florianópolis': { lat: -27.5954, lng: -48.5480 },
            'Vitória': { lat: -20.3155, lng: -40.3128 }
        };

        // Se temos coordenadas para a cidade, usa com variação aleatória
        if (cityCoordinates[cidade]) {
            const base = cityCoordinates[cidade];
            return {
                lat: base.lat + (Math.random() * 0.03 - 0.015), // Variação de ~1.5km
                lng: base.lng + (Math.random() * 0.03 - 0.015)
            };
        }

        // Fallback genérico para Brasil
        return {
            lat: -15 + (Math.random() * 30 - 15),
            lng: -50 + (Math.random() * 30 - 15)
        };
    }

    openModal() {
        const modal = document.getElementById('modalNovaAcao');
        modal.classList.add('show');
        modal.querySelector('select, input, textarea').focus();
    }

    closeModal() {
        const modal = document.getElementById('modalNovaAcao');
        const formNova = document.getElementById('formNovaAcao');
        modal.classList.remove('show');
        formNova.reset();

        // Reseta o filtro de bairros para o estado inicial
        this.showSelectCityMessage();
    }

    renderTable() {
        const tbody = document.getElementById('acoesTbody');
        tbody.innerHTML = '';

        this.actions.forEach(action => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${action.cidade}</td>
                <td>${action.bairro}</td>
                <td>${action.tipo}</td>
                <td>${action.data}</td>
                <td class="actions-cell">
                    <button class="btn-icon btn-edit tooltip" data-action="edit" data-id="${action.id}" data-tooltip="Editar">
                        <i data-lucide="edit-2"></i>
                    </button>
                    <button class="btn-icon btn-delete tooltip" data-action="delete" data-id="${action.id}" data-tooltip="Apagar">
                        <i data-lucide="trash-2"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Atualiza ícones do Lucide
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    handleTableClick(e) {
        const btn = e.target.closest('button');
        if (!btn) return;

        const action = btn.dataset.action;
        const id = parseInt(btn.dataset.id);

        if (action === 'delete') {
            this.deleteAction(id);
        } else if (action === 'edit') {
            this.editAction(id);
        }
    }

    editAction(id) {
        const action = this.actions.find(a => a.id === id);
        if (!action) return;

        // Preenche o modal com os dados da ação
        const form = document.getElementById('formNovaAcao');
        form.cidade.value = action.cidade;
        form.bairro.value = action.bairro;
        form.tipoAcao.value = action.tipo;
        form.descricao.value = action.descricao || '';
        form.responsavel.value = action.responsavel || '';
        form.contato.value = action.contato || '';

        // Atualiza os bairros baseados na cidade
        this.updateBairrosByCidade(action.cidade);

        // Converte data de dd/mm/yyyy para yyyy-mm-dd
        if (action.data && action.data.includes('/')) {
            const parts = action.data.split('/');
            form.dataAcao.value = `${parts[2]}-${parts[1]}-${parts[0]}`;
        } else {
            form.dataAcao.value = '';
        }

        // Abre o modal
        this.openModal();

        // Remove event listeners anteriores e adiciona um novo para edição
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        newForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateAction(id, newForm);
        });
    }

    // Métodos de exportação (MANTIDOS COMPLETOS)
    exportToPDF() {
        const { jsPDF } = window.jspdf;

        // Cria o documento PDF
        const doc = new jsPDF();

        // Cabeçalho do PDF
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text('Relatório de Ações', 105, 20, { align: 'center' });

        // Data de geração
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 105, 28, { align: 'center' });

        // Estatísticas
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        doc.text(`Total de Ações: ${this.actions.length}`, 14, 40);

        const cities = new Set(this.actions.map(action => action.cidade));
        const neighborhoods = new Set(this.actions.map(action => action.bairro));
        doc.text(`Cidades Ativas: ${cities.size}`, 14, 48);
        doc.text(`Bairros Cobertos: ${neighborhoods.size}`, 14, 56);

        // Tabela de ações
        const tableColumn = ["Cidade", "Bairro", "Tipo", "Data"];
        const tableRows = [];

        this.actions.forEach(action => {
            const actionData = [
                action.cidade,
                action.bairro,
                action.tipo,
                action.data
            ];
            tableRows.push(actionData);
        });

        // Adiciona a tabela
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 65,
            theme: 'grid',
            styles: {
                font: 'helvetica',
                fontSize: 10,
                cellPadding: 3,
                lineColor: [200, 200, 200],
                lineWidth: 0.1,
            },
            headStyles: {
                fillColor: [57, 104, 255],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245],
            },
            margin: { top: 10 },
        });

        // Rodapé
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Sistema de Gestão de Ações - Relatório gerado automaticamente', 105, finalY, { align: 'center' });

        // Salva o PDF
        doc.save(`relatorio-acoes-${new Date().toISOString().split('T')[0]}.pdf`);

        this.showNotification('PDF gerado com sucesso!', 'success');
    }

    exportToExcel() {
        // Prepara os dados
        const data = this.actions.map(action => ({
            'Cidade': action.cidade,
            'Bairro': action.bairro,
            'Tipo da Ação': action.tipo,
            'Data': action.data,
            'Latitude': action.lat,
            'Longitude': action.lng
        }));

        // Adiciona linha de estatísticas
        const cities = new Set(this.actions.map(action => action.cidade));
        const neighborhoods = new Set(this.actions.map(action => action.bairro));

        data.unshift({}); // Linha vazia
        data.unshift({
            'Cidade': `ESTATÍSTICAS`,
            'Bairro': `Total: ${this.actions.length} ações`,
            'Tipo da Ação': `${cities.size} cidades`,
            'Data': `${neighborhoods.size} bairros`
        });
        data.unshift({
            'Cidade': `RELATÓRIO DE AÇÕES`,
            'Bairro': `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
            'Tipo da Ação': '',
            'Data': ''
        });

        // Cria a worksheet
        const ws = XLSX.utils.json_to_sheet(data, { skipHeader: true });

        // Ajusta as larguras das colunas
        const wscols = [
            { wch: 15 }, // Cidade
            { wch: 20 }, // Bairro
            { wch: 25 }, // Tipo
            { wch: 12 }, // Data
            { wch: 12 }, // Latitude
            { wch: 12 }  // Longitude
        ];
        ws['!cols'] = wscols;

        // Formata o cabeçalho
        if (!ws['!merges']) ws['!merges'] = [];
        ws['!merges'].push(
            { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // Título
            { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }  // Estatísticas
        );

        // Adiciona estilos básicos (Excel não suporta CSS completo)
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let R = range.s.r; R <= range.e.r; R++) {
            for (let C = range.s.c; C <= range.e.c; C++) {
                const cell_address = { c: C, r: R };
                const cell_ref = XLSX.utils.encode_cell(cell_address);

                if (!ws[cell_ref]) continue;

                // Formata título
                if (R === 0) {
                    ws[cell_ref].s = {
                        font: { sz: 14, bold: true, color: { rgb: "FFFFFF" } },
                        fill: { fgColor: { rgb: "3968FF" } },
                        alignment: { horizontal: "center" }
                    };
                }
                // Formata estatísticas
                else if (R === 1) {
                    ws[cell_ref].s = {
                        font: { sz: 11, bold: true, color: { rgb: "3968FF" } },
                        fill: { fgColor: { rgb: "F0F4FF" } }
                    };
                }
                // Formata cabeçalho da tabela
                else if (R === 3) {
                    ws[cell_ref].s = {
                        font: { sz: 10, bold: true, color: { rgb: "FFFFFF" } },
                        fill: { fgColor: { rgb: "4AD6C1" } },
                        alignment: { horizontal: "center" }
                    };
                }
                // Formata dados
                else if (R > 3) {
                    ws[cell_ref].s = {
                        font: { sz: 9 },
                        border: {
                            top: { style: "thin", color: { rgb: "E0E0E0" } },
                            left: { style: "thin", color: { rgb: "E0E0E0" } },
                            bottom: { style: "thin", color: { rgb: "E0E0E0" } },
                            right: { style: "thin", color: { rgb: "E0E0E0" } }
                        }
                    };
                }
            }
        }

        // Cria o workbook e adiciona a worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Ações");

        // Salva o arquivo
        XLSX.writeFile(wb, `relatorio-acoes-${new Date().toISOString().split('T')[0]}.xlsx`);

        this.showNotification('Excel gerado com sucesso!', 'success');
    }
}

// ================= CONFIG GLOBAL =================
// Inicializa quando a página carrega
document.addEventListener('DOMContentLoaded', async function () {
    // Verifica se usuário está logado
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // Inicializa ícones do Lucide
    if (window.lucide) {
        lucide.createIcons();
    }

    // Inicializa o gerenciador de ações
    window.actionsManager = new ActionsManager();

    // ================= MENU E CONFIGURAÇÕES GLOBAIS =================

    // Navegação do menu (simples, carrega outras páginas)
    document.querySelectorAll('.menu-item').forEach(button => {
        button.addEventListener('click', () => {
            const page = button.dataset.page;
            // Se for a própria página "acoes", evita recarregar
            if (location.pathname.endsWith('/acoes.html') || location.pathname.endsWith('acoes.html')) {
                if (page === 'acoes' || page === '') return;
            }
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

    // MOBILE menu toggle
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
    if (storedName && profileName) profileName.textContent = storedName;
    if (storedToken && tokenShort) tokenShort.textContent = storedToken.slice(0, 12) + '…';
});

// Adiciona os estilos CSS para as animações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .leaflet-contextmenu {
        animation: fadeIn 0.2s ease;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    .contextmenu-item:hover {
        background: var(--menu-hover-bg) !important;
    }
`;
document.head.appendChild(style);