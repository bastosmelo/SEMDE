// Espera lucide carregar e inicializa ícones
window.addEventListener('load', () => {
  if (window.lucide) lucide.createIcons();
});


// Navegação do menu (simples, carrega outras páginas)
document.querySelectorAll('.menu-item').forEach(button => {
  button.addEventListener('click', () => {
    const page = button.dataset.page;
    window.location.href = `${page}.html`;
  });
});


// CONFIG
const API_LOGIN_URL = "http://127.0.0.1:8000/login";
const USE_BACKEND = true;


const authCard = document.getElementById("authCard");
const loginForm = document.getElementById("loginForm");
const authAlert = document.getElementById("authAlert");
const dashboardScreen = document.getElementById("dashboardScreen");
const logoutBtn = document.getElementById("logoutBtn");
const profileName = document.getElementById("profileName");
const tokenShort = document.getElementById("tokenShort");
const bairrosTable = document.getElementById("bairrosTable");
const actionCounter = document.getElementById("actionCounter");
const themeToggle = document.getElementById("themeToggle");
const themeLabel = document.getElementById("themeLabel");


const demo = {
  bairros: [
    ["Eduardo Gomes", 2, "20%"], ["Atalaia", 2, "20%"], ["Centro", 1, "10%"], ["Jabotiana", 1, "10%"],
    ["Ponto Novo", 1, "10%"], ["Infácio Barbosa", 1, "10%"], ["Conjunto João Alves", 1, "10%"], ["Farolândia", 1, "10%"]
  ],
  totalActions: 8,
  charts: {
    status: { labels: ["Concluído", "Em andamento", "A fazer"], values: [6, 5, 4] },
    responsible: { labels: ["Arthur", "Bruno", "Davi", "Gabriel"], values: [5, 4, 3, 3] }
  }
};


function showAlert(msg, isError = true) {
  authAlert.textContent = msg;
  authAlert.style.display = "block";
  authAlert.style.color = isError ? "#9b1c1c" : "#064e3b";
  setTimeout(() => authAlert.style.display = "none", 5000);
}


