(() => {
  "use strict";

  let projects = [];
  const grid = document.querySelector("[data-project-grid]");
  const filters = document.querySelector("[data-filters]");
  const modal = document.querySelector("[data-project-modal]");
  const modalContent = document.querySelector("[data-modal-content]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  let lastFocusedElement = null;

  const escapeHtml = (value = "") => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const projectCard = (project) => `
    <article class="project-card ${project.featured ? "project-card-featured" : ""} accent-${escapeHtml(project.accent)} reveal" data-project-card data-category="${escapeHtml(project.category)}">
      <button class="project-hit" type="button" data-open-project="${escapeHtml(project.id)}" aria-label="Explorar ${escapeHtml(project.title)}"></button>
      <div class="project-topline">
        <span>${escapeHtml(project.order)}</span>
        <span class="project-status"><i></i>${escapeHtml(project.status)}</span>
      </div>
      <div class="project-art" aria-hidden="true">
        <span class="art-ring"></span><span class="art-block"></span><span class="art-code">${escapeHtml(project.order)}</span>
      </div>
      <div class="project-body">
        <p class="project-category">${escapeHtml(project.category)} · ${escapeHtml(project.year)}</p>
        <h3>${escapeHtml(project.title)}</h3>
        <p>${escapeHtml(project.summary)}</p>
        <div class="project-tags">${project.technologies.slice(0, 4).map((tech) => `<span>${escapeHtml(tech)}</span>`).join("")}</div>
        <div class="project-link">Explorar proyecto <span>↗</span></div>
      </div>
    </article>`;

  const renderProjects = (category = "Todos") => {
    if (!grid) return;
    const visible = category === "Todos" ? projects : projects.filter((project) => project.category === category);
    grid.innerHTML = visible.map(projectCard).join("");
    observeReveals(grid);
  };

  const renderFilters = () => {
    if (!filters) return;
    const categories = ["Todos", ...new Set(projects.map((project) => project.category))];
    filters.innerHTML = categories.map((category, index) => `
      <button type="button" class="filter-button ${index === 0 ? "is-active" : ""}" data-filter="${escapeHtml(category)}">${escapeHtml(category)}</button>
    `).join("");
  };

  const modalMarkup = (project) => {
    const externalLink = project.url
      ? `<a class="button button-primary" href="${escapeHtml(project.url)}" target="_blank" rel="noopener noreferrer">Visitar sitio <span>↗</span></a>`
      : `<span class="availability-note">${project.status === "Proyecto público" ? "URL pública por configurar" : "Caso de estudio · sin acceso público"}</span>`;

    return `
      <header class="modal-hero accent-${escapeHtml(project.accent)}">
        <p class="project-category">${escapeHtml(project.order)} · ${escapeHtml(project.category)} · ${escapeHtml(project.year)}</p>
        <h2 id="modal-title">${escapeHtml(project.title)}</h2>
        <p>${escapeHtml(project.subtitle)}</p>
        <div class="modal-actions">${externalLink}</div>
      </header>
      <div class="modal-body">
        <section><small>EL RETO</small><p>${escapeHtml(project.challenge)}</p></section>
        <section><small>LA SOLUCIÓN</small><p>${escapeHtml(project.solution)}</p></section>
        <section><small>MI PARTICIPACIÓN</small><p>${escapeHtml(project.role)}</p></section>
        <section class="modal-wide"><small>ALCANCE</small><div class="feature-list">${project.highlights.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div></section>
        <section class="modal-wide"><small>TECNOLOGÍAS</small><div class="project-tags project-tags-large">${project.technologies.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div></section>
      </div>`;
  };

  const openModal = (projectId) => {
    const project = projects.find((item) => item.id === projectId);
    if (!project || !modal || !modalContent) return;
    lastFocusedElement = document.activeElement;
    modalContent.innerHTML = modalMarkup(project);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    modal.querySelector(".modal-close")?.focus();
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    lastFocusedElement?.focus?.();
  };

  const observeReveals = (root = document) => {
    const items = root.querySelectorAll(".reveal:not(.is-visible)");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach((item) => observer.observe(item));
  };

  document.addEventListener("click", (event) => {
    const filter = event.target.closest("[data-filter]");
    if (filter) {
      document.querySelectorAll("[data-filter]").forEach((button) => button.classList.remove("is-active"));
      filter.classList.add("is-active");
      renderProjects(filter.dataset.filter);
      return;
    }

    const projectTrigger = event.target.closest("[data-open-project]");
    if (projectTrigger) openModal(projectTrigger.dataset.openProject);

    if (event.target.closest("[data-modal-close]")) closeModal();

    const navLink = event.target.closest("[data-nav] a");
    if (navLink && nav?.classList.contains("is-open")) {
      nav.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal?.classList.contains("is-open")) closeModal();
  });

  navToggle?.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    nav?.classList.toggle("is-open", !expanded);
  });

  const init = async () => {
    document.querySelector("[data-year]").textContent = String(new Date().getFullYear());
    observeReveals();

    try {
      const response = await fetch("data/projects.json");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      projects = await response.json();
      renderFilters();
      renderProjects();
    } catch (error) {
      console.error("No fue posible cargar los proyectos:", error);
      if (grid) {
        grid.innerHTML = `<p class="data-error">No fue posible cargar los proyectos. Verifica que el sitio se esté ejecutando desde un servidor web.</p>`;
      }
    }
  };

  init();
})();
