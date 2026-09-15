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

  const safeUrl = (value = "") => {
    if (!value) return "";
    try {
      const url = new URL(value, window.location.origin);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  };

  const projectVisual = (project) => {
    if (project.preview) {
      return `<div class="project-preview project-preview-image"><img src="${escapeHtml(project.preview)}" alt="" loading="lazy"></div>`;
    }
    if (project.previewKind === "split") {
      return `<div class="project-preview project-preview-split" aria-hidden="true">
        <div><small>SITIO 01</small><strong>Cotizaciones</strong><span>Formulario · folios · medición</span></div>
        <div><small>SITIO 02</small><strong>Subdistribuidores</strong><span>Operación · integración · datos</span></div>
      </div>`;
    }
    if (project.previewKind === "codeus") {
      return `<div class="project-preview project-preview-codeus" aria-hidden="true">
        <div class="mini-browser"><span></span><span></span><span></span><b>CODEUS · SORN</b></div>
        <div class="codeus-message">IA <i>→</i> clasifica <i>→</i> canaliza</div>
        <div class="codeus-nodes"><span>Ventas</span><span>Soporte</span><span>Atención</span></div>
      </div>`;
    }
    return `<div class="project-preview project-preview-modules" aria-hidden="true">
      <span>Inventario</span><span>CRM</span><span>Traspasos</span><span>Agenda</span><span>Automatización</span>
    </div>`;
  };

  const projectCard = (project) => `
    <article class="project-card ${project.featured ? "project-card-featured" : ""} accent-${escapeHtml(project.accent)} reveal" data-category="${escapeHtml(project.category)}">
      <button class="project-hit" type="button" data-open-project="${escapeHtml(project.id)}" aria-label="Ver ${escapeHtml(project.title)}"></button>
      <div class="project-topline">
        <span>${escapeHtml(project.order)}</span>
        <span class="project-status"><i></i>${escapeHtml(project.status)}</span>
      </div>
      ${projectVisual(project)}
      <div class="project-body">
        <p class="project-category">${escapeHtml(project.category)} · ${escapeHtml(project.year)}</p>
        <h3>${escapeHtml(project.title)}</h3>
        <p>${escapeHtml(project.summary)}</p>
        <div class="project-tags">${project.technologies.slice(0,4).map((tech) => `<span>${escapeHtml(tech)}</span>`).join("")}</div>
        <div class="project-link">Ver proyecto <span>→</span></div>
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

  const galleryMarkup = (project) => {
    if (!project.gallery?.length) return "";
    return `<section class="modal-wide gallery-section">
      <small>RECORRIDO DEL PROYECTO</small>
      <div class="case-gallery">
        ${project.gallery.map((item, index) => `<figure class="case-shot ${index === 0 ? "case-shot-lead" : ""}">
          <div class="case-image"><img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.title)}" loading="lazy"></div>
          <figcaption><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.text)}</p></div></figcaption>
        </figure>`).join("")}
      </div>
    </section>`;
  };

  const variantContent = (variant) => {
    const url = safeUrl(variant.url);
    return `<div class="variant-panel">
      <div>
        <p class="variant-kicker">${escapeHtml(variant.label)}</p>
        <h3>${escapeHtml(variant.title)}</h3>
        <p>${escapeHtml(variant.text)}</p>
      </div>
      <div class="variant-role"><small>MI PARTICIPACIÓN</small><p>${escapeHtml(variant.role)}</p></div>
      <div class="project-tags project-tags-large">${variant.technologies.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
      ${url ? `<a class="button button-primary" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Visitar sitio <span>↗</span></a>` : ""}
    </div>`;
  };

  const variantsMarkup = (project) => {
    if (!project.variants?.length) return "";
    return `<section class="modal-wide variants-section">
      <small>SITIOS PUBLICADOS</small>
      <div class="variant-tabs" role="tablist" aria-label="Sitios de ${escapeHtml(project.title)}">
        ${project.variants.map((variant, index) => `<button type="button" role="tab" aria-selected="${index === 0}" class="variant-tab ${index === 0 ? "is-active" : ""}" data-variant-project="${escapeHtml(project.id)}" data-variant-id="${escapeHtml(variant.id)}">${escapeHtml(variant.label)}</button>`).join("")}
      </div>
      <div data-variant-content>${variantContent(project.variants[0])}</div>
    </section>`;
  };

  const modulesMarkup = (project) => {
    if (!project.modules?.length) return "";
    return `<section class="modal-wide modules-section">
      <small>ÁREAS IMPLEMENTADAS</small>
      <div class="module-grid">${project.modules.map((module) => `<article><strong>${escapeHtml(module.title)}</strong><p>${escapeHtml(module.text)}</p></article>`).join("")}</div>
    </section>`;
  };

  const modalMarkup = (project) => {
    const url = safeUrl(project.url);
    const access = url
      ? `<a class="button button-primary" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Visitar sitio <span>↗</span></a>`
      : project.variants?.length ? "" : `<span class="availability-note">${project.status.includes("intern") || project.status === "Sistema interno" ? "Caso de proyecto · sin acceso público" : "Implementación interna"}</span>`;

    return `
      <header class="modal-hero accent-${escapeHtml(project.accent)}">
        <p class="project-category">${escapeHtml(project.order)} · ${escapeHtml(project.category)} · ${escapeHtml(project.year)}</p>
        <h2 id="modal-title">${escapeHtml(project.title)}</h2>
        <p>${escapeHtml(project.subtitle)}</p>
        <div class="modal-actions">${access}</div>
      </header>
      <div class="modal-body">
        <section><small>RESUMEN</small><p>${escapeHtml(project.overview)}</p></section>
        <section><small>MI PARTICIPACIÓN</small><p>${escapeHtml(project.role)}</p></section>
        ${variantsMarkup(project)}
        ${galleryMarkup(project)}
        ${modulesMarkup(project)}
        <section class="modal-wide"><small>ALCANCE</small><div class="feature-list">${project.highlights.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div></section>
        <section class="modal-wide"><small>TECNOLOGÍAS Y HERRAMIENTAS</small><div class="project-tags project-tags-large">${project.technologies.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div></section>
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
    }, { threshold: 0.1 });
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
    if (projectTrigger) {
      openModal(projectTrigger.dataset.openProject);
      return;
    }

    const variantTab = event.target.closest("[data-variant-id]");
    if (variantTab) {
      const project = projects.find((item) => item.id === variantTab.dataset.variantProject);
      const variant = project?.variants?.find((item) => item.id === variantTab.dataset.variantId);
      if (!variant) return;
      modalContent.querySelectorAll(".variant-tab").forEach((tab) => {
        const active = tab === variantTab;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
      });
      const target = modalContent.querySelector("[data-variant-content]");
      if (target) target.innerHTML = variantContent(variant);
      return;
    }

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
    const year = document.querySelector("[data-year]");
    if (year) year.textContent = String(new Date().getFullYear());
    observeReveals();
    try {
      const response = await fetch("data/projects.json");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      projects = await response.json();
      renderFilters();
      renderProjects();
    } catch (error) {
      console.error("No fue posible cargar los proyectos:", error);
      if (grid) grid.innerHTML = `<p class="data-error">No fue posible cargar los proyectos.</p>`;
    }
  };

  init();
})();
