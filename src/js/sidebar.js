// Recuperar tema e fundo salvos
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("selectedTheme");
    const savedSidebarBg = localStorage.getItem("sidebarBg");

    if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);

    // Carregar sidebar
    fetch("../z-extras/sidebar.html")
        .then(response => response.text())
        .then(data => {
            const container = document.getElementById("sidebar-container");
            container.innerHTML = data;

            // Inicializar scripts do sidebar e mobile
            initSidebarScripts();

            // Aplicar fundo salvo agora que o sidebar existe
            if (savedSidebarBg === "true") {
                const sidebar = document.querySelector(".sidebar");
                const btn = document.getElementById("sidebarBgBtn");

                sidebar.classList.add("with-bg");
                btn?.classList.add("active");
            }
        });
});

// Função para aplicar fundo da sidebar
function applySidebarBg(enabled) {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;
    if (enabled) sidebar.classList.add("with-bg");
    else sidebar.classList.remove("with-bg");
    localStorage.setItem("sidebarBg", enabled ? "true" : "false");
}

// Função para aplicar tema
function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("selectedTheme", theme);
}

// Inicializar scripts do sidebar e menu mobile
function initSidebarScripts() {
    const overlay = document.getElementById("themeOverlay");
    const sidebarBtn = document.getElementById("sidebarBgBtn");

    // --- BOTÃO DE TEMAS ---
    const openBtn = document.getElementById("openThemes");       // sidebar (PC)
    const openBtnMobile = document.getElementById("openThemesMobile"); // mobile
    const closeBtn = document.getElementById("closeThemes");

    function openThemeOverlay() {
        overlay.classList.add("active");
        overlay.setAttribute("aria-hidden", "false");
    }

    openBtn?.addEventListener("click", e => {
        e.preventDefault();
        openThemeOverlay();
    });

    openBtnMobile?.addEventListener("click", e => {
        e.preventDefault();
        openThemeOverlay();
    });

    closeBtn?.addEventListener("click", () => {
        overlay.classList.remove("active");
        overlay.setAttribute("aria-hidden", "true");
    });

    overlay?.addEventListener("click", (e) => {
        if (e.target === overlay) {
            overlay.classList.remove("active");
            overlay.setAttribute("aria-hidden", "true");
        }
    });

    // Aplicar tema ao clicar em um item
    document.addEventListener("click", (e) => {
        const item = e.target.closest(".theme-item");
        if (item) {
            const theme = item.getAttribute("data-theme");
            if (theme) {
                applyTheme(theme);
                overlay.classList.remove("active");
                overlay.setAttribute("aria-hidden", "true");
            }
        }
    });

    // Toggle do fundo da sidebar
    sidebarBtn?.addEventListener("click", () => {
        const enabled = !sidebarBtn.classList.contains("active");
        sidebarBtn.classList.toggle("active", enabled);
        applySidebarBg(enabled);
    });

    // --- MENU MOBILE ---
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const mobileMenu = document.getElementById("mobileMenu");
    const closeMobile = document.getElementById("closeMobile");

    hamburgerBtn?.addEventListener("click", () => {
        mobileMenu.classList.add("active");
    });

    closeMobile?.addEventListener("click", () => {
        mobileMenu.classList.remove("active");
    });

    // Fechar menu mobile ao clicar em qualquer link
    mobileMenu?.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            mobileMenu.classList.remove("active");
        });
    });
}
