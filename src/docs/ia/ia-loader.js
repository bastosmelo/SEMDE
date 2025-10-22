// ia-loader.js
(function () {
  // ====== Evita duplicação ======
  if (window.__IA_LOADED__) return;
  window.__IA_LOADED__ = true;

  // ====== Detecta caminho base ======
  // Exemplo: se a página está em /pages/dashboard.html e o loader em /ia-loader.js,
  // ele ajusta automaticamente os caminhos para ../
  const scripts = document.getElementsByTagName("script");
  const currentScript = scripts[scripts.length - 1];
  const base = currentScript.src.substring(0, currentScript.src.lastIndexOf("/") + 1);

  // ====== Função utilitária: carregar CSS ======
  function loadCSS(href) {
    return new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  // ====== Função utilitária: carregar JS ======
  function loadJS(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  // ====== Injeta o HTML da IA ======
  function injectIA() {
    const html = `
      <!-- Mascote fixo -->
      <div id="iaMascote" class="mascote normal">
        <img src="${base}parado.png" alt="Mascote Assistente">
      </div>

      <div id="ia-root" aria-live="polite">
        <div class="ia-widget" role="dialog" aria-label="Assistente virtual">
          <div class="ia-header">
            <img src="${base}icon.png" alt="Rosto da assistente" class="ia-face">
            <div class="ia-title">Assistente</div>
          </div>

          <div class="ia-chat" id="iaChat" aria-atomic="true" aria-relevant="additions"></div>

          <div id="iaOptions" class="ia-options" style="display:none"></div>

          <div class="ia-input">
            <input id="iaInput" type="text" placeholder="Pergunte algo..." aria-label="Digite sua mensagem">
            <button id="iaSend" aria-label="Enviar mensagem">Enviar</button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML("beforeend", html);
  }

  // ====== Fluxo principal ======
  async function init() {
    try {
      await loadCSS(base + "ia.css"); // garante que o estilo entra primeiro
      injectIA();
      await loadJS(base + "ia.js");   // só depois carrega o script principal
      console.log("✅ IA carregada com sucesso.");
    } catch (err) {
      console.error("❌ Erro ao carregar IA:", err);
    }
  }

  // Espera o DOM carregar
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(init, 10);
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
