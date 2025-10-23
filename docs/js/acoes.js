// Sistema de gerenciamento de ações
class ActionsManager {
    constructor() {
        this.actions = this.loadInitialData();
        this.map = null;
        this.currentMarkers = [];
        this.heatLayer = null;
        this.currentView = 'calor';
        this.nextId = this.actions.length > 0 ? Math.max(...this.actions.map(a => a.id)) + 1 : 1;
        
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

    init() {
        this.initMap();
        this.initCityFilter();
        this.initEventListeners();
        this.renderTable();
        this.updateCounters();
        this.refreshMap();
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
            
            this.currentMarkers.push(marker);
        });
        
        this.fitMapToBounds();
        this.showLegend('Pontos de Ação', 'var(--primary-1)');
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
        switch(this.currentView) {
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

    handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        
        const cidade = form.cidade.value || '-';
        const bairro = form.bairro.value || '-';
        const tipo = form.tipoAcao.value || '-';
        const data = form.dataAcao.value;
        
        // Validação adicional
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
            id: this.nextId++,
            cidade: cidade,
            bairro: bairro,
            tipo: tipo,
            data: dataFmt,
            lat: coords.lat,
            lng: coords.lng
        };

        // Adiciona aos dados
        this.actions.unshift(newAction);

        // Atualiza a interface
        this.renderTable();
        this.updateCounters();
        this.refreshMap();
        this.closeModal();

        console.log('Nova ação adicionada:', newAction);
        console.log('Total de ações:', this.actions.length);
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

    deleteAction(id) {
        if (confirm('Excluir esta ação?')) {
            this.actions = this.actions.filter(action => action.id !== id);
            this.renderTable();
            this.updateCounters();
            this.refreshMap();
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

    updateAction(id, form) {
        const cidade = form.cidade.value || '-';
        const bairro = form.bairro.value || '-';
        const tipo = form.tipoAcao.value || '-';
        const data = form.dataAcao.value;

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

        // Atualiza a ação
        const actionIndex = this.actions.findIndex(a => a.id === id);
        if (actionIndex !== -1) {
            this.actions[actionIndex] = {
                ...this.actions[actionIndex],
                cidade: cidade,
                bairro: bairro,
                tipo: tipo,
                data: dataFmt
            };

            // Atualiza a interface
            this.renderTable();
            this.refreshMap();
            this.closeModal();
        }
    }

    updateCounters() {
        const totalActions = this.actions.length;
        document.getElementById('totalActions').textContent = totalActions;

        // Contar cidades únicas
        const cities = new Set(this.actions.map(action => action.cidade));
        document.getElementById('activeCities').textContent = cities.size;

        // Contar bairros únicos
        const neighborhoods = new Set(this.actions.map(action => action.bairro));
        document.getElementById('coveredNeighborhoods').textContent = neighborhoods.size;
    }
}

// ================= CONFIG GLOBAL =================
// Inicializa quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
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