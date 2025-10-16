// ----------------------
// Pega cores do CSS
// ----------------------
const rootStyles = getComputedStyle(document.documentElement);

const COLOR_GREEN = rootStyles.getPropertyValue('--color-green').trim();
const COLOR_BLUE = rootStyles.getPropertyValue('--color-blue').trim();
const COLOR_RED = rootStyles.getPropertyValue('--color-red').trim();
const COLOR_CYAN = rootStyles.getPropertyValue('--color-cyan').trim();
const COLOR_TEXT = rootStyles.getPropertyValue('--color-text').trim();       // texto padrão


// ----------------------
// Funções para inicializar gráficos
// ----------------------

// Status das Tarefas (Doughnut)
function initStatusChart() {
  const chart = echarts.init(document.getElementById('statusChart'));
  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)', textStyle: { color: COLOR_TEXT } },
    series: [{
      type: 'pie',
      radius: ['30%', '100%'],
      center: ['50%', '50%'],
      label: { show: false, color: COLOR_TEXT },
      labelLine: { show: false },
      data: [
        { value: 6, name: 'Concluído', itemStyle: { color: COLOR_GREEN } },
        { value: 5, name: 'Em andamento', itemStyle: { color: COLOR_BLUE } },
        { value: 4, name: 'A fazer', itemStyle: { color: COLOR_RED } }
      ]
    }]
  });
  return chart;
}

// Tarefas por Responsável (Bar)
function initRespChart() {
  const chart = echarts.init(document.getElementById('responsavelChart'));
  chart.setOption({
    grid: { top: 20, bottom: 100, left: 40, right: 20 },
    xAxis: {
      type: 'category',
      data: ['Maria Costas', 'João Lima', 'Paulo Santos', 'Ana Rocha'],
      axisLine: { lineStyle: { color: '#999' } },
      axisLabel: { fontWeight: '600' }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#eee' } }
    },
    series: [{
      type: 'bar',
      data: [3, 4, 5, 2],
      itemStyle: { borderRadius: [8, 8, 0, 0], color: COLOR_BLUE },
      barWidth: 40
    }],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: params => `${params[0].name}: ${params[0].value} tarefas`
    }
  });
  return chart;
}

// Progresso de Tarefas (Bar)
function initProgChart() {
  const chart = echarts.init(document.getElementById('progressoChart'));
  chart.setOption({
    grid: { top: 30, bottom: 100, left: 40, right: 20 },
    legend: { bottom: 50, textStyle: { fontSize: 13 } },
    xAxis: {
      type: 'category',
      data: ['Abril', 'Maio', 'Junho', 'Julho', 'Agosto'],
      axisLine: { lineStyle: { color: '#999' } },
      axisLabel: { fontWeight: '600' }
    },
    yAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: '#eee' } } },
    series: [
      { name: 'Tarefas concluídas', type: 'bar', data: [0, 0, 0, 10, 0], itemStyle: { color: COLOR_GREEN, borderRadius: [4, 4, 0, 0] }, barWidth: 20 },
      { name: 'Novas tarefas', type: 'bar', data: [0, 0, 0, 15, 5], itemStyle: { color: COLOR_RED, borderRadius: [4, 4, 0, 0] }, barWidth: 20 }
    ],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: params => {
        let txt = `<b>${params[0].name}</b><br/>`;
        params.forEach(p => txt += `${p.marker} ${p.seriesName}: ${p.value}<br/>`);
        return txt;
      }
    }
  });
  return chart;
}

// Distribuição por Sexo (Pie)
function initSexoChart() {
  const chart = echarts.init(document.getElementById('sexoChart'));
  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    series: [{
      type: 'pie',
      radius: ['0%', '70%'],
      center: ['50%', '38%'],
      avoidLabelOverlap: true,
      label: { show: false },
      labelLine: { show: false },
      data: [
        { value: 70, name: 'Masculino', itemStyle: { color: COLOR_BLUE } },
        { value: 30, name: 'Feminino', itemStyle: { color: COLOR_RED } }
      ]
    }]
  });
  return chart;
}

// Distribuição por Idade (Bar)
function initIdadeChart() {
  const chart = echarts.init(document.getElementById('idadeChart'));
  chart.setOption({
    xAxis: {
      type: 'category',
      data: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
      axisLine: { lineStyle: { color: '#999' } },
      axisLabel: { fontWeight: '600' }
    },
    yAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: '#eee' } } },
    series: [{
      type: 'bar',
      data: [0, 4, 3, 1, 1, 1],
      itemStyle: { color: COLOR_BLUE, borderRadius: [4, 4, 0, 0] },
      barWidth: 70
    }],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: params => {
        let txt = `<b>${params[0].name}</b><br/>`;
        params.forEach(p => { txt += `${p.marker} ${p.seriesName || ''}: ${p.value}<br/>`; });
        return txt;
      }
    }
  });
  return chart;
}

// ----------------------
// Função para inicializar mapa
// ----------------------
function initMap() {
  const map = L.map('map').setView([-10.947, -37.072], 16);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

  const acoes = [
    { lat: -10.946, lng: -37.074, num: 1 },
    { lat: -10.948, lng: -37.071, num: 2 },
    { lat: -10.949, lng: -37.073, num: 3 },
    { lat: -10.945, lng: -37.070, num: 4 },
    { lat: -10.947, lng: -37.069, num: 5 }
  ];

  acoes.forEach(acao => {
    const el = L.divIcon({ className: 'action-marker', html: acao.num, iconSize: [36, 36] });
    L.marker([acao.lat, acao.lng], { icon: el }).addTo(map);
  });

  document.getElementById('actionCounter').textContent = `${acoes.length} ações cadastradas`;

  window.addEventListener('resize', () => map.invalidateSize());
  return map;
}

// ----------------------
// Inicialização
// ----------------------
const statusChart = initStatusChart();
const respChart = initRespChart();
const progChart = initProgChart();
const sexoChart = initSexoChart();
const idadeChart = initIdadeChart();
const map = initMap();

// Responsividade dos gráficos
window.addEventListener('resize', () => {
  statusChart.resize();
  respChart.resize();
  progChart.resize();
  sexoChart.resize();
  idadeChart.resize();
});