function showDashboard(token, userName) {
  profileName.textContent = userName || "Usuário";
  tokenShort.textContent = token ? token.slice(0, 12) + "…" : "—";
  bairrosTable.innerHTML = "";
  demo.bairros.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td>`;
    bairrosTable.appendChild(tr);
  });
  actionCounter.textContent = `${demo.totalActions} ações cadastradas`;


  authCard.classList.add("hidden");
  dashboardScreen.classList.remove("hidden");
  dashboardScreen.classList.add("fade-in");
  dashboardScreen.removeAttribute("aria-hidden");

  // Recriar os gráficos após mostrar o dashboard
  setTimeout(createCharts, 100);

  setTimeout(createActionMap, 100);

}


function showLogin() {
  dashboardScreen.classList.add("hidden");
  dashboardScreen.setAttribute("aria-hidden", "true");
  authCard.classList.remove("hidden");
  localStorage.removeItem("token");
  localStorage.removeItem("name");
}


logoutBtn.addEventListener("click", () => {
  showLogin();
});


// THEME: lê preferencia e aplica
const savedTheme = localStorage.getItem("theme"); // "dark" | "light"
function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
    themeToggle.setAttribute("aria-pressed", "true");
    themeLabel.textContent = "Claro";
  } else {
    document.documentElement.classList.remove("dark");
    themeToggle.setAttribute("aria-pressed", "false");
    themeLabel.textContent = "Escuro";
  }
  localStorage.setItem("theme", theme);
}
// aplicar tema salvo (prioridade)
if (savedTheme) applyTheme(savedTheme);
else {
  // detect system preference
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark ? "dark" : "light");
}


themeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.classList.contains("dark");
  applyTheme(isDark ? "light" : "dark");
});


window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name");
  if (token) {
    showDashboard(token, name);
  } else {
    showLogin();
  }
});


loginForm.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  authAlert.style.display = "none";


  const email = loginForm.email.value.trim();
  const senha = loginForm.senha.value;


  if (!email || !senha) { showAlert("Preencha e-mail e senha."); return; }


  const btn = document.getElementById("loginBtn");
  const prevText = btn.textContent;
  btn.textContent = "Validando...";
  btn.disabled = true;


  if (USE_BACKEND) {
    try {
      const resp = await fetch(API_LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha })
      });


      if (!resp.ok) {
        if (resp.status === 401) showAlert("E-mail ou senha incorretos.");
        else showAlert(`Erro no servidor: ${resp.status}`);
        btn.textContent = prevText; btn.disabled = false; return;
      }


      const data = await resp.json();
      const token = data.access_token || data.token || null;
      const name = data.name || data.usuario || email.split("@")[0];


      if (!token) { showAlert("Resposta do servidor inválida (token ausente)."); btn.textContent = prevText; btn.disabled = false; return; }


      localStorage.setItem("token", token);
      localStorage.setItem("name", name);
      showDashboard(token, name);
      btn.textContent = prevText; btn.disabled = false;
    } catch (err) {
      console.warn("Erro backend:", err);
      showAlert("Falha na conexão com o servidor — usando modo demo.", false);
      if ((email === "admin@demo.com" && senha === "demo123") || (email === "user@demo.com" && senha === "user123")) {
        const demoToken = "demo-token-1234567890";
        localStorage.setItem("token", demoToken);
        localStorage.setItem("name", email.split("@")[0]);
        showDashboard(demoToken, email.split("@")[0]);
      } else {
        showAlert("Não foi possível validar: verifique suas credenciais (modo demo usa admin@demo.com/demo123).");
      }
      btn.textContent = prevText; btn.disabled = false;
    }
  } else {
    if ((email === "admin@demo.com" && senha === "demo123") || (email === "user@demo.com" && senha === "user123")) {
      const demoToken = "local-demo-token-abcdef";
      localStorage.setItem("token", demoToken);
      localStorage.setItem("name", email.split("@")[0]);
      showDashboard(demoToken, email.split("@")[0]);
    } else {
      showAlert("Credenciais inválidas em modo local.");
    }
    btn.textContent = prevText; btn.disabled = false;
  }
});


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


// Charts
function createCharts() {
  try {
    const ctx1 = document.getElementById("statusChartCanvas").getContext("2d");
    new Chart(ctx1, {
      type: 'doughnut',
      data: { labels: demo.charts.status.labels, datasets: [{ data: demo.charts.status.values }] },
      options: { plugins: { legend: { position: 'bottom' } }, maintainAspectRatio: false }
    });
    const ctx2 = document.getElementById("responsibleChartCanvas").getContext("2d");
    new Chart(ctx2, { type: 'bar', data: { labels: demo.charts.responsible.labels, datasets: [{ label: 'Tarefas', data: demo.charts.responsible.values }] }, options: { plugins: { legend: { display: false } }, maintainAspectRatio: false } });
  } catch (e) { console.warn("Charts failed:", e); }
}

function createActionMap() {
  const mapContainer = document.getElementById('actionMap');
  if (!mapContainer) return;

  const centerLat = -10.9091;
  const centerLng = -37.0678;

  const map = L.map('actionMap').setView([centerLat, centerLng], 12);

  // Mapa estilo "light" bem clean
  L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map);

  // Remove controles
  map.removeControl(map.zoomControl);
  map.removeControl(map.attributionControl);

  // Ícone azul personalizado
  const blueIcon = L.divIcon({
    className: 'blue-marker',
    html: '<div style="background: #ff3939ff; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });

  const actionPoints = [
    { lat: -10.9091, lng: -37.0678, title: 'Centro - 3 ações' },
    { lat: -10.9175, lng: -37.0500, title: 'Zona Norte - 2 ações' },
    { lat: -10.9000, lng: -37.0550, title: 'Zona Leste - 1 ação' },
    { lat: -10.9200, lng: -37.0800, title: 'Zona Sul - 4 ações' },
    { lat: -10.9150, lng: -37.0900, title: 'Zona Oeste - 2 ações' },
    { lat: -10.8900, lng: -37.0400, title: 'Região Metropolitana - 1 ação' }
  ];

  // Adiciona marcadores azuis
  actionPoints.forEach(point => {
    L.marker([point.lat, point.lng], { icon: blueIcon })
      .addTo(map)
      .bindPopup(point.title);
  });

  const group = new L.featureGroup(actionPoints.map(p => L.marker([p.lat, p.lng])));
  map.fitBounds(group.getBounds().pad(0.1));
}