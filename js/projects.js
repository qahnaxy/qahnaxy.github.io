document.addEventListener("DOMContentLoaded", async () => {
  const carousel = document.querySelector('[data-carousel-container="projects"]');
  if (!carousel) return;

  try {
    const response = await fetch("db/projects.json");

    if (!response.ok) {
      throw new Error(`Failed to load projects.json: ${response.status}`);
    }

    const projects = await response.json();

    projects.forEach((project) => {
      const card = document.createElement("div");

      card.className = "project-card w-full md:w-[calc((100%-3rem)/3)] bg-slate-50 border border-slate-200/60 rounded-2xl flex-none cursor-pointer shrink-0 transition-all hover:border-primary/30 shadow-[0_18px_45px_rgba(15,23,42,0.16)] hover:shadow-[0_24px_60px_rgba(15,23,42,0.24)] group";

      card.dataset.project = project.id;

      card.innerHTML = `
        <div class="overflow-hidden rounded-t-2xl">
          <img src="${project.image}" alt="${project.title}" class="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
        <div class="p-6">
          <h3 class="font-display font-semibold text-2xl tracking-tight text-slate-900 group-hover:text-primary transition-colors">${project.title}</h3>
          <p class="text-lg leading-relaxed text-slate-500 mt-3">
            ${project.description}
          </p>
        </div>
      `;

      carousel.appendChild(card);
    });

    document.dispatchEvent(new CustomEvent("projectsLoaded"));
  } catch (error) {
    console.error("Projects could not be loaded:", error);
  }
});