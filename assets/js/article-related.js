(async function () {
  const listEl = document.querySelector("[data-related-articles]");
  if (!listEl) return;

  const pathParts = window.location.pathname.replace(/\/$/, "").split("/");
  const currentSlug = pathParts[pathParts.length - 1];

  const hubsRes = await fetch("/assets/data/fi-articles.json");
  const hubs = await hubsRes.json();

  let currentHub = null;

  for (const hub of Object.values(hubs)) {
    if (hub.articles?.includes(currentSlug)) {
      currentHub = hub;
      break;
    }
  }

  if (!currentHub) return;

  const relatedSlugs = currentHub.articles
    .filter(slug => slug !== currentSlug)
    .slice(0, 6);

  const items = await Promise.all(
    relatedSlugs.map(async slug => {
      try {
        const res = await fetch(`/articles/${slug}/`);
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, "text/html");
        const title =
          doc.querySelector("h1")?.textContent?.trim() ||
          slug.replace(/-/g, " ");
        return { slug, title };
      } catch {
        return { slug, title: slug.replace(/-/g, " ") };
      }
    })
  );

  listEl.innerHTML = items
    .map(
      ({ slug, title }) =>
        `<li><a href="/articles/${slug}/">${title}</a></li>`
    )
    .join("");
})();
